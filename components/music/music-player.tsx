"use client";

import { FloatingMusicPlayer } from "./floating-music-player";
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
import { Button } from "@/components/ui/button";
import { MusicIcon } from "@/components/ui/icons";

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
      aria-controls="music-controls-dialog"
      aria-expanded={state.expanded}
      aria-haspopup="dialog"
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
