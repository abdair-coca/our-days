"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { resolveSongLink } from "@/features/music/song-source";
import { Button } from "@/components/ui/button";
import {
  EditIcon,
  ExternalLinkIcon,
  MusicIcon,
  PlayIcon,
  TrashIcon,
  XIcon,
} from "@/components/ui/icons";
import type { MemorySong } from "@/types/memory";

import { SongEmbed } from "./song-embed";

type SongCardProps = {
  isActive?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
  onPlay?: () => void;
  song: MemorySong;
};

function providerLabel(provider: "spotify" | "youtube") {
  return provider === "spotify" ? "Spotify" : "YouTube Music";
}

export function SongCard({
  isActive = false,
  onDelete,
  onEdit,
  onPlay,
  song,
}: SongCardProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const source = resolveSongLink(song.url);
  const hasExternalUrl = song.url.trim().length > 0;

  return (
    <motion.article
      className="relative overflow-hidden rounded-[var(--radius-card)] border border-border-soft bg-surface-soft p-4 sm:p-5"
      layout
      transition={{
        duration: shouldReduceMotion ? 0.1 : 0.28,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-[0.14em] text-olive uppercase">
            <span className="inline-flex items-center gap-2">
              <MusicIcon size={16} />
              Canción del recuerdo
            </span>
          </p>
          <h3 className="mt-2 truncate font-serif text-xl font-semibold">
            {song.title || "Sin título"}
          </h3>
          {song.artist ? <p className="truncate text-sm text-text-soft">{song.artist}</p> : null}
        </div>

        {!isActive ? (
          <div className="flex shrink-0 items-center gap-1">
            {source.ok ? (
              <Button
                aria-label={`Reproducir ${song.title || "canción"}`}
                aria-pressed={isActive}
                className="p-3"
                onClick={onPlay}
                title="Reproducir canción"
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
                title="Editar canción"
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
                title="Eliminar canción"
                variant="quiet"
              >
                <TrashIcon size={18} />
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {source.ok ? (
        <p className="mt-3 text-xs text-text-soft">Disponible en {providerLabel(source.provider)}.</p>
      ) : (
        <p className="mt-3 text-xs text-text-soft">
          {hasExternalUrl
            ? "Este enlace se abrirá fuera de la app."
            : "Añade un enlace para reproducir esta canción."}
        </p>
      )}

      {hasExternalUrl ? (
        <a
          aria-label={`Abrir ${song.title || "canción"} externamente`}
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-button)] px-2 text-xs font-semibold text-accent transition-[color,background-color,transform] duration-[var(--motion-fast)] hover:-translate-y-px hover:bg-accent-soft/45 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent motion-reduce:transition-none motion-reduce:hover:transform-none"
          href={song.url}
          rel="noreferrer"
          target="_blank"
          title="Abrir enlace musical"
        >
          <ExternalLinkIcon size={16} />
          <span>Abrir externamente</span>
        </a>
      ) : null}

      <AnimatePresence initial={false}>
        {source.ok && isActive ? (
          <motion.div
            animate={{ opacity: 1 }}
            aria-label={`Reproductor de ${song.title || "esta canción"}`}
            className="absolute inset-0 z-10 bg-surface-soft"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            key="song-player"
            transition={{
              duration: shouldReduceMotion ? 0.1 : 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <SongEmbed autoplay fill source={source} title={song.title || "esta canción"} />
            <motion.button
              aria-label="Cerrar reproductor"
              className="absolute top-3 right-3 z-20 inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-border bg-surface/90 p-0 text-text shadow-[var(--shadow-card)] backdrop-blur-sm transition-[color,background-color,border-color,box-shadow] duration-[var(--motion-fast)] hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent motion-reduce:transition-none"
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.78, x: 8, y: -8 }
              }
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.78, x: 8, y: -8 }}
              onClick={onPlay}
              title="Cerrar reproductor"
              transition={{
                delay: shouldReduceMotion ? 0 : 0.06,
                duration: shouldReduceMotion ? 0.1 : 0.22,
                ease: [0.22, 1, 0.36, 1],
              }}
              type="button"
              whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
            >
              <XIcon size={16} />
              <span className="sr-only">Cerrar reproductor</span>
            </motion.button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
}
