"use client";

import { motion, useReducedMotion } from "motion/react";

import type { MemorySong } from "@/types/memory";

type SongCardProps = {
  song: MemorySong | null;
};

export function SongCard({ song }: SongCardProps) {
  const shouldReduceMotion = useReducedMotion();

  if (!song) {
    return (
      <section className="rounded-3xl border border-dashed border-ink/15 p-5">
        <h2 className="font-serif text-xl font-semibold">Canción</h2>
        <p className="mt-1 text-sm text-muted">Sin canción asociada todavía.</p>
      </section>
    );
  }

  return (
    <motion.section
      className="rounded-3xl border border-ink/10 bg-white/70 p-5"
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
    >
      <p className="text-xs font-bold tracking-[0.14em] text-sage uppercase">
        Canción del recuerdo
      </p>
      <h2 className="mt-2 font-serif text-xl font-semibold">{song.title}</h2>
      <p className="text-sm text-muted">{song.artist}</p>
      <a
        className="mt-4 inline-flex min-h-11 items-center rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold transition hover:border-sage hover:bg-sage/10"
        href={song.url}
        rel="noreferrer"
        target="_blank"
      >
        Abrir enlace musical
        <span className="sr-only"> en una pestaña nueva</span>
      </a>
    </motion.section>
  );
}
