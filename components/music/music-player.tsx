"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { getMusicLibraryAction } from "@/features/music/library-action";
import { isPrivateMusicPath, type MusicTrack } from "@/features/music/library";
import { MusicPlayerController } from "@/features/music/player-controller";
import { mountProvider } from "@/features/music/provider-adapters";
import { Button } from "@/components/ui/button";
import { MusicIcon, PauseIcon, PlayIcon, XIcon } from "@/components/ui/icons";

type Library = Awaited<ReturnType<typeof getMusicLibraryAction>>;
type MusicContextValue = {
  controller: MusicPlayerController;
  refresh(): Promise<void>;
  register(library: Library): void;
  deactivate(): void;
};
const MusicContext = createContext<MusicContextValue | null>(null);
export function useMusicPlayer() {
  const context = useContext(MusicContext);
  if (!context) throw new Error("MusicPlayerProvider requerido.");
  const state = useSyncExternalStore(
    context.controller.subscribe,
    context.controller.getSnapshot,
    context.controller.getSnapshot,
  );
  return { ...context, state };
}

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [controller] = useState(() => new MusicPlayerController());
  const request = useRef(0);
  const path = useRef(pathname);
  const allowed = useRef(isPrivateMusicPath(pathname));
  const [libraryError, setLibraryError] = useState("");
  const register = useCallback(
    (library: Library) => {
      if (allowed.current && isPrivateMusicPath(path.current)) {
        controller.setLibrary(library.identity, library.tracks);
        setLibraryError("");
      }
    },
    [controller],
  );
  const refresh = useCallback(async () => {
    const revision = ++request.current;
    try {
      const library = await getMusicLibraryAction();
      if (revision === request.current && isPrivateMusicPath(path.current))
        register(library);
    } catch {
      if (revision === request.current) {
        controller.reset();
        setLibraryError(
          "No pudimos cargar la música. Comprueba tu sesión e inténtalo de nuevo.",
        );
      }
    }
  }, [controller, register]);
  const deactivate = useCallback(() => {
    request.current++;
    allowed.current = false;
    controller.reset();
  }, [controller]);
  useEffect(() => {
    path.current = pathname;
    allowed.current = isPrivateMusicPath(pathname);
    if (!isPrivateMusicPath(pathname)) {
      request.current++;
      controller.reset();
    } else void refresh();
  }, [controller, pathname, refresh]);
  useEffect(() => () => controller.reset(), [controller]);
  return (
    <MusicContext.Provider
      value={{ controller, refresh, register, deactivate }}
    >
      {children}
      <FloatingMusicPlayer
        libraryError={libraryError}
        visible={isPrivateMusicPath(pathname)}
      />
    </MusicContext.Provider>
  );
}

/** Registers server-authorized identity without owning the persistent host. */
export function MusicLibraryScope({ library }: { library: Library }) {
  const { register } = useMusicPlayer();
  useEffect(() => register(library), [library, register]);
  return null;
}

export function MusicLibraryButton() {
  const { controller, state } = useMusicPlayer();
  return (
    <Button
      aria-controls="global-music-player"
      aria-expanded={state.expanded}
      aria-label="Música"
      className="p-3"
      disabled={Boolean(state.owner)}
      onClick={controller.toggleLibrary}
      title="Música"
      variant="quiet"
    >
      <MusicIcon size={20} />
    </Button>
  );
}

const statusLabels = {
  idle: "Elige una canción",
  loading: "Cargando…",
  playing: "Reproduciendo",
  paused: "En pausa",
  ended: "Finalizada",
  blocked: "Pulsa Reanudar",
  error: "No disponible",
};
function time(seconds: number) {
  const value = Math.floor(seconds || 0);
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}
function FloatingMusicPlayer({
  visible,
  libraryError,
}: {
  visible: boolean;
  libraryError: string;
}) {
  const { controller, state, refresh } = useMusicPlayer();
  const host = useRef<HTMLDivElement>(null);
  const track = state.track;
  // request changes only for media loads; metadata, route and modal changes keep iframe intact.
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
  const index = state.tracks.findIndex((item) => item.key === track?.key);
  const shown = visible && Boolean(track || state.expanded);
  return (
    <section
      aria-label="Música de nuestros recuerdos"
      className={`global-music-player ${state.owner ? `music-owner-${state.owner}` : ""}`}
      hidden={!shown}
      id="global-music-player"
    >
      <div className="music-player-heading">
        <span className="music-player-symbol">
          <MusicIcon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {track?.title ||
              (state.owner === "story"
                ? "Presentación sin música"
                : "Nuestra música")}
          </p>
          <p className="truncate text-xs text-text-soft">
            {track
              ? track.artist ||
                (track.source.provider === "youtube" ? "YouTube" : "Spotify")
              : "Canciones guardadas en sus recuerdos"}
          </p>
        </div>
        {!state.owner ? (
          <Button
            aria-label={state.expanded ? "Ocultar lista" : "Mostrar lista"}
            className="p-2"
            onClick={controller.toggleLibrary}
            variant="quiet"
          >
            <MusicIcon size={16} />
          </Button>
        ) : null}
        <Button
          aria-label="Cerrar reproductor y detener música"
          className="p-2"
          onClick={() => {
            controller.stop();
            if (state.expanded) controller.toggleLibrary();
          }}
          variant="quiet"
        >
          <XIcon size={16} />
        </Button>
      </div>
      {track ? (
        <div className="music-track-meta">
          <span>
            {track.source.provider === "youtube" ? "YouTube" : "Spotify"} ·{" "}
            {state.owner === "preview"
              ? "Vista previa"
              : state.owner === "story"
                ? "Presentación"
                : "Recuerdo"}
          </span>
          {state.owner !== "preview" ? (
            <Link href={`/memories/${track.memoryId}`}>
              {track.memoryTitle}
            </Link>
          ) : null}
        </div>
      ) : null}
      <div
        className={`music-media-host ${track?.source.provider === "spotify" ? "music-media-spotify" : ""}`}
        hidden={!track}
        ref={host}
      />
      {track ? (
        <>
          <div className="music-player-controls">
            {!state.owner ? (
              <Button
                aria-label="Canción anterior"
                disabled={index <= 0}
                onClick={() => controller.next(-1)}
                variant="quiet"
              >
                ‹
              </Button>
            ) : null}
            <Button
              aria-label={
                state.status === "playing" ? "Pausar música" : "Reanudar música"
              }
              onClick={
                state.status === "playing" ? controller.pause : controller.play
              }
              variant="secondary"
            >
              {state.status === "playing" ? (
                <PauseIcon size={16} />
              ) : (
                <PlayIcon size={16} />
              )}
              <span>{state.status === "playing" ? "Pausar" : "Reanudar"}</span>
            </Button>
            {!state.owner ? (
              <Button
                aria-label="Siguiente canción"
                disabled={index < 0 || index >= state.tracks.length - 1}
                onClick={() => controller.next()}
                variant="quiet"
              >
                ›
              </Button>
            ) : null}
            <span aria-live="polite" className="text-xs text-text-soft">
              {statusLabels[state.status]}
            </span>
          </div>
          {track.source.provider === "youtube" && state.duration > 0 ? (
            <label className="music-seek">
              <span className="sr-only">Posición de reproducción</span>
              <input
                aria-label="Posición de reproducción"
                max={state.duration}
                min={0}
                onChange={(event) =>
                  controller.seek(Number(event.target.value))
                }
                step={1}
                type="range"
                value={Math.min(state.position, state.duration)}
              />
              <span>
                {time(state.position)} / {time(state.duration)}
              </span>
            </label>
          ) : null}
          {track.source.provider === "spotify" && state.duration > 0 ? (
            <p className="music-time">
              {time(state.position)} / {time(state.duration)}
            </p>
          ) : null}
          {state.message ? (
            <p aria-live="polite" className="music-message">
              {state.message}
            </p>
          ) : null}
          <div className="music-provider-link">
            {state.status === "error" ? (
              <button onClick={controller.retry} type="button">
                Reintentar
              </button>
            ) : null}
            <a
              href={track.source.canonicalUrl}
              rel="noreferrer"
              target="_blank"
            >
              Abrir en{" "}
              {track.source.provider === "youtube" ? "YouTube" : "Spotify"}
            </a>
          </div>
        </>
      ) : null}
      {state.expanded && !state.owner ? (
        <div className="music-library">
          <h2 className="font-serif text-lg font-semibold">Nuestra música</h2>
          {libraryError ? (
            <p role="status">
              {libraryError}
              <button onClick={() => void refresh()} type="button">
                Reintentar
              </button>
            </p>
          ) : null}
          {state.tracks.length ? (
            <ol>
              {state.tracks.map((item) => (
                <li key={item.key}>
                  <button
                    aria-current={item.key === track?.key ? "true" : undefined}
                    onClick={() => controller.select(item.key)}
                    type="button"
                  >
                    <PlayIcon size={15} />
                    <span>
                      <strong>{item.title || "Sin título"}</strong>
                      <small>
                        {item.artist} · {item.memoryTitle} ·{" "}
                        {item.source.provider === "youtube"
                          ? "YouTube"
                          : "Spotify"}
                      </small>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-text-soft">
              Aún no hay canciones compatibles. Añade un enlace de Spotify o
              YouTube a un recuerdo.
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}

export function useTemporaryMusic(
  track: MusicTrack | null,
  enabled: boolean,
  owner: "preview" | "story" = "preview",
) {
  const { controller } = useMusicPlayer();
  const trackRef = useRef(track);
  const sessionToken = useRef<number | null>(null);
  useEffect(() => {
    trackRef.current = track;
  }, [track]);
  useEffect(() => {
    if (!enabled) return;
    const token = controller.beginTemporary(owner, trackRef.current);
    sessionToken.current = token;
    return () => {
      sessionToken.current = null;
      controller.endTemporary(token);
    };
  }, [controller, enabled, owner]);
  useEffect(() => {
    if (sessionToken.current !== null) {
      controller.replaceTemporary(sessionToken.current, trackRef.current);
    }
  }, [
    controller,
    enabled,
    owner,
    track?.key,
    track?.source.provider,
    track?.source.id,
    track?.title,
    track?.artist,
    track?.url,
    track?.memoryId,
    track?.memoryTitle,
  ]);
}
