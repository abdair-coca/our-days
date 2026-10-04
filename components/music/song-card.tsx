"use client";

import { motion, useReducedMotion } from "motion/react";
import { resolveSongLink } from "@/features/music/song-source";
import { Button } from "@/components/ui/button";
import {
  EditIcon,
  ExternalLinkIcon,
  MusicIcon,
  PlayIcon,
  TrashIcon,
} from "@/components/ui/icons";
import type { MemorySong } from "@/types/memory";

type SongCardProps = {
  isActive?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
  onPlay?: () => void;
  song: MemorySong;
};

export function SongCard({
  isActive = false,
  onDelete,
  onEdit,
  onPlay,
  song,
}: SongCardProps) {
  const reducedMotion = useReducedMotion();
  const source = resolveSongLink(song.url);
  return (
    <motion.article
      className="rounded-[var(--radius-card)] border border-border-soft bg-surface-soft p-4 sm:p-5"
      layout
      whileHover={reducedMotion ? undefined : { y: -2 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-olive uppercase">
            <MusicIcon size={16} />
            Canción del recuerdo
          </p>
          <h3 className="mt-2 truncate font-serif text-xl font-semibold">
            {song.title || "Sin título"}
          </h3>
          {song.artist ? (
            <p className="truncate text-sm text-text-soft">{song.artist}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {source.ok ? (
            <Button
              aria-label={`Reproducir ${song.title || "canción"}`}
              aria-pressed={isActive}
              className="p-3"
              onClick={onPlay}
              title="Reproducir en el reproductor global"
              variant="secondary"
            >
              <PlayIcon size={18} />
            </Button>
          ) : null}
          {onEdit ? (
            <Button
              aria-label={`Editar ${song.title || "canción"}`}
              className="p-3"
              onClick={onEdit}
              variant="quiet"
            >
              <EditIcon size={18} />
            </Button>
          ) : null}
          {onDelete ? (
            <Button
              aria-label={`Eliminar ${song.title || "canción"}`}
              className="p-3 text-error"
              onClick={onDelete}
              variant="quiet"
            >
              <TrashIcon size={18} />
            </Button>
          ) : null}
        </div>
      </div>
      <p className="mt-3 text-xs text-text-soft">
        {isActive
          ? "Seleccionada en el reproductor global."
          : source.ok
            ? `Disponible en ${source.provider === "spotify" ? "Spotify" : "YouTube"}.`
            : song.url.trim()
              ? "Este enlace se abrirá fuera de la app."
              : "Añade un enlace para reproducir esta canción."}
      </p>
      {song.url.trim() ? (
        <a
          aria-label={`Abrir ${song.title || "canción"} externamente`}
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-button)] px-2 text-xs font-semibold text-accent hover:bg-accent-soft/45"
          href={source.ok ? source.canonicalUrl : song.url}
          rel="noreferrer"
          target="_blank"
        >
          <ExternalLinkIcon size={16} />
          Abrir externamente
        </a>
      ) : null}
    </motion.article>
  );
}
