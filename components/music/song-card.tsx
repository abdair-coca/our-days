"use client";

import { motion, useReducedMotion } from "motion/react";

import { ExternalLinkIcon, MusicIcon } from "@/components/ui/icons";
import type { MemorySong } from "@/types/memory";

type SongCardProps = {
  song: MemorySong | null;
};

export function SongCard({ song }: SongCardProps) {
  const shouldReduceMotion = useReducedMotion();

  if (!song) {
    return (
      <section className="rounded-[var(--radius-card)] border border-dashed border-border p-5">
        <h2 className="font-serif text-xl font-semibold">Canción</h2>
        <p className="mt-1 text-sm text-text-soft">Sin canción asociada todavía.</p>
      </section>
    );
  }

  return (
    <motion.section
      className="rounded-[var(--radius-card)] border border-border-soft bg-surface-soft p-5"
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
    >
      <p className="text-xs font-bold tracking-[0.14em] text-olive uppercase">
        <span className="inline-flex items-center gap-2">
          <MusicIcon size={16} />
          Canción del recuerdo
        </span>
      </p>
      <h2 className="mt-2 font-serif text-xl font-semibold">{song.title}</h2>
      <p className="text-sm text-text-soft">{song.artist}</p>
      <a
        aria-label="Abrir enlace musical"
        className="mt-4 inline-flex min-h-11 items-center rounded-[var(--radius-button)] border border-border px-4 py-2 text-sm font-semibold transition-[color,background-color,border-color,transform] duration-[var(--motion-fast)] hover:-translate-y-px hover:border-olive hover:bg-accent-soft/50"
        href={song.url}
        rel="noreferrer"
        target="_blank"
        title="Abrir enlace musical"
      >
        <ExternalLinkIcon />
        <span className="sr-only">Abrir enlace musical en una pestaña nueva</span>
      </a>
    </motion.section>
  );
}
