"use client";

import { useEffect, useRef, useState } from "react";

import { getSongMetadataAction } from "@/features/music/metadata-action";
import type { SongMetadata } from "@/features/music/song-metadata";
import { resolveSongLink } from "@/features/music/song-source";

export type SongMetadataStatus = "idle" | "loading" | "found" | "missing";

/**
 * Looks up title/artist/cover for a pasted song link. `skipUrl` (the saved
 * canonical link when editing) avoids overwriting what people already chose.
 * `onResolved` runs once per lookup, never for a stale link.
 */
export function useSongMetadata(
  url: string,
  {
    onResolved,
    skipUrl,
  }: {
    onResolved: (metadata: SongMetadata | null, canonicalUrl: string) => void;
    skipUrl?: string;
  },
) {
  const source = url.trim() ? resolveSongLink(url) : null;
  const canonical = source?.ok ? source.canonicalUrl : null;
  const [lookup, setLookup] = useState<{ url: string; status: SongMetadataStatus }>({
    status: "idle",
    url: "",
  });
  const resolved = useRef(onResolved);
  useEffect(() => {
    resolved.current = onResolved;
  }, [onResolved]);

  useEffect(() => {
    if (!canonical || canonical === skipUrl) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLookup({ status: "loading", url: canonical });
      void getSongMetadataAction(canonical)
        .catch(() => ({ ok: false as const }))
        .then((result) => {
          if (cancelled) return;
          setLookup({ status: result.ok ? "found" : "missing", url: canonical });
          resolved.current(result.ok ? result.metadata : null, canonical);
        });
    }, 350);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [canonical, skipUrl]);

  // A status only describes the link it was fetched for; a new link is
  // "loading" from the first keystroke, including the debounce.
  if (!canonical || canonical === skipUrl) return "idle";
  return lookup.url === canonical ? lookup.status : "loading";
}
