import { resolveSongLink } from "./song-source";

export type SongMetadata = {
  artist: string;
  /** Only stored when the provider has no deterministic thumbnail (Spotify). */
  artworkUrl?: string;
  title: string;
};

const MAX_FIELD = 100;
const MAX_ARTWORK_URL = 500;

/* Bracketed noise that YouTube uploads add around the actual song name. */
const NOISE =
  /\b(official|oficial|video|v[ií]deo|videoclip|audio|lyrics?|letra|visuali[sz]er|hd|hq|4k|remaster(ed)?|mv|clip)\b/i;

function clip(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, MAX_FIELD);
}

/** Removes "(Official Video)", "[Lyrics]", "| Video Oficial" and similar. */
export function cleanVideoTitle(title: string) {
  return clip(
    title
      .replace(/\s*[([]([^)\]]*)[)\]]/g, (match, inner: string) => (NOISE.test(inner) ? "" : match))
      .replace(/\s*[|｜]\s*[^|｜]*$/u, (match) => (NOISE.test(match) ? "" : match)),
  );
}

/** "NataliaLafourcadeVEVO", "Zoé - Topic" → a usable artist name. */
export function cleanChannelName(name: string) {
  return clip(
    name
      .replace(/\s*-\s*topic$/i, "")
      .replace(/vevo$/i, "")
      .replace(/\s+(official|oficial)$/i, ""),
  );
}

/** YouTube titles usually read "Artist - Song"; fall back to the channel. */
export function splitVideoTitle(rawTitle: string, channel: string): Pick<SongMetadata, "artist" | "title"> {
  const title = cleanVideoTitle(rawTitle);
  const separator = title.match(/\s+[-–—]\s+/);
  if (separator?.index) {
    const artist = clip(title.slice(0, separator.index));
    const song = clip(title.slice(separator.index + separator[0].length));
    if (artist && song) return { artist, title: song };
  }
  return { artist: cleanChannelName(channel), title };
}

export function isAllowedArtworkUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > MAX_ARTWORK_URL) return false;
  try {
    const url = new URL(value);
    const host = url.hostname;
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      (host === "i.ytimg.com" || host.endsWith(".scdn.co") || host.endsWith(".spotifycdn.com"))
    );
  } catch {
    return false;
  }
}

function field(payload: unknown, key: string) {
  const value = typeof payload === "object" && payload !== null ? (payload as Record<string, unknown>)[key] : undefined;
  return typeof value === "string" ? value : "";
}

/**
 * Reads the providers' official, unauthenticated oEmbed endpoints. Only the
 * canonical URL of an already-recognised song is ever sent, so this cannot be
 * used to reach arbitrary hosts.
 */
export async function fetchSongMetadata(
  url: string,
  fetcher: typeof fetch = fetch,
): Promise<SongMetadata | null> {
  const source = resolveSongLink(url);
  if (!source.ok) return null;
  const endpoint =
    source.provider === "youtube"
      ? `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(source.canonicalUrl)}`
      : `https://open.spotify.com/oembed?url=${encodeURIComponent(source.canonicalUrl)}`;
  try {
    const response = await fetcher(endpoint, {
      cache: "no-store",
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return null;
    const payload: unknown = await response.json();
    const rawTitle = field(payload, "title");
    if (!rawTitle.trim()) return null;
    if (source.provider === "youtube") {
      return splitVideoTitle(rawTitle, field(payload, "author_name"));
    }
    const artwork = field(payload, "thumbnail_url");
    return {
      // Spotify's oEmbed names the track but not the artist.
      artist: clip(field(payload, "author_name")),
      artworkUrl: isAllowedArtworkUrl(artwork) ? artwork : undefined,
      title: clip(rawTitle),
    };
  } catch {
    return null;
  }
}
