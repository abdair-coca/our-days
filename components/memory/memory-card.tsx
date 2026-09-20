"use client";

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

/* Signed Supabase URLs are private and dynamic, so native loading is intentional. */
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import { cardHover, imageHover } from "@/components/motion/variants";
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
          className="aspect-[4/3] w-full overflow-hidden bg-[#eadfd7]"
          role={cover?.src && imageState !== "failed" ? undefined : "img"}
          style={{
            backgroundImage:
              cover?.src && imageState !== "failed" ? undefined : cover?.gradient,
          }}
          variants={imageHover}
        >
          {cover?.src && imageState !== "failed" ? (
            <img
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
        </motion.div>
        <div className="p-5">
          <time
            className="text-xs font-bold tracking-[0.14em] text-blush-dark uppercase"
            dateTime={memory.memoryDate}
          >
            {formatMemoryDate(memory.memoryDate)}
          </time>
          <h2 className="mt-2 font-serif text-2xl leading-tight font-semibold">
            {memory.title}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
            {memory.description}
          </p>
        </div>
      </Link>
    </motion.article>
  );
}
