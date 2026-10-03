import type { MusicTrack } from "./library";
import type { PlaybackAdapter, PlaybackEvent } from "./player-controller";

type YouTubePlayer = {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
};
type YouTubeApi = {
  Player: new (
    element: HTMLElement,
    options: {
      width: string;
      height: number;
      videoId: string;
      playerVars: Record<string, string | number>;
      events: {
        onReady(): void;
        onStateChange(event: { data: number }): void;
        onError(): void;
        onAutoplayBlocked(): void;
      };
    },
  ) => YouTubePlayer;
};
type SpotifyEvent = {
  data: {
    isPaused: boolean;
    isBuffering: boolean;
    position: number;
    duration: number;
  };
};
type SpotifyController = {
  resume(): void;
  pause(): void;
  loadEntity(uri: string, preferVideo?: boolean, startAt?: number): void;
  destroy(): void;
  addListener(name: string, listener: (event: SpotifyEvent) => void): void;
  removeListener(name: string, listener: (event: SpotifyEvent) => void): void;
};
type SpotifyApi = {
  createController(
    element: HTMLElement,
    options: { uri: string; width: string; height: number },
    callback: (controller: SpotifyController) => void,
  ): void;
};
declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
    onSpotifyIframeApiReady?: (api: SpotifyApi) => void;
  }
}
let youtubePromise: Promise<YouTubeApi> | undefined;
let spotifyPromise: Promise<SpotifyApi> | undefined;

function loadScript<T>(
  src: string,
  ready: (resolve: (api: T) => void) => void,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      script.remove();
      reject(new Error("No pudimos conectar con el proveedor."));
    }, 15000);
    ready((api) => {
      window.clearTimeout(timeout);
      resolve(api);
    });
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onerror = () => {
      window.clearTimeout(timeout);
      script.remove();
      reject(new Error("No pudimos cargar el reproductor."));
    };
    document.head.appendChild(script);
  });
}
function youtubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  youtubePromise ??= loadScript<YouTubeApi>(
    "https://www.youtube.com/iframe_api",
    (resolve) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        if (window.YT) resolve(window.YT);
      };
    },
  ).catch((error) => {
    youtubePromise = undefined;
    throw error;
  });
  return youtubePromise;
}
function spotifyApi() {
  spotifyPromise ??= loadScript<SpotifyApi>(
    "https://open.spotify.com/embed/iframe-api/v1",
    (resolve) => {
      const previous = window.onSpotifyIframeApiReady;
      window.onSpotifyIframeApiReady = (api) => {
        previous?.(api);
        resolve(api);
      };
    },
  ).catch((error) => {
    spotifyPromise = undefined;
    throw error;
  });
  return spotifyPromise;
}

/** One disposable adapter per selected source, never recreated for navigation. */
export function mountProvider(
  host: HTMLElement,
  track: MusicTrack,
  onReady: (adapter: PlaybackAdapter) => void,
  report: (event: PlaybackEvent) => void,
) {
  let disposed = false;
  let adapter: PlaybackAdapter | undefined;
  let timer: number | undefined;
  let blockedTimer: number | undefined;
  let playing = false;
  const emit = (event: PlaybackEvent) => {
    if (!disposed) {
      if (event.status) playing = event.status === "playing";
      report(event);
    }
  };
  const watchPlay = () => {
    window.clearTimeout(blockedTimer);
    blockedTimer = window.setTimeout(() => {
      if (!playing)
        emit({
          status: "blocked",
          message: "Pulsa Reanudar o usa los controles del proveedor.",
        });
    }, 4500);
  };
  const placeholder = document.createElement("div");
  host.replaceChildren(placeholder);
  let readyTimer: number | undefined = window.setTimeout(
    () =>
      emit({
        status: "error",
        message:
          "El proveedor no respondió. Puedes reintentar o abrir el enlace.",
      }),
    20000,
  );
  const ready = (value: PlaybackAdapter) => {
    window.clearTimeout(readyTimer);
    readyTimer = undefined;
    if (disposed) return;
    adapter = value;
    onReady({ ...value, destroy });
    host
      .querySelector("iframe")
      ?.setAttribute("title", `Reproductor de ${track.title || "canción"}`);
  };
  const destroy = () => {
    if (disposed) return;
    disposed = true;
    window.clearInterval(timer);
    window.clearTimeout(blockedTimer);
    window.clearTimeout(readyTimer);
    adapter?.destroy();
    host.replaceChildren();
  };
  if (track.source.provider === "youtube") {
    void youtubeApi()
      .then((api) => {
        if (disposed) return;
        const player = new api.Player(placeholder, {
          width: "100%",
          height: 200,
          videoId: track.source.id,
          playerVars: {
            playsinline: 1,
            origin: window.location.origin,
            autoplay: 0,
          },
          events: {
            onReady: () => {
              const value: PlaybackAdapter = {
                play: () => {
                  player.playVideo();
                  watchPlay();
                },
                pause: () => {
                  window.clearTimeout(blockedTimer);
                  player.pauseVideo();
                },
                seek: (seconds) => player.seekTo(seconds, true),
                destroy: () => {
                  window.clearInterval(timer);
                  window.clearTimeout(blockedTimer);
                  player.destroy();
                },
              };
              ready(value);
              if (!disposed)
                timer = window.setInterval(
                  () =>
                    emit({
                      position: player.getCurrentTime(),
                      duration: player.getDuration(),
                    }),
                  500,
                );
            },
            onStateChange: ({ data }) => {
              const status = (
                {
                  0: "ended",
                  1: "playing",
                  2: "paused",
                  3: "loading",
                  5: "paused",
                } as const
              )[data as 0 | 1 | 2 | 3 | 5];
              if (status) emit({ status });
            },
            onError: () =>
              emit({
                status: "error",
                message:
                  "Esta canción no se puede reproducir aquí. Abre el enlace del proveedor.",
              }),
            onAutoplayBlocked: () =>
              emit({
                status: "blocked",
                message: "El navegador necesita que pulses Reanudar.",
              }),
          },
        });
        adapter = {
          play: () => {},
          pause: () => {},
          seek: () => {},
          destroy: () => player.destroy(),
        };
      })
      .catch((error: Error) =>
        emit({ status: "error", message: error.message }),
      );
  } else {
    void spotifyApi()
      .then((api) => {
        if (disposed) return;
        api.createController(
          placeholder,
          {
            uri: `spotify:track:${track.source.id}`,
            width: "100%",
            height: 152,
          },
          (controller) => {
            if (disposed) {
              controller.destroy();
              return;
            }
            const started = () => emit({ status: "playing" });
            const update = ({ data }: SpotifyEvent) =>
              emit({
                status: data.isBuffering
                  ? "loading"
                  : data.isPaused
                    ? "paused"
                    : "playing",
                position: data.position / 1000,
                duration: data.duration / 1000,
              });
            const value: PlaybackAdapter = {
              play: () => {
                controller.resume();
                watchPlay();
              },
              pause: () => {
                window.clearTimeout(blockedTimer);
                controller.pause();
              },
              // Track seeks are not documented; loadEntity supports startAt for restoration.
              seek: (seconds) =>
                controller.loadEntity(
                  track.source.canonicalUrl,
                  false,
                  seconds,
                ),
              destroy: () => {
                window.clearTimeout(blockedTimer);
                controller.removeListener("ready", initialized);
                controller.removeListener("playback_started", started);
                controller.removeListener("playback_update", update);
                controller.destroy();
              },
            };
            const initialized = () => ready(value);
            adapter = value;
            controller.addListener("ready", initialized);
            controller.addListener("playback_started", started);
            controller.addListener("playback_update", update);
          },
        );
      })
      .catch((error: Error) => {
        if (disposed) return;
        const iframe = document.createElement("iframe");
        iframe.src = track.source.embedUrl;
        iframe.title = `Reproductor de ${track.title}`;
        iframe.allow =
          "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
        host.replaceChildren(iframe);
        emit({
          status: "error",
          message: `${error.message} Usa los controles de Spotify.`,
        });
      });
  }
  return destroy;
}
