export type SongLinkResult =
  | {
      ok: true;
      provider: "spotify" | "youtube";
      id: string;
      embedUrl: string;
      canonicalUrl: string;
    }
  | {
      ok: false;
      reason: "empty" | "invalid" | "unsupported";
    };

const spotifyHost = "open.spotify.com";
const youtubeHosts = new Set([
  "music.youtube.com",
  "www.youtube.com",
  "youtube.com",
  "youtu.be",
]);

function invalid(): SongLinkResult {
  return { ok: false, reason: "invalid" };
}

function unsupported(): SongLinkResult {
  return { ok: false, reason: "unsupported" };
}

function decodeId(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

function spotifyResult(id: string): SongLinkResult {
  return {
    ok: true,
    provider: "spotify",
    id,
    embedUrl: `https://${spotifyHost}/embed/track/${encodeURIComponent(id)}`,
    canonicalUrl: `https://${spotifyHost}/track/${encodeURIComponent(id)}`,
  };
}

function youtubeResult(id: string): SongLinkResult {
  const encodedId = encodeURIComponent(id);

  return {
    ok: true,
    provider: "youtube",
    id,
    embedUrl: `https://www.youtube.com/embed/${encodedId}`,
    canonicalUrl: `https://www.youtube.com/watch?v=${encodedId}`,
  };
}

export function resolveSongLink(url: string): SongLinkResult {
  if (url.trim() === "") {
    return { ok: false, reason: "empty" };
  }

  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return invalid();
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return invalid();
  }

  if (parsed.hostname === spotifyHost) {
    const match = parsed.pathname.match(/^\/track\/([^/]+)$/);

    if (!match) {
      return unsupported();
    }

    const id = decodeId(match[1]);
    return id === null || id.trim() === "" ? invalid() : spotifyResult(id);
  }

  if (!youtubeHosts.has(parsed.hostname)) {
    return unsupported();
  }

  if (parsed.hostname === "youtu.be") {
    const match = parsed.pathname.match(/^\/([^/]+)$/);

    if (!match) {
      return invalid();
    }

    const id = decodeId(match[1]);
    return id === null || id.trim() === "" ? invalid() : youtubeResult(id);
  }

  if (parsed.pathname !== "/watch") {
    return unsupported();
  }

  const id = parsed.searchParams.get("v");
  return id === null || id.trim() === "" ? invalid() : youtubeResult(id);
}
