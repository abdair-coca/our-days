import { describe, expect, it, vi } from "vitest";

import {
  cleanChannelName,
  cleanVideoTitle,
  fetchSongMetadata,
  isAllowedArtworkUrl,
  splitVideoTitle,
} from "./song-metadata";

function respond(body: unknown, ok = true) {
  return vi.fn(async () => ({ ok, json: async () => body }) as Response);
}

describe("YouTube title cleanup", () => {
  it("drops official/lyrics noise but keeps meaningful brackets", () => {
    expect(cleanVideoTitle("Natalia Lafourcade - Hasta la Raíz (Official Video)")).toBe(
      "Natalia Lafourcade - Hasta la Raíz",
    );
    expect(cleanVideoTitle("Zoé - Luna [Lyrics] (HD)")).toBe("Zoé - Luna");
    expect(cleanVideoTitle("Te guardo (En Vivo)")).toBe("Te guardo (En Vivo)");
    expect(cleanVideoTitle("Mediodía | Video Oficial")).toBe("Mediodía");
  });
  it("splits artist and song, otherwise falls back to a cleaned channel", () => {
    expect(splitVideoTitle("Jorge Drexler – Estrellas (Audio)", "Jorge Drexler")).toEqual({
      artist: "Jorge Drexler",
      title: "Estrellas",
    });
    expect(splitVideoTitle("Agua quieta", "BonoboVEVO")).toEqual({ artist: "Bonobo", title: "Agua quieta" });
    expect(cleanChannelName("Silvana Estrada - Topic")).toBe("Silvana Estrada");
  });
  it("caps fields to the database limits", () => {
    expect(splitVideoTitle("x".repeat(240), "y".repeat(240)).title).toHaveLength(100);
  });
});

describe("artwork allowlist", () => {
  it("accepts provider image CDNs over https only", () => {
    expect(isAllowedArtworkUrl("https://i.scdn.co/image/ab67616d00001e02")).toBe(true);
    expect(isAllowedArtworkUrl("https://image-cdn-ak.spotifycdn.com/image/ab67")).toBe(true);
    expect(isAllowedArtworkUrl("https://i.ytimg.com/vi/x/hqdefault.jpg")).toBe(true);
    expect(isAllowedArtworkUrl("http://i.scdn.co/image/x")).toBe(false);
    expect(isAllowedArtworkUrl("https://evil.example/i.scdn.co.png")).toBe(false);
    expect(isAllowedArtworkUrl("https://user:pass@i.scdn.co/x")).toBe(false);
    expect(isAllowedArtworkUrl(`https://i.scdn.co/${"a".repeat(600)}`)).toBe(false);
  });
});

describe("oEmbed lookup", () => {
  it("only calls the provider endpoint for recognised songs", async () => {
    const fetcher = respond({ title: "Song" });
    expect(await fetchSongMetadata("https://example.com/song", fetcher)).toBeNull();
    expect(await fetchSongMetadata("https://open.spotify.com/album/1", fetcher)).toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("reads YouTube title/channel from the canonical watch URL", async () => {
    const fetcher = respond({ title: "Natalia Lafourcade - Nunca Es Suficiente (Video Oficial)", author_name: "NataliaLafourcadeVEVO", thumbnail_url: "https://i.ytimg.com/vi/x/hqdefault.jpg" });
    const metadata = await fetchSongMetadata("https://youtu.be/abc123?si=tracking", fetcher);
    expect(fetcher).toHaveBeenCalledWith(
      "https://www.youtube.com/oembed?format=json&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3Dabc123",
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(metadata).toEqual({ artist: "Natalia Lafourcade", title: "Nunca Es Suficiente" });
  });
  it("keeps Spotify artwork when it comes from Spotify's CDN", async () => {
    const good = await fetchSongMetadata(
      "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC",
      respond({ title: "Te guardo", thumbnail_url: "https://image-cdn-fa.spotifycdn.com/image/ab67616d" }),
    );
    expect(good).toEqual({ artist: "", artworkUrl: "https://image-cdn-fa.spotifycdn.com/image/ab67616d", title: "Te guardo" });
    const foreign = await fetchSongMetadata(
      "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC",
      respond({ title: "Te guardo", thumbnail_url: "https://tracker.example/pixel.png" }),
    );
    expect(foreign?.artworkUrl).toBeUndefined();
  });
  it("fails quietly on provider errors, bad payloads and network failures", async () => {
    const spotify = "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC";
    expect(await fetchSongMetadata(spotify, respond({}, false))).toBeNull();
    expect(await fetchSongMetadata(spotify, respond({ title: "  " }))).toBeNull();
    expect(await fetchSongMetadata(spotify, respond("nope"))).toBeNull();
    expect(await fetchSongMetadata(spotify, vi.fn(async () => { throw new Error("offline"); }))).toBeNull();
  });
});
