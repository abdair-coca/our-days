import { formatMemoryDate } from "@/lib/utils/format-memory-date";
import type { Memory } from "@/types/memory";

export const MAX_SEARCH_LENGTH = 80;

/** Case- and accent-insensitive: "cafe" finds "Café", "MANANA" finds "mañana". */
export function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
}

export function readSearchQuery(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, MAX_SEARCH_LENGTH) : "";
}

function haystack(memory: Memory) {
  return normalizeSearch(
    [
      memory.title,
      memory.description,
      memory.createdBy,
      formatMemoryDate(memory.memoryDate),
      ...memory.songs.flatMap((song) => [song.title, song.artist]),
    ].join(" \n "),
  );
}

/** Every word must appear somewhere: title, story, songs, author or date. */
export function searchMemories<T extends Memory>(memories: readonly T[], query: string): readonly T[] {
  const terms = normalizeSearch(query).split(" ").filter(Boolean);
  if (terms.length === 0) return memories;
  return memories.filter((memory) => {
    const text = haystack(memory);
    return terms.every((term) => text.includes(term));
  });
}
