import { describe, expect, it } from "vitest";

import type { Memory } from "@/types/memory";

import { normalizeSearch, readSearchQuery, searchMemories } from "./search";

const memory = (id: string, extra: Partial<Memory> = {}): Memory => ({
  createdBy: "Alizon",
  description: "Una nota.",
  id,
  memoryDate: "2026-08-16",
  photos: [],
  songs: [],
  title: id,
  ...extra,
});

const memories = [
  memory("lago", { description: "Café caliente y una mañana fría junto al agua.", memoryDate: "2026-05-03" }),
  memory("tren", {
    songs: [{ addedAt: "", addedBy: "", artist: "Natalia Lafourcade", id: "s", title: "Nunca es suficiente", url: "" }],
    title: "El tren de vuelta",
  }),
  memory("flores", { createdBy: "Abdair", title: "Flores del mercado", memoryDate: "2025-11-22" }),
];
const ids = (query: string) => searchMemories(memories, query).map((item) => item.id);

describe("memory search", () => {
  it("ignores case, accents and extra spaces", () => {
    expect(normalizeSearch("  CAFÉ   Mañana ")).toBe("cafe manana");
    expect(ids("cafe MANANA")).toEqual(["lago"]);
  });
  it("searches stories, song titles and artists, authors and spelled-out dates", () => {
    expect(ids("lafourcade")).toEqual(["tren"]);
    expect(ids("suficiente")).toEqual(["tren"]);
    expect(ids("abdair")).toEqual(["flores"]);
    expect(ids("noviembre")).toEqual(["flores"]);
    expect(ids("mayo 2026")).toEqual(["lago"]);
  });
  it("requires every word and returns everything for an empty query", () => {
    expect(ids("tren flores")).toEqual([]);
    expect(ids("   ")).toEqual(["lago", "tren", "flores"]);
  });
  it("only reads bounded strings from the URL", () => {
    expect(readSearchQuery(["lago"])).toBe("");
    expect(readSearchQuery(` ${"a".repeat(200)} `)).toHaveLength(80);
  });
});
