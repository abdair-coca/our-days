import type { Memory, MemorySong } from "@/types/memory";
import { resolveSongLink, type SongLinkResult } from "./song-source";

export type MusicTrack = MemorySong & {
  key: string;
  memoryId: string;
  memoryTitle: string;
  source: Extract<SongLinkResult, { ok: true }>;
};

/** Catalog order is newest memory first; songs retain their saved order. */
export function buildMusicLibrary(memories: readonly Memory[]): MusicTrack[] {
  return memories.flatMap((memory) =>
    memory.songs.flatMap((song) => {
      const source = resolveSongLink(song.url);
      return source.ok
        ? [
            {
              ...song,
              key: `${memory.id}:${song.id}`,
              memoryId: memory.id,
              memoryTitle: memory.title,
              source,
            },
          ]
        : [];
    }),
  );
}

export function sameMedia(left: MusicTrack, right: MusicTrack) {
  return (
    left.source.provider === right.source.provider &&
    left.source.id === right.source.id
  );
}

export function isPrivateMusicPath(path: string) {
  return (
    path === "/" ||
    path === "/settings" ||
    path === "/design-system" ||
    path === "/presentations" ||
    path === "/memories" ||
    path.startsWith("/memories/")
  );
}
