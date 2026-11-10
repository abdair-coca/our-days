"use client";

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

import Link from "next/link";

import { cardHover, imageHover } from "@/components/motion/variants";
import { useMusicPlayer } from "@/components/music/music-player";
import { Equalizer } from "@/components/music/track-visuals";
import { FadeImage, placeholderStyle } from "@/components/ui/fade-image";
import { ArrowLeftIcon, ImagesIcon, MusicIcon } from "@/components/ui/icons";
import { formatMemoryDate } from "@/lib/utils/format-memory-date";
import type { Memory } from "@/types/memory";

type MemoryCardProps = {
  memory: Memory;
  priority?: boolean;
};

export function MemoryCard({ memory, priority = false }: MemoryCardProps) {
  const cover = memory.photos[0];
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [imageState, setImageState] = useState<"ready" | "refreshing" | "failed">(
    "ready",
  );
  const { state: music } = useMusicPlayer();
  const songPlaying = music.status === "playing" && music.track?.memoryId === memory.id;
  const songCount = memory.songs.length;

  function handleImageError() {
    if (imageState === "ready") {
      setImageState("refreshing");
      router.refresh();
      return;
    }

    setImageState("failed");
  }

  return (
    <motion.article
      className="group h-full overflow-hidden rounded-3xl border border-ink/8 bg-card shadow-sm"
      onPointerMove={(event) => {
        if (shouldReduceMotion || event.pointerType !== "mouse") return;
        const bounds = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--mx", `${event.clientX - bounds.left}px`);
        event.currentTarget.style.setProperty("--my", `${event.clientY - bounds.top}px`);
      }}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      variants={cardHover}
      whileHover={shouldReduceMotion ? undefined : "hover"}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      whileTap={shouldReduceMotion ? undefined : "tap"}
      viewport={{ margin: "0px 0px -8% 0px", once: true }}
    >
      <Link
        className="block h-full rounded-3xl focus-visible:outline-offset-4"
        href={`/memories/${memory.id}`}
        prefetch={priority}
      >
        <motion.div
          aria-busy={imageState === "refreshing" || undefined}
          aria-label={
            imageState === "failed"
              ? `${cover?.alt ?? "Imagen del recuerdo"}. No pudimos cargar esta foto.`
              : cover?.src
                ? undefined
                : cover?.alt ?? "Recuerdo sin imagen"
          }
          className="relative aspect-[4/3] w-full overflow-hidden bg-[#eadfd7] bg-cover bg-center"
          role={cover?.src && imageState !== "failed" ? undefined : "img"}
          style={{
            backgroundImage:
              cover?.src && imageState !== "failed"
                ? placeholderStyle(cover)?.backgroundImage
                : cover?.gradient,
          }}
          variants={imageHover}
        >
          {cover?.src && imageState !== "failed" ? (
            <FadeImage
              alt={cover.alt}
              className="size-full object-cover"
              decoding="async"
              loading={priority ? "eager" : "lazy"}
              onError={handleImageError}
              onLoad={() => setImageState("ready")}
              src={cover.src}
            />
          ) : imageState === "failed" ? (
            <div className="grid size-full place-items-center bg-surface/75 p-4 text-center">
              <span className="text-sm font-semibold text-text">Imagen no disponible</span>
            </div>
          ) : null}
          <span aria-hidden="true" className="memory-card-light" />
          {memory.photos.length > 1 || songCount > 0 ? (
            <span className="absolute top-3 left-3 flex gap-1.5">
              {memory.photos.length > 1 ? (
                <span className="memory-chip">
                  <ImagesIcon aria-hidden="true" size={13} />
                  {memory.photos.length}
                  <span className="sr-only"> fotos</span>
                </span>
              ) : null}
              {songCount > 0 ? (
                <span className="memory-chip" data-playing={songPlaying}>
                  {songPlaying ? <Equalizer active /> : <MusicIcon aria-hidden="true" size={13} />}
                  {songPlaying ? "Sonando" : songCount}
                  <span className="sr-only">{songPlaying ? "" : songCount === 1 ? " canción" : " canciones"}</span>
                </span>
              ) : null}
            </span>
          ) : null}
        </motion.div>
        <div className="p-5">
          <time
            className="text-xs font-bold tracking-[0.14em] text-blush-dark uppercase"
            dateTime={memory.memoryDate}
          >
            {formatMemoryDate(memory.memoryDate)}
          </time>
          <h2 className="mt-2 flex items-start justify-between gap-3 font-serif text-2xl leading-tight font-semibold">
            <span className="min-w-0">{memory.title}</span>
            <ArrowLeftIcon
              aria-hidden="true"
              className="mt-1.5 shrink-0 rotate-180 text-accent opacity-0 transition-[opacity,transform] duration-[var(--motion-fast)] ease-[var(--ease-gentle)] group-hover:translate-x-1 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"
              size={18}
            />
          </h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
            {memory.description}
          </p>
        </div>
      </Link>
    </motion.article>
  );
}
