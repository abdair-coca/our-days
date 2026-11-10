"use client";

import Link from "next/link";
import {
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { mountProvider } from "@/features/music/provider-adapters";
import { isPlaybackActive, type PlaybackStatus } from "@/features/music/player-controller";
import {
  ExternalLinkIcon,
  ListMusicIcon,
  SearchIcon,
  SeekIcon,
  SkipBackIcon,
  SkipForwardIcon,
  VideoIcon,
  VolumeIcon,
  XIcon,
} from "@/components/ui/icons";
import { useMusicPlayer } from "./music-player";
import {
  Equalizer,
  MarqueeText,
  PlayPauseGlyph,
  ProgressRing,
  TrackCover,
  Vinyl,
  trackPalette,
} from "./track-visuals";

const statusLabels: Record<PlaybackStatus, string> = {
  idle: "Elige una canción", loading: "Cargando…", playing: "Reproduciendo",
  paused: "En pausa", ended: "Finalizada", blocked: "Pulsa Reproducir", error: "No disponible",
};
function time(seconds: number) {
  const value = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}
function normalize(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}
/** Keys a focused control already owns: text entry, sliders and embeds take
 *  everything; buttons and links additionally own Space and Enter. */
function ownsKey(target: EventTarget | null, key: string) {
  if (!(target instanceof Element)) return false;
  if (target.closest("input, textarea, select, iframe, [contenteditable='true']")) return true;
  return key === " " && Boolean(target.closest("button, a[href]"));
}

export function FloatingMusicPlayer({ visible, libraryError }: { visible: boolean; libraryError: string }) {
  const { controller, state, refresh } = useMusicPlayer();
  const root = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const titleButton = useRef<HTMLButtonElement>(null);
  const scrubValue = useRef<number | null>(null);
  const [scrub, setScrub] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const track = state.track;
  const youtube = track?.source.provider === "youtube";
  const expanded = visible && state.expanded;
  const videoShown = Boolean(youtube && state.videoVisible);
  const index = state.tracks.findIndex((item) => item.key === track?.key);
  const playing = state.status === "playing";
  const active = isPlaybackActive(state);
  const artist = track?.artist || (youtube ? "YouTube" : "Spotify");
  const providerName = youtube ? "YouTube" : "Spotify";
  const canSeek = Boolean(youtube && state.duration > 0);
  const queueLocked = Boolean(state.owner);
  const hasPrevious = !queueLocked && index > 0;
  const hasNext = !queueLocked && index >= 0 && index < state.tracks.length - 1;
  const upNext = hasNext ? state.tracks[index + 1] : null;
  const shownPosition = scrub ?? Math.min(state.position, state.duration || 0);
  const progress = state.duration > 0 ? shownPosition / state.duration : 0;
  const effectiveVolume = state.muted ? 0 : state.volume;
  const filter = normalize(deferredQuery.trim());
  const visibleTracks = filter
    ? state.tracks.filter((item) => normalize(`${item.title} ${item.artist} ${item.memoryTitle}`).includes(filter))
    : state.tracks;

  // One DOM location: opening controls or navigating never remounts the host.
  useEffect(() => {
    const current = controller.getSnapshot();
    if (!host.current || !current.track) return;
    return mountProvider(
      host.current,
      current.track,
      (adapter) => controller.bind(current.request, adapter),
      (event) => controller.report(current.request, event),
    );
  }, [controller, state.request]);

  useEffect(() => {
    if (!expanded) return;
    const previousFocus = document.activeElement;
    const capsuleTitle = titleButton.current;
    const previousOverflow = document.body.style.overflow;
    const background = Array.from(document.body.children)
      .filter((element): element is HTMLElement =>
        element instanceof HTMLElement && element !== root.current &&
        !element.contains(root.current) && !["SCRIPT", "STYLE", "LINK"].includes(element.tagName),
      )
      .map((element) => ({ element, inert: element.inert }));
    background.forEach(({ element }) => { element.inert = true; });
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        controller.closeLibrary();
      } else if (event.key === "Tab") {
        event.stopImmediatePropagation();
        const items = Array.from(panel.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), iframe, [tabindex="0"]',
        ) ?? []).filter((element) => !element.closest("[inert]") && element.getClientRects().length > 0);
        const first = items[0];
        const last = items.at(-1);
        if (!first || !last) {
          event.preventDefault();
          panel.current?.focus();
        } else if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      } else if (!event.metaKey && !event.ctrlKey && !event.altKey && !ownsKey(event.target, event.key)) {
        // Media shortcuts only when focus is not on a control that owns the key.
        const current = controller.getSnapshot();
        const key = event.key.toLowerCase();
        const seekable = current.track?.source.provider === "youtube" && current.duration > 0;
        if (current.track && (key === " " || key === "k")) controller.toggle();
        else if (seekable && (key === "arrowleft" || key === "j")) controller.skip(-10);
        else if (seekable && (key === "arrowright" || key === "l")) controller.skip(10);
        else return;
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }
    function keepFocus(event: FocusEvent) {
      if (event.target instanceof Node && !panel.current?.contains(event.target)) closeButton.current?.focus();
    }
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("focusin", keepFocus);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("focusin", keepFocus);
      document.body.style.overflow = previousOverflow;
      background.forEach(({ element, inert }) => { element.inert = inert; });
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected && previousFocus.getClientRects().length) previousFocus.focus();
      else capsuleTitle?.focus();
    };
  }, [controller, expanded]);

  function hideVideo() {
    controller.hideVideo();
    if (!expanded) titleButton.current?.focus();
  }

  function updateScrub(value: number) {
    scrubValue.current = value;
    setScrub(value);
  }
  function commitScrub() {
    if (scrubValue.current === null) return;
    controller.seek(scrubValue.current);
    scrubValue.current = null;
    setScrub(null);
  }

  /** Mobile sheet: drag the grabber down to dismiss, release early to settle back. */
  function startSheetDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const sheet = panel.current;
    if (!sheet || event.button !== 0 || window.matchMedia("(min-width: 768px)").matches) return;
    const grabber = event.currentTarget;
    const startY = event.clientY;
    const startedAt = performance.now();
    let distance = 0;
    grabber.setPointerCapture(event.pointerId);
    sheet.style.transition = "none";
    sheet.style.animation = "none";
    const move = (moveEvent: PointerEvent) => {
      const delta = moveEvent.clientY - startY;
      distance = delta > 0 ? delta : delta / 6;
      sheet.style.transform = `translateY(${distance}px)`;
    };
    const end = () => {
      grabber.removeEventListener("pointermove", move);
      grabber.removeEventListener("pointerup", end);
      grabber.removeEventListener("pointercancel", end);
      const velocity = distance / Math.max(1, performance.now() - startedAt);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      sheet.style.transition = reduce ? "none" : "transform 220ms var(--ease-gentle)";
      const dismiss = distance > 110 || velocity > 0.7;
      sheet.style.transform = dismiss ? "translateY(105%)" : "";
      window.setTimeout(() => {
        sheet.style.transition = "";
        sheet.style.transform = "";
        sheet.style.animation = "";
        if (dismiss) controller.closeLibrary();
      }, reduce ? 0 : 200);
    };
    grabber.addEventListener("pointermove", move);
    grabber.addEventListener("pointerup", end);
    grabber.addEventListener("pointercancel", end);
  }

  const capsuleHint =
    state.status === "blocked" ? "Toca reproducir para continuar"
      : state.status === "error" ? "No disponible · abre los controles"
        : state.status === "loading" && state.wantsPlay ? "Cargando…"
          : artist;

  return (
    <section
      aria-label="Música de nuestros recuerdos"
      className={`global-music-player ${expanded ? "music-modal-open" : ""} ${videoShown ? "music-video-visible" : ""} ${state.owner ? `music-owner-${state.owner}` : ""}`}
      hidden={!visible || (!track && !expanded)}
      id="global-music-player"
      ref={root}
    >
      <div className="music-capsule" data-status={state.status} hidden={!track || expanded} style={trackPalette(track)}>
        <button
          aria-controls="music-controls-dialog"
          aria-expanded={expanded}
          aria-haspopup="dialog"
          aria-label={`Abrir controles de ${track?.title || "canción"}`}
          className="music-capsule-title"
          onClick={controller.openLibrary}
          ref={titleButton}
          type="button"
        >
          <span className="music-capsule-art" key={track?.key}>
            <ProgressRing progress={progress} size={46} />
            <Vinyl size={36} spinning={playing} track={track} />
          </span>
          <span className="music-capsule-text">
            <MarqueeText className="music-capsule-name" run={playing}>{track?.title || "Sin título"}</MarqueeText>
            <span className="music-capsule-sub">
              {playing ? <Equalizer active /> : null}
              <span>{capsuleHint}</span>
            </span>
          </span>
        </button>
        <button
          aria-label={active ? "Pausar música" : "Reproducir música"}
          className="music-round-button music-capsule-play"
          data-attention={state.status === "blocked" || undefined}
          onClick={controller.toggle}
          type="button"
        >
          <PlayPauseGlyph playing={active} size={18} />
        </button>
        {hasNext ? (
          <button aria-label="Siguiente canción" className="music-icon-button music-capsule-next" onClick={() => controller.next()} type="button">
            <SkipForwardIcon size={18} />
          </button>
        ) : null}
        <button aria-label="Cerrar reproductor y detener música" className="music-icon-button" onClick={controller.stop} type="button">
          <XIcon size={18} />
        </button>
      </div>

      {expanded ? <div aria-hidden="true" className="music-dialog-backdrop" onClick={controller.closeLibrary} /> : null}

      <div
        aria-describedby={expanded && track ? "music-playback-status" : undefined}
        aria-labelledby={expanded ? "music-controls-title" : undefined}
        aria-modal={expanded ? true : undefined}
        className={`music-controls-panel ${expanded ? "music-dialog-is-open" : videoShown ? "music-video-dock" : "music-controls-collapsed"}`}
        data-playing={playing}
        hidden={!expanded && !youtube}
        id="music-controls-dialog"
        ref={panel}
        role={expanded ? "dialog" : undefined}
        style={trackPalette(track)}
        tabIndex={expanded ? -1 : undefined}
      >
        <div aria-hidden="true" className="music-sheet-grabber" hidden={!expanded} onPointerDown={startSheetDrag}>
          <span />
        </div>

        <div className="music-now">
          <div className="music-modal-heading" hidden={!expanded}>
            <p className="music-eyebrow">
              <span className="music-eyebrow-dot" data-active={active} />
              {state.owner === "story" ? "Música de la presentación" : state.owner === "preview" ? "Vista previa" : "Nuestra música"}
            </p>
            <button aria-label="Cerrar controles y conservar música" className="music-icon-button" onClick={controller.closeLibrary} ref={closeButton} type="button">
              <XIcon size={20} />
            </button>
          </div>

          <div className="music-deck" data-active={active} data-compact={Boolean(track && !youtube)} hidden={!expanded || videoShown}>
            <span aria-hidden="true" className="music-deck-glow" />
            <span className="music-deck-record"><Vinyl size={176} spinning={playing} track={track} /></span>
            <span className="music-deck-sleeve" key={track?.key ?? "empty"}><TrackCover size={184} track={track} /></span>
          </div>

          <div className="music-video-actions" hidden={!youtube || (!expanded && !videoShown)}>
            {videoShown ? (
              <button className="music-chip-button" onClick={hideVideo} type="button"><Vinyl size={18} spinning={false} track={track} />Ocultar vídeo</button>
            ) : (
              <button className="music-chip-button" onClick={controller.showVideo} type="button"><VideoIcon size={16} />Ver vídeo</button>
            )}
            {!expanded && videoShown ? <button className="music-text-button" onClick={controller.openLibrary} type="button">Controles</button> : null}
          </div>
          <div aria-hidden={youtube && !videoShown} className={`music-media-host ${!youtube ? "music-media-spotify" : videoShown ? "" : "music-video-hidden"}`} hidden={!track || (!youtube && !expanded)} inert={youtube && !videoShown} ref={host} />

          <div className="music-track-info" hidden={!expanded}>
            <h2 id="music-controls-title">{track?.title || "La banda sonora de sus días"}</h2>
            <p className="music-track-artist">{track ? artist : "Canciones guardadas en sus recuerdos"}</p>
            {track ? (
              <p className="music-track-meta">
                <span className="music-provider-chip" data-provider={track.source.provider}>{providerName}</span>
                {state.owner !== "preview" ? (
                  <Link href={`/memories/${track.memoryId}`} onClick={controller.closeLibrary}>
                    De «{track.memoryTitle}»
                  </Link>
                ) : null}
              </p>
            ) : null}
          </div>

          <div className="music-modal-controls" hidden={!expanded || !track}>
            {state.duration > 0 ? (
              <div className="music-scrubber" style={{ "--progress": `${progress * 100}%`, "--progress-ratio": progress } as CSSProperties}>
                {youtube ? (
                  <input
                    aria-label="Posición de reproducción"
                    aria-valuetext={`${time(shownPosition)} de ${time(state.duration)}`}
                    max={state.duration}
                    min={0}
                    onBlur={commitScrub}
                    onChange={(event) => updateScrub(Number(event.target.value))}
                    onKeyUp={commitScrub}
                    onPointerUp={commitScrub}
                    step={1}
                    type="range"
                    value={shownPosition}
                  />
                ) : (
                  <span aria-label="Progreso de reproducción" aria-valuemax={Math.round(state.duration)} aria-valuemin={0} aria-valuenow={Math.round(shownPosition)} aria-valuetext={`${time(shownPosition)} de ${time(state.duration)}`} className="music-scrubber-static" role="progressbar" />
                )}
                <span className="music-scrubber-times">
                  <span>{time(shownPosition)}</span>
                  <span>-{time(state.duration - shownPosition)}</span>
                </span>
              </div>
            ) : (
              <div className="music-scrubber music-scrubber-pending">
                <span className="music-scrubber-static" />
                <span className="music-scrubber-times"><span>El progreso aparecerá cuando el proveedor lo comparta.</span></span>
              </div>
            )}

            <div className="music-player-controls">
              {youtube ? (
                <button aria-label="Retroceder 10 segundos" className="music-icon-button" disabled={!canSeek} onClick={() => controller.skip(-10)} type="button">
                  <SeekIcon direction={-1} size={22} />
                </button>
              ) : null}
              <button aria-label="Canción anterior" className="music-icon-button" disabled={!hasPrevious} onClick={() => controller.next(-1)} type="button">
                <SkipBackIcon size={22} />
              </button>
              <button
                aria-label={active ? "Pausar" : "Reproducir"}
                className="music-round-button music-main-play"
                data-attention={state.status === "blocked" || undefined}
                data-loading={(state.status === "loading" && state.wantsPlay) || undefined}
                onClick={controller.toggle}
                type="button"
              >
                <PlayPauseGlyph playing={active} size={28} />
              </button>
              <button aria-label="Siguiente canción" className="music-icon-button" disabled={!hasNext} onClick={() => controller.next()} type="button">
                <SkipForwardIcon size={22} />
              </button>
              {youtube ? (
                <button aria-label="Avanzar 10 segundos" className="music-icon-button" disabled={!canSeek} onClick={() => controller.skip(10)} type="button">
                  <SeekIcon size={22} />
                </button>
              ) : null}
            </div>

            <div className="music-status-row">
              <p aria-live="polite" className="music-playback-status" data-status={state.status} id="music-playback-status">
                {playing ? <Equalizer active /> : <span className="music-status-dot" />}
                {statusLabels[state.status]}
              </p>
              {youtube ? (
                <div className="music-volume" style={{ "--volume": `${effectiveVolume * 100}%` } as CSSProperties}>
                  <button aria-label={state.muted || effectiveVolume === 0 ? "Activar sonido" : "Silenciar"} className="music-icon-button" onClick={controller.toggleMute} type="button">
                    <VolumeIcon level={effectiveVolume} size={18} />
                  </button>
                  <input aria-label="Volumen" max={1} min={0} onChange={(event) => controller.setVolume(Number(event.target.value))} step={0.05} type="range" value={effectiveVolume} />
                </div>
              ) : null}
            </div>

            {upNext ? (
              <p className="music-up-next"><span>A continuación</span> {upNext.title || "Sin título"}</p>
            ) : null}
            {state.message ? <p aria-live="polite" className="music-message">{state.message}</p> : null}
            {youtube ? <p className="music-message music-hint">Ver vídeo amplía el reproductor; ocultarlo o cerrar estos controles conserva la música.<span className="music-shortcuts"> Atajos: Espacio, ← y →.</span></p> : null}
            {track ? (
              <div className="music-provider-link">
                {state.status === "error" ? <button className="music-chip-button" onClick={controller.retry} type="button">Reintentar</button> : null}
                <a href={track.source.canonicalUrl} rel="noreferrer" target="_blank">
                  Abrir en {providerName}<ExternalLinkIcon size={14} />
                </a>
              </div>
            ) : null}
          </div>
        </div>

        <div className="music-library" hidden={!expanded}>
          <div className="music-library-heading">
            <h3><ListMusicIcon size={18} />Biblioteca</h3>
            {state.tracks.length ? <span>{state.tracks.length} {state.tracks.length === 1 ? "canción" : "canciones"}</span> : null}
          </div>
          {state.owner ? <p className="music-library-note">La biblioteca volverá a estar disponible al cerrar {state.owner === "story" ? "la presentación" : "la vista previa"}.</p> : null}
          {libraryError ? <p className="music-library-note" role="status">{libraryError} <button className="music-text-button" onClick={() => void refresh()} type="button">Reintentar</button></p> : null}
          {state.tracks.length > 5 ? (
            <label className="music-library-search">
              <SearchIcon size={16} />
              <span className="sr-only">Buscar en la biblioteca</span>
              <input onChange={(event) => setQuery(event.target.value)} placeholder="Buscar canción o recuerdo" type="search" value={query} />
            </label>
          ) : null}
          {state.tracks.length ? (
            visibleTracks.length ? (
              <ol aria-label="Canciones de nuestros recuerdos">
                {visibleTracks.map((item, position) => {
                  const current = item.key === track?.key;
                  const number = state.tracks.indexOf(item) + 1;
                  return (
                    <li key={item.key} style={{ "--i": Math.min(position, 10) } as CSSProperties}>
                      <button
                        aria-current={current ? "true" : undefined}
                        aria-label={current ? `${item.title || "Sin título"}: ${active ? "pausar" : "reproducir"}` : undefined}
                        disabled={queueLocked}
                        onClick={() => (current ? controller.toggle() : controller.select(item.key))}
                        type="button"
                      >
                        <span className="music-library-index">
                          {current ? <Equalizer active={playing} /> : <span>{String(number).padStart(2, "0")}</span>}
                          <PlayPauseGlyph playing={current && active} size={16} />
                        </span>
                        <TrackCover size={42} track={item} />
                        <span className="music-library-text">
                          <strong>{item.title || "Sin título"}</strong>
                          <small>{item.artist || (item.source.provider === "youtube" ? "YouTube" : "Spotify")} · {item.memoryTitle}</small>
                        </span>
                        <span className="music-provider-chip" data-provider={item.source.provider}>{item.source.provider === "youtube" ? "YT" : "Sp"}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            ) : <p className="music-library-note">Ninguna canción coincide con «{query}».</p>
          ) : <p className="music-library-note">Aún no hay canciones compatibles. Añade un enlace de Spotify o YouTube a un recuerdo.</p>}
        </div>
      </div>
    </section>
  );
}
