"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { mountProvider } from "@/features/music/provider-adapters";
import { Button } from "@/components/ui/button";
import { MusicIcon, PauseIcon, PlayIcon, XIcon } from "@/components/ui/icons";
import { useMusicPlayer } from "./music-player";

const statusLabels = {
  idle: "Elige una canción", loading: "Cargando…", playing: "Reproduciendo",
  paused: "En pausa", ended: "Finalizada", blocked: "Pulsa Reproducir", error: "No disponible",
};
function time(seconds: number) {
  const value = Math.floor(seconds || 0);
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}

export function FloatingMusicPlayer({ visible, libraryError }: { visible: boolean; libraryError: string }) {
  const { controller, state, refresh } = useMusicPlayer();
  const root = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const titleButton = useRef<HTMLButtonElement>(null);
  const track = state.track;
  const youtube = track?.source.provider === "youtube";
  const expanded = visible && state.expanded;
  const videoShown = Boolean(youtube && state.videoVisible);
  const index = state.tracks.findIndex((item) => item.key === track?.key);
  const playing = state.status === "playing";
  const needsVideo = Boolean(youtube && !state.videoVisible);
  const artist = track?.artist || (youtube ? "YouTube" : "Spotify");

  // One DOM location: opening controls or navigating never remounts the host.
  useEffect(() => {
    const current = controller.getSnapshot();
    if (!host.current || !current.track || (current.track.source.provider === "youtube" && !current.videoVisible)) return;
    return mountProvider(
      host.current,
      current.track,
      (adapter) => controller.bind(current.request, adapter),
      (event) => controller.report(current.request, event),
    );
  }, [controller, state.request, state.videoVisible]);

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
        ) ?? []).filter((element) => element.getClientRects().length > 0);
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

  function togglePlayback() {
    if (needsVideo) controller.openLibrary();
    else if (playing) controller.pause();
    else controller.play();
  }

  function hideVideo() {
    controller.hideVideo();
    if (!expanded) titleButton.current?.focus();
  }

  return (
    <section
      aria-label="Música de nuestros recuerdos"
      className={`global-music-player ${expanded ? "music-modal-open" : ""} ${videoShown ? "music-video-visible" : ""} ${state.owner ? `music-owner-${state.owner}` : ""}`}
      hidden={!visible || (!track && !expanded)}
      id="global-music-player"
      ref={root}
    >
      <div className="music-capsule" hidden={!track || expanded}>
        <span className="music-player-symbol"><MusicIcon size={18} /></span>
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
          <strong>{track?.title || "Sin título"}</strong><span>{artist}</span>
        </button>
        <Button aria-label={playing ? "Pausar música" : "Reproducir música"} className="p-2" onClick={togglePlayback} title={needsVideo ? "Abre los controles para ver el vídeo" : undefined} variant="secondary">
          {playing ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
        </Button>
        <Button aria-label="Cerrar reproductor y detener música" className="p-2" onClick={controller.stop} variant="quiet"><XIcon size={18} /></Button>
      </div>

      {expanded ? <div aria-hidden="true" className="music-dialog-backdrop" onClick={controller.closeLibrary} /> : null}

      <div
        aria-describedby={expanded && track ? "music-playback-status" : undefined}
        aria-labelledby={expanded ? "music-controls-title" : undefined}
        aria-modal={expanded ? true : undefined}
        className={`music-controls-panel ${expanded ? "music-dialog-is-open" : "music-video-dock"}`}
        hidden={!expanded && !videoShown}
        id="music-controls-dialog"
        ref={panel}
        role={expanded ? "dialog" : undefined}
        tabIndex={expanded ? -1 : undefined}
      >
        <div className="music-modal-heading" hidden={!expanded}>
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-[0.14em] text-olive uppercase">
              {state.owner === "story" ? "Música de la presentación" : state.owner === "preview" ? "Vista previa" : "Nuestra música"}
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold" id="music-controls-title">{track?.title || "La banda sonora de sus días"}</h2>
            <p className="mt-1 text-sm text-text-soft">{track ? artist : "Canciones guardadas en sus recuerdos"}</p>
          </div>
          <Button aria-label="Cerrar controles y conservar música" className="shrink-0 p-2" onClick={controller.closeLibrary} ref={closeButton} variant="quiet"><XIcon size={20} /></Button>
        </div>

        {track ? (
          <div className="music-track-meta" hidden={!expanded}>
            <span>{youtube ? "YouTube" : "Spotify"}</span>
            {state.owner !== "preview" ? <Link href={`/memories/${track.memoryId}`} onClick={controller.closeLibrary}>Ver recuerdo: {track.memoryTitle}</Link> : null}
          </div>
        ) : null}

        <div className="music-video-actions" hidden={!youtube || (!expanded && !videoShown)}>
          {videoShown ? <Button className="px-3" onClick={hideVideo} variant="quiet">Ocultar vídeo</Button> : <Button onClick={controller.showVideo} variant="secondary"><PlayIcon size={16} />Ver vídeo</Button>}
          {!expanded && videoShown ? <button className="music-text-button" onClick={controller.openLibrary} type="button">Controles</button> : null}
        </div>
        <div className={`music-media-host ${!youtube ? "music-media-spotify" : ""}`} hidden={!track || (youtube ? !videoShown : !expanded)} ref={host} />

        <div className="music-modal-controls" hidden={!expanded || !track}>
          <div className="music-player-controls">
            <Button aria-label="Canción anterior" disabled={Boolean(state.owner) || index <= 0} onClick={() => controller.next(-1)} variant="quiet">‹</Button>
            <Button disabled={needsVideo} onClick={togglePlayback} variant="secondary">
              {playing ? <PauseIcon size={18} /> : <PlayIcon size={18} />}{playing ? "Pausar" : "Reproducir"}
            </Button>
            <Button aria-label="Siguiente canción" disabled={Boolean(state.owner) || index < 0 || index >= state.tracks.length - 1} onClick={() => controller.next()} variant="quiet">›</Button>
          </div>
          <p aria-live="polite" className="music-playback-status" id="music-playback-status">{needsVideo ? "Pulsa «Ver vídeo» para reproducir esta canción." : statusLabels[state.status]}</p>
          {state.duration > 0 ? (
            youtube ? (
              <label className="music-seek">
                <span className="sr-only">Posición de reproducción</span>
                <input aria-label="Posición de reproducción" aria-valuetext={`${time(state.position)} de ${time(state.duration)}`} disabled={needsVideo} max={state.duration} min={0} onChange={(event) => controller.seek(Number(event.target.value))} step={1} type="range" value={Math.min(state.position, state.duration)} />
                <span>{time(state.position)} / {time(state.duration)}</span>
              </label>
            ) : (
              <div className="music-progress"><progress aria-label="Progreso de reproducción" max={state.duration} value={Math.min(state.position, state.duration)} /><span>{time(state.position)} / {time(state.duration)}</span></div>
            )
          ) : <p className="music-time">El progreso aparecerá cuando el proveedor lo comparta.</p>}
          {youtube ? <p className="music-message text-text-soft">YouTube necesita el vídeo visible. Al cerrar estos controles, el vídeo sigue en una ventana pequeña. Ocultarlo pausa la canción.</p> : null}
          {state.message ? <p aria-live="polite" className="music-message">{state.message}</p> : null}
          {track ? (
            <div className="music-provider-link">
              {state.status === "error" ? <button onClick={controller.retry} type="button">Reintentar</button> : null}
              <a href={track.source.canonicalUrl} rel="noreferrer" target="_blank">Abrir en {youtube ? "YouTube" : "Spotify"}</a>
            </div>
          ) : null}
        </div>

        <div className="music-library" hidden={!expanded}>
          <h3 className="font-serif text-xl font-semibold">Biblioteca</h3>
          {state.owner ? <p className="mt-2 text-sm text-text-soft">La biblioteca volverá a estar disponible al cerrar {state.owner === "story" ? "la presentación" : "la vista previa"}.</p> : null}
          {libraryError ? <p role="status">{libraryError} <button className="music-text-button" onClick={() => void refresh()} type="button">Reintentar</button></p> : null}
          {state.tracks.length ? (
            <ol aria-label="Canciones de nuestros recuerdos">
              {state.tracks.map((item) => (
                <li key={item.key}>
                  <button aria-current={item.key === track?.key ? "true" : undefined} disabled={Boolean(state.owner)} onClick={() => controller.select(item.key)} type="button">
                    {item.key === track?.key ? <MusicIcon size={18} /> : <PlayIcon size={18} />}
                    <span><strong>{item.title || "Sin título"}</strong><small>{item.artist || (item.source.provider === "youtube" ? "YouTube" : "Spotify")} · {item.memoryTitle}</small></span>
                  </button>
                </li>
              ))}
            </ol>
          ) : <p className="mt-2 text-sm text-text-soft">Aún no hay canciones compatibles. Añade un enlace de Spotify o YouTube a un recuerdo.</p>}
        </div>
      </div>
    </section>
  );
}
