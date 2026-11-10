"use client";

import type { ReactNode } from "react";

import type { SongLinkResult } from "@/features/music/song-source";

import { TrackCover } from "./track-visuals";
import type { SongMetadataStatus } from "./use-song-metadata";

type SongLinkCardProps = {
  action?: ReactNode;
  artist: string;
  artworkUrl?: string;
  footer?: ReactNode;
  source: SongLinkResult;
  status: SongMetadataStatus;
  title: string;
};

const providerName = { spotify: "Spotify", youtube: "YouTube Music" } as const;

/** What the pasted link resolves to: cover, names and lookup progress. */
export function SongLinkCard({ action, artist, artworkUrl, footer, source, status, title }: SongLinkCardProps) {
  if (!source.ok) {
    return (
      <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface-soft p-4" role="status">
        <p className="text-sm font-semibold">Enlace no compatible</p>
        <p className="mt-1 text-xs text-text-soft">Usa el enlace de una canción individual de Spotify o YouTube Music.</p>
      </div>
    );
  }
  const loading = status === "loading";
  return (
    <div
      aria-busy={loading || undefined}
      className="song-link-card rounded-[var(--radius-card)] border border-border-soft bg-surface-soft p-3 sm:p-4"
      data-status={status}
    >
      <div className="flex items-center gap-3">
        <span className="relative shrink-0">
          <TrackCover size={56} track={{ artworkUrl, source, title }} />
          {loading ? <span aria-hidden="true" className="skeleton absolute inset-0 rounded-[10px] bg-transparent" /> : null}
        </span>
        <div className="min-w-0 flex-1" aria-live="polite">
          <p className="truncate text-sm font-semibold">
            {loading ? "Buscando la canción…" : title.trim() || `${providerName[source.provider]} listo`}
          </p>
          <p className="mt-0.5 truncate text-xs text-text-soft">
            {loading
              ? `Consultando ${providerName[source.provider]}`
              : status === "found"
                ? `${artist.trim() ? `${artist} · ` : ""}Datos completados desde ${source.provider === "spotify" ? "Spotify" : "YouTube"}`
                : status === "missing"
                  ? "No pudimos leer los datos; escríbelos tú."
                  : artist.trim() || providerName[source.provider]}
          </p>
        </div>
        {action}
      </div>
      {footer}
    </div>
  );
}
