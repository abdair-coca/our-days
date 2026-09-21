"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { resolveSongLink } from "@/features/music/song-source";
import { Button } from "@/components/ui/button";
import {
  ExternalLinkIcon,
  MusicIcon,
  PlayIcon,
  XIcon,
} from "@/components/ui/icons";
import type { MemorySong } from "@/types/memory";

import { SongEmbed } from "./song-embed";

type SongCardProps = {
  song: MemorySong | null;
};

function providerLabel(provider: "spotify" | "youtube") {
  return provider === "spotify" ? "Spotify" : "YouTube Music";
}

export function SongCard({ song }: SongCardProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  if (!song) {
    return (
      <section className="rounded-[var(--radius-card)] border border-dashed border-border p-5">
        <h2 className="font-serif text-xl font-semibold">Canción</h2>
        <p className="mt-1 text-sm text-text-soft">Sin canción asociada todavía.</p>
      </section>
    );
  }

  const source = resolveSongLink(song.url);
  const hasExternalUrl = song.url.trim().length > 0;

  return (
    <motion.section
      className="relative overflow-hidden rounded-[var(--radius-card)] border border-border-soft bg-surface-soft p-5"
      layout
      transition={{
        duration: shouldReduceMotion ? 0.1 : 0.28,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-[0.14em] text-olive uppercase">
            <span className="inline-flex items-center gap-2">
              <MusicIcon size={16} />
              Canción del recuerdo
            </span>
          </p>
          <h2 className="mt-2 font-serif text-xl font-semibold">{song.title || "Sin título"}</h2>
          {song.artist ? <p className="text-sm text-text-soft">{song.artist}</p> : null}
        </div>

        {!isPlayerOpen ? (
          <div className="flex shrink-0 items-center gap-2">
            {source.ok ? (
              <Button
                aria-expanded={isPlayerOpen}
                aria-label="Reproducir canción"
                className="px-3"
                onClick={() => setIsPlayerOpen(true)}
                title="Reproducir canción"
                variant="secondary"
              >
                <PlayIcon />
                <span className="sr-only">Reproducir canción</span>
              </Button>
            ) : null}

            {hasExternalUrl ? (
              <a
                aria-label="Abrir enlace musical"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-button)] border border-border px-3 py-2 text-sm font-semibold transition-[color,background-color,border-color,transform] duration-[var(--motion-fast)] hover:-translate-y-px hover:border-olive hover:bg-accent-soft/50 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent motion-reduce:transition-none motion-reduce:hover:transform-none"
                href={song.url}
                rel="noreferrer"
                target="_blank"
                title="Abrir enlace musical"
              >
                <ExternalLinkIcon />
                <span className="sr-only">Abrir enlace musical en una pestaña nueva</span>
              </a>
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

      <AnimatePresence initial={false}>
        {source.ok && isPlayerOpen ? (
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
              className="absolute top-3 right-3 z-20 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-border bg-surface/90 p-0 text-text shadow-[var(--shadow-card)] backdrop-blur-sm transition-[color,background-color,border-color,box-shadow] duration-[var(--motion-fast)] hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent motion-reduce:transition-none"
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.78, x: 8, y: -8 }
              }
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.78, x: 8, y: -8 }
              }
              onClick={() => setIsPlayerOpen(false)}
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
    </motion.section>
  );
}
