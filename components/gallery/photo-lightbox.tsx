"use client";

/* Signed Supabase URLs are private and dynamic, so native loading is intentional. */
/* eslint-disable @next/next/no-img-element */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { ArrowLeftIcon, XIcon } from "@/components/ui/icons";
import type { MemoryPhoto } from "@/types/memory";

type LightboxContextValue = { open(photoId: string): void; title: string };
const LightboxContext = createContext<LightboxContextValue | null>(null);

/** Null outside a provider, so galleries elsewhere stay plain. */
export function useLightbox() {
  return useContext(LightboxContext);
}

export function PhotoLightboxProvider({
  children,
  photos,
  title,
}: {
  children: ReactNode;
  photos: readonly MemoryPhoto[];
  title: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const open = useCallback(
    (photoId: string) => {
      const index = photos.findIndex((photo) => photo.id === photoId);
      if (index >= 0) setOpenIndex(index);
    },
    [photos],
  );
  return (
    <LightboxContext.Provider value={{ open, title }}>
      {children}
      {openIndex !== null && photos.length > 0 ? (
        <PhotoLightbox
          onClose={() => setOpenIndex(null)}
          photos={photos}
          startIndex={Math.min(openIndex, photos.length - 1)}
          title={title}
        />
      ) : null}
    </LightboxContext.Provider>
  );
}

const MAX_SCALE = 4;
const DOUBLE_TAP_MS = 280;

type View = { scale: number; x: number; y: number };
type Point = { x: number; y: number };
type Gesture =
  | { kind: "pending" | "swipe" | "dismiss" | "pan"; start: Point; startedAt: number; origin: View; afterPinch?: boolean }
  | { kind: "pinch"; distance: number; mid: Point; origin: View };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Viewport point → offset from the stage centre (the zoom origin). */
function toStage(stage: HTMLElement | null, point: Point): Point {
  const area = stage?.getBoundingClientRect();
  return area ? { x: point.x - area.left - area.width / 2, y: point.y - area.top - area.height / 2 } : point;
}

function PhotoLightbox({
  onClose,
  photos,
  startIndex,
  title,
}: {
  onClose(): void;
  photos: readonly MemoryPhoto[];
  startIndex: number;
  title: string;
}) {
  const [index, setIndex] = useState(startIndex);
  const [chrome, setChrome] = useState(true);
  const [zoomed, setZoomed] = useState(false);
  const [closing, setClosing] = useState(false);
  const [failed, setFailed] = useState<ReadonlySet<string>>(() => new Set());
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const layers = useRef(new Map<number, HTMLDivElement>());
  const view = useRef<View>({ scale: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<Gesture | null>(null);
  const lastTap = useRef<{ at: number; point: Point } | null>(null);
  const tapTimer = useRef<number | undefined>(undefined);
  const indexRef = useRef(index);
  const count = photos.length;
  const photo = photos[index];

  const close = useCallback(() => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(onClose, prefersReducedMotion() ? 0 : 180);
  }, [closing, onClose]);

  /* ── Zoom helpers (imperative: they run on every pointer move) ── */
  const currentLayer = useCallback(() => layers.current.get(indexRef.current), []);
  const bounds = useCallback((scale: number) => {
    const image = currentLayer()?.querySelector<HTMLElement>("[data-lightbox-media]");
    const area = stage.current?.getBoundingClientRect();
    if (!image || !area) return { x: 0, y: 0 };
    const width = image.offsetWidth * scale;
    const height = image.offsetHeight * scale;
    return { x: Math.max(0, (width - area.width) / 2), y: Math.max(0, (height - area.height) / 2) };
  }, [currentLayer]);
  const applyView = useCallback(
    (next: View, animate = false) => {
      const limit = bounds(next.scale);
      const settled = {
        scale: next.scale,
        x: clamp(next.x, -limit.x, limit.x),
        y: clamp(next.y, -limit.y, limit.y),
      };
      view.current = settled;
      const layer = currentLayer();
      if (layer) {
        layer.style.transition = animate && !prefersReducedMotion() ? "transform 260ms var(--ease-gentle)" : "none";
        layer.style.transform = `translate3d(${settled.x}px, ${settled.y}px, 0) scale(${settled.scale})`;
      }
      setZoomed(settled.scale > 1.01);
    },
    [bounds, currentLayer],
  );
  const zoomAt = useCallback(
    (point: Point, scale: number, animate: boolean) => {
      const origin = view.current;
      const next = clamp(scale, 1, MAX_SCALE);
      const ratio = next / origin.scale;
      applyView({ scale: next, x: point.x - ratio * (point.x - origin.x), y: point.y - ratio * (point.y - origin.y) }, animate);
    },
    [applyView],
  );

  const go = useCallback(
    (target: number) => {
      const next = clamp(target, 0, count - 1);
      const element = track.current;
      if (element) {
        element.style.transition = prefersReducedMotion() ? "none" : "";
        element.style.transform = `translate3d(${-next * 100}%, 0, 0)`;
      }
      if (next !== indexRef.current) {
        // Leaving a zoomed photo resets it for the next visit.
        const layer = currentLayer();
        if (layer) layer.style.transform = "";
        view.current = { scale: 1, x: 0, y: 0 };
        setZoomed(false);
        indexRef.current = next;
        setIndex(next);
      }
    },
    [count, currentLayer],
  );

  /* ── Lifecycle: focus, inert background, scroll lock, keys, wheel ── */
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    // Portalled into <body>: everything else there becomes inert.
    const background = Array.from(document.body.children)
      .filter((element): element is HTMLElement => element instanceof HTMLElement && element !== root.current && !["SCRIPT", "STYLE", "LINK"].includes(element.tagName))
      .map((element) => ({ element, inert: element.inert }));
    background.forEach(({ element }) => { element.inert = true; });
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    return () => {
      window.clearTimeout(tapTimer.current);
      background.forEach(({ element, inert }) => { element.inert = inert; });
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (view.current.scale > 1) applyView({ scale: 1, x: 0, y: 0 }, true);
        else close();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        go(indexRef.current + 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(indexRef.current - 1);
      } else if (event.key === "Tab") {
        const items = Array.from(root.current?.querySelectorAll<HTMLElement>("button:not([disabled])") ?? []).filter(
          (element) => element.getClientRects().length > 0,
        );
        const first = items[0];
        const last = items.at(-1);
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      } else return;
      event.stopImmediatePropagation();
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [applyView, close, go]);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    // Trackpad pinch arrives as ctrl+wheel; plain wheel pans a zoomed photo.
    function onWheel(event: WheelEvent) {
      if (event.ctrlKey) {
        event.preventDefault();
        zoomAt(toStage(stage.current, { x: event.clientX, y: event.clientY }), view.current.scale * Math.exp(-event.deltaY / 120), false);
      } else if (view.current.scale > 1) {
        event.preventDefault();
        applyView({ ...view.current, x: view.current.x - event.deltaX, y: view.current.y - event.deltaY });
      }
    }
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [applyView, zoomAt]);

  /* ── Pointer gestures ── */
  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || (event.target as Element).closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = [...pointers.current.values()];
    if (points.length === 2) {
      const [a, b] = points;
      gesture.current = {
        distance: Math.hypot(a.x - b.x, a.y - b.y),
        kind: "pinch",
        mid: toStage(stage.current, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }),
        origin: { ...view.current },
      };
      track.current?.style.setProperty("transition", "none");
    } else if (points.length === 1) {
      gesture.current = {
        kind: view.current.scale > 1 ? "pan" : "pending",
        origin: { ...view.current },
        start: { x: event.clientX, y: event.clientY },
        startedAt: performance.now(),
      };
    }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const active = gesture.current;
    if (!active) return;
    if (active.kind === "pinch") {
      const [a, b] = [...pointers.current.values()];
      if (!a || !b) return;
      const mid = toStage(stage.current, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
      const scale = clamp(active.origin.scale * (Math.hypot(a.x - b.x, a.y - b.y) / active.distance), 1, MAX_SCALE);
      const ratio = scale / active.origin.scale;
      applyView({ scale, x: mid.x - ratio * (active.mid.x - active.origin.x), y: mid.y - ratio * (active.mid.y - active.origin.y) });
      return;
    }
    const dx = event.clientX - active.start.x;
    const dy = event.clientY - active.start.y;
    if (active.kind === "pending") {
      if (Math.hypot(dx, dy) < 8) return;
      active.kind = Math.abs(dx) > Math.abs(dy) ? "swipe" : dy > 0 ? "dismiss" : "pending";
      if (active.kind === "pending") return;
    }
    if (active.kind === "pan") {
      applyView({ ...active.origin, x: active.origin.x + dx, y: active.origin.y + dy });
    } else if (active.kind === "swipe" && track.current) {
      const atEdge = (dx > 0 && indexRef.current === 0) || (dx < 0 && indexRef.current === count - 1);
      track.current.style.transition = "none";
      track.current.style.transform = `translate3d(calc(${-indexRef.current * 100}% + ${atEdge ? dx / 3 : dx}px), 0, 0)`;
    } else if (active.kind === "dismiss") {
      const distance = Math.max(0, dy);
      const layer = currentLayer();
      if (layer) {
        layer.style.transition = "none";
        layer.style.transform = `translate3d(${dx / 4}px, ${distance}px, 0) scale(${1 - Math.min(distance, 400) / 1600})`;
      }
      if (backdrop.current) backdrop.current.style.opacity = String(1 - Math.min(distance / 360, 0.85));
    }
  }

  function finishTap(event: ReactPointerEvent<HTMLDivElement>, point: Point) {
    const now = performance.now();
    const previous = lastTap.current;
    const onMedia = Boolean((event.target as Element).closest("[data-lightbox-media]"));
    if (previous && now - previous.at < DOUBLE_TAP_MS && Math.hypot(point.x - previous.point.x, point.y - previous.point.y) < 32) {
      window.clearTimeout(tapTimer.current);
      lastTap.current = null;
      zoomAt(toStage(stage.current, point), view.current.scale > 1 ? 1 : 2.5, true);
      return;
    }
    lastTap.current = { at: now, point };
    window.clearTimeout(tapTimer.current);
    tapTimer.current = window.setTimeout(() => {
      lastTap.current = null;
      // Mouse: clicking outside the photo closes. Touch: a tap shows/hides controls.
      if (event.pointerType === "mouse") {
        if (!onMedia && view.current.scale <= 1) close();
      } else setChrome((visible) => !visible);
    }, DOUBLE_TAP_MS);
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.delete(event.pointerId);
    const active = gesture.current;
    if (!active) return;
    if (active.kind === "pinch") {
      // One finger may remain: continue as a pan from here.
      const remaining = [...pointers.current.values()][0];
      // The finger left behind is not a tap when it lifts.
      gesture.current = remaining
        ? { afterPinch: true, kind: "pan", origin: { ...view.current }, start: remaining, startedAt: performance.now() }
        : null;
      if (view.current.scale < 1.05) applyView({ scale: 1, x: 0, y: 0 }, true);
      return;
    }
    gesture.current = null;
    const dx = event.clientX - active.start.x;
    const dy = event.clientY - active.start.y;
    const elapsed = Math.max(1, performance.now() - active.startedAt);
    if (active.kind === "pending" || (active.kind === "pan" && Math.hypot(dx, dy) < 8)) {
      if (elapsed < 400 && !active.afterPinch) finishTap(event, { x: event.clientX, y: event.clientY });
      return;
    }
    if (active.kind === "swipe") {
      const width = stage.current?.offsetWidth ?? 1;
      const fast = Math.abs(dx) / elapsed > 0.5;
      const target = (Math.abs(dx) > width * 0.18 || fast) ? indexRef.current + (dx < 0 ? 1 : -1) : indexRef.current;
      go(target);
    } else if (active.kind === "dismiss") {
      const layer = currentLayer();
      if (dy > 110 || dy / elapsed > 0.6) {
        if (layer && !prefersReducedMotion()) {
          layer.style.transition = "transform 200ms var(--ease-exit)";
          layer.style.transform = `translate3d(0, ${Math.max(dy, 0) + 160}px, 0) scale(0.85)`;
        }
        close();
      } else {
        if (layer) {
          layer.style.transition = prefersReducedMotion() ? "none" : "transform 240ms var(--ease-gentle)";
          layer.style.transform = "";
        }
        if (backdrop.current) backdrop.current.style.opacity = "";
      }
    }
  }

  function onPointerCancel(event: ReactPointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    gesture.current = null;
    go(indexRef.current);
    const layer = currentLayer();
    if (layer && view.current.scale <= 1) layer.style.transform = "";
    if (backdrop.current) backdrop.current.style.opacity = "";
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      aria-label={`Fotos de ${title}`}
      aria-modal="true"
      className="lightbox"
      data-chrome={chrome}
      data-closing={closing || undefined}
      data-zoomed={zoomed || undefined}
      ref={root}
      role="dialog"
    >
      <div aria-hidden="true" className="lightbox-backdrop" ref={backdrop} />
      <div
        className="lightbox-stage"
        onPointerCancel={onPointerCancel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        ref={stage}
      >
        <div className="lightbox-track" ref={track} style={{ transform: `translate3d(${-index * 100}%, 0, 0)` }}>
          {photos.map((item, position) => (
            <div aria-hidden={position !== index} className="lightbox-slide" key={item.id}>
              {Math.abs(position - index) <= 1 ? (
                <div
                  className="lightbox-layer"
                  ref={(element) => {
                    if (element) layers.current.set(position, element);
                    else layers.current.delete(position);
                  }}
                >
                  {item.src && !failed.has(item.id) ? (
                    <img
                      alt={item.alt}
                      className="lightbox-image"
                      data-lightbox-media=""
                      decoding="async"
                      draggable={false}
                      height={item.height}
                      width={item.width}
                      onError={() => setFailed((current) => new Set(current).add(item.id))}
                      src={item.src}
                      style={item.placeholder ? { backgroundImage: `url(${item.placeholder})` } : undefined}
                    />
                  ) : item.src ? (
                    <p className="lightbox-error" data-lightbox-media="">No pudimos cargar esta foto. Ciérrala y vuelve a intentarlo.</p>
                  ) : (
                    <div
                      aria-label={item.alt}
                      className="lightbox-art"
                      data-lightbox-media=""
                      role="img"
                      style={{ backgroundImage: item.gradient }}
                    />
                  )}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="lightbox-top">
        <p aria-live="polite" className="lightbox-counter">
          <span className="sr-only">Foto </span>
          {index + 1} <span aria-hidden="true">/</span><span className="sr-only"> de </span> {count}
        </p>
        <button aria-label="Cerrar fotos" className="lightbox-button" onClick={close} ref={closeButton} type="button">
          <XIcon size={22} />
        </button>
      </div>

      {count > 1 ? (
        <>
          <button aria-label="Foto anterior" className="lightbox-button lightbox-nav lightbox-prev" disabled={index === 0} onClick={() => go(index - 1)} type="button">
            <ArrowLeftIcon size={22} />
          </button>
          <button aria-label="Foto siguiente" className="lightbox-button lightbox-nav lightbox-next" disabled={index === count - 1} onClick={() => go(index + 1)} type="button">
            <ArrowLeftIcon className="rotate-180" size={22} />
          </button>
        </>
      ) : null}

      <div className="lightbox-bottom">
        {photo?.alt ? <p className="lightbox-caption">{photo.alt}</p> : null}
        {count > 1 ? (
          <div aria-hidden="true" className="lightbox-dots">
            {photos.map((item, position) => (
              <span data-active={position === index} key={item.id} />
            ))}
          </div>
        ) : null}
        <p className="lightbox-hint">{zoomed ? "Arrastra para mover · doble toque para alejar" : "Doble toque para acercar · desliza hacia abajo para cerrar"}</p>
      </div>
    </div>,
    document.body,
  );
}
