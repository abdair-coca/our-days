import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { createSupabaseMemoryRepository } from "./supabase-memory-repository";

type Call = {
  filters: [string, unknown][];
  op: "select" | "insert" | "update" | "delete";
  payload?: Record<string, unknown> | Record<string, unknown>[];
  table: string;
};
type Result = { data: unknown; error: unknown };

/** Records every query and answers through `handler`; enough for the song/photo paths. */
function fakeClient(handler: (call: Call, previous: Call[]) => Result) {
  const calls: Call[] = [];
  const client = {
    rpc: async () => ({ data: "space-1", error: null }),
    storage: {
      from: () => ({
        createSignedUrl: async () => ({ data: { signedUrl: "https://signed.example/photo" } }),
        remove: async () => ({ error: null }),
        upload: async () => ({ error: null }),
      }),
    },
    from(table: string) {
      const call: Call = { filters: [], op: "select", table };
      const builder = {
        delete: () => ((call.op = "delete"), builder),
        eq: (key: string, value: unknown) => (call.filters.push([key, value]), builder),
        in: (key: string, value: unknown) => (call.filters.push([key, value]), builder),
        insert: (payload: Call["payload"]) => ((call.op = "insert"), (call.payload = payload), builder),
        maybeSingle: () => builder,
        order: () => builder,
        select: () => builder,
        single: () => builder,
        update: (payload: Call["payload"]) => ((call.op = "update"), (call.payload = payload), builder),
        then: (resolve: (value: Result) => unknown, reject: (error: unknown) => unknown) => {
          const result = handler(call, calls.slice());
          calls.push(call);
          return Promise.resolve(result).then(resolve, reject);
        },
      };
      return builder;
    },
  };
  return { calls, client: client as unknown as SupabaseClient };
}

const spotify = "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC";
const cover = "https://i.scdn.co/image/ab67616d00001e02";
const songRow = (extra: Record<string, unknown> = {}) => ({
  added_by: "user-1",
  artist: "Silvana Estrada",
  created_at: "2026-01-01",
  id: "song-1",
  memory_id: "memory-1",
  title: "Te guardo",
  updated_at: "2026-01-01",
  url: spotify,
  ...extra,
});
const ok = (data: unknown = null): Result => ({ data, error: null });
const songWrites = (calls: Call[]) =>
  calls.filter((call) => call.table === "memory_songs" && call.op !== "select");

describe("song artwork persistence", () => {
  it("stores the cover and maps it back", async () => {
    const { calls, client } = fakeClient((call) =>
      call.table === "memory_songs" && call.op === "insert"
        ? ok(songRow({ artwork_url: cover }))
        : ok([]),
    );
    const song = await createSupabaseMemoryRepository(client, "user-1").addSong("memory-1", {
      artist: "Silvana Estrada",
      artworkUrl: cover,
      title: "Te guardo",
      url: spotify,
    });
    expect(songWrites(calls)[0].payload).toMatchObject({ added_by: "user-1", artwork_url: cover });
    expect(song?.artworkUrl).toBe(cover);
  });

  it("still saves the song when the artwork migration is not applied", async () => {
    const { calls, client } = fakeClient((call) => {
      if (call.table === "memory_songs" && call.op === "insert") {
        return call.payload && "artwork_url" in call.payload
          ? { data: null, error: { code: "PGRST204", message: "Could not find the 'artwork_url' column of 'memory_songs'" } }
          : ok(songRow());
      }
      return ok([]);
    });
    const song = await createSupabaseMemoryRepository(client, "user-1").addSong("memory-1", {
      artist: "",
      artworkUrl: cover,
      title: "Te guardo",
      url: spotify,
    });
    const inserts = songWrites(calls);
    expect(inserts).toHaveLength(2);
    expect(inserts[1].payload).not.toHaveProperty("artwork_url");
    expect(song?.id).toBe("song-1");
  });

  it("never retries unrelated failures such as duplicates", async () => {
    const { calls, client } = fakeClient((call) =>
      call.table === "memory_songs" && call.op === "insert"
        ? { data: null, error: { code: "23505", message: "duplicate key" } }
        : ok([]),
    );
    await expect(
      createSupabaseMemoryRepository(client, "user-1").addSong("memory-1", {
        artist: "",
        artworkUrl: cover,
        title: "Te guardo",
        url: spotify,
      }),
    ).rejects.toThrow("Ya añadieron esta canción");
    expect(songWrites(calls)).toHaveLength(1);
  });

  it("drops covers from foreign hosts and leaves the column alone when unknown", async () => {
    const { calls, client } = fakeClient((call) =>
      call.table === "memory_songs" && call.op === "update" ? ok(songRow()) : ok([]),
    );
    const repository = createSupabaseMemoryRepository(client, "user-1");
    await repository.updateSong("memory-1", "song-1", {
      artist: "",
      artworkUrl: "https://tracker.example/pixel.png",
      title: "Te guardo",
      url: spotify,
    });
    await repository.updateSong("memory-1", "song-1", { artist: "", title: "Te guardo", url: spotify });
    const [foreign, unknown] = songWrites(calls);
    expect(foreign.payload).toMatchObject({ artwork_url: null });
    expect(unknown.payload).not.toHaveProperty("artwork_url");
  });

  it("clears the first song's cover when the memory form changes its link", async () => {
    const youtube = "https://www.youtube.com/watch?v=M7lc1UVf-VE";
    const run = async (songUrl: string) => {
      const { calls, client } = fakeClient((call) => {
        if (call.table === "memories" && call.op === "update") return ok({ id: "memory-1" });
        if (call.table === "memory_songs" && call.op === "select") return ok([songRow({ artwork_url: cover })]);
        return ok([]);
      });
      await createSupabaseMemoryRepository(client, "user-1").update("memory-1", {
        description: "Una historia suficientemente larga.",
        memoryDate: "2026-08-16",
        songArtist: "",
        songTitle: "Canción",
        songUrl,
        title: "Recuerdo",
      });
      return songWrites(calls)[0].payload;
    };
    expect(await run(youtube)).toMatchObject({ artwork_url: null, url: youtube });
    expect(await run(spotify)).not.toHaveProperty("artwork_url");
  });
});

describe("photo placeholders", () => {
  it("keeps a valid preview for stored photos and rejects anything else", async () => {
    const placeholder = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
    const { calls, client } = fakeClient((call) =>
      call.table === "memory_photos" && call.op === "insert"
        ? ok([{ id: "p1", storage_path: "space-1/memory-1/a.webp" }])
        : call.table === "memories" && call.op === "update"
          ? ok({ id: "memory-1" })
          : ok([]),
    );
    await createSupabaseMemoryRepository(client, "user-1").update("memory-1", {
      description: "Una historia suficientemente larga.",
      memoryDate: "2026-08-16",
      photos: [
        { alt: "Con vista previa", placeholder, storagePath: "space-1/memory-1/a.webp" },
        { alt: "Valor extraño", placeholder: "url(https://evil.example)", storagePath: "space-1/memory-1/b.webp" },
        { alt: "Ilustración", visualValue: "linear-gradient(red, blue)" },
      ],
      songArtist: "",
      songTitle: "",
      songUrl: "",
      title: "Recuerdo",
    });
    const insert = calls.find((call) => call.table === "memory_photos" && call.op === "insert");
    expect((insert?.payload as Record<string, unknown>[]).map((row) => row.visual_value)).toEqual([
      placeholder,
      null,
      "linear-gradient(red, blue)",
    ]);
  });
});
