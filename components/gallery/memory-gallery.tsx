"use client";

import { motion, useReducedMotion } from "motion/react";

import { fadeUp, staggerContainer } from "@/components/motion/variants";
import { StatusPanel } from "@/components/ui/status-panel";
import type { MemoryPhoto } from "@/types/memory";

type MemoryGalleryProps = {
  photos: readonly MemoryPhoto[];
  state?: "loaded" | "loading" | "error";
};

export function MemoryGallery({
  photos,
  state = "loaded",
}: MemoryGalleryProps) {
  const shouldReduceMotion = useReducedMotion();

  if (state === "loading") {
    return (
      <motion.div
        aria-busy="true"
        aria-label="Cargando galería"
        animate={shouldReduceMotion ? undefined : { opacity: [0.58, 1, 0.58] }}
        className="grid gap-4 sm:grid-cols-2"
        transition={
          shouldReduceMotion
            ? undefined
            : { duration: 1.8, ease: "easeInOut", repeat: Infinity }
        }
      >
        <div className="aspect-[4/3] animate-pulse rounded-3xl bg-ink/10 motion-reduce:animate-none sm:col-span-2" />
        <div className="aspect-[4/3] animate-pulse rounded-3xl bg-ink/10 motion-reduce:animate-none" />
      </motion.div>
    );
  }

  if (state === "error") {
    return (
      <StatusPanel title="No pudimos mostrar las imágenes" tone="error">
        Intenta cargar esta página de nuevo.
      </StatusPanel>
    );
  }

  if (photos.length === 0) {
    return (
      <StatusPanel title="Este recuerdo todavía no tiene fotos">
        Puedes añadirlas cuando la carga de imágenes esté conectada.
      </StatusPanel>
    );
  }

  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-2"
      initial={shouldReduceMotion ? false : "hidden"}
      variants={staggerContainer}
      viewport={{ margin: "0px 0px -10% 0px", once: true }}
      whileInView="visible"
    >
      {photos.map((photo, index) => (
        <motion.div
          aria-label={photo.alt}
          className={
            index === 0
              ? "aspect-[4/3] rounded-3xl bg-cover bg-center shadow-soft sm:col-span-2 sm:aspect-[16/9]"
              : "aspect-[4/3] rounded-3xl bg-cover bg-center shadow-sm"
          }
          key={photo.id}
          role="img"
          style={{ backgroundImage: photo.gradient }}
          variants={fadeUp}
        />
      ))}
    </motion.div>
  );
}
