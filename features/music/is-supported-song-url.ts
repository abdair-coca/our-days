const supportedHosts = new Set([
  "open.spotify.com",
  "music.youtube.com",
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
]);

export function isSupportedSongUrl(value: string): boolean {
  try {
    return supportedHosts.has(new URL(value).hostname);
  } catch {
    return false;
  }
}
