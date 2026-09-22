"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import {
  markMemorySeenAction,
  startMemoryWelcomeAction,
  type MemoryPresentation,
} from "@/features/memories/presentation";
import { resolveSongLink } from "@/features/music/song-source";
import { formatMemoryDate } from "@/lib/utils/format-memory-date";
import { Button } from "@/components/ui/button";
import {
  MusicIcon,
  PauseIcon,
  PlayIcon,
  XIcon,
} from "@/components/ui/icons";

import { SongEmbed } from "@/components/music/song-embed";

type MemoryPresentationProps = {
  onClose?: () => void;
  presentation: MemoryPresentation;
};

const STORY_DURATION_MS = 7000;

export function MemoryPresentationOverlay({
  onClose,
  presentation,
}: MemoryPresentationProps) {
  const shouldReduceMotion = useReducedMotion();
  const closeButton = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [phase, setPhase] = useState<"loading" | "ready" | "story">("loading");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const [error, setError] = useState("");
  const memories = presentation.memories;
  const currentMemory = memories[currentIndex];
  const nextMemory = memories[currentIndex + 1];
  const backgroundSource = useMemo(() => {
    if (!presentation.backgroundSong) {
      return null;
    }

    const source = resolveSongLink(presentation.backgroundSong.url);
    return source.ok ? source : null;
  }, [presentation.backgroundSong]);

  const closePresentation = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const goNext = useCallback(() => {
    if (currentIndex >= memories.length - 1) {
      closePresentation();
      return;
    }

    setCurrentIndex((index) => index + 1);
  }, [closePresentation, currentIndex, memories.length]);

  const goPrevious = useCallback(() => {
    setCurrentIndex((index) => Math.max(0, index - 1));
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setPhase("ready"),
      shouldReduceMotion ? 140 : 850,
    );

    return () => window.clearTimeout(timeoutId);
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, phase]);

  useEffect(() => {
    if (
      !isOpen ||
      phase !== "story" ||
      presentation.mode === "replay"
    ) {
      return;
    }

    void markMemorySeenAction(currentMemory.id).then((result) => {
      if (!result.ok) {
        setError(result.message);
      }
    });
  }, [currentMemory.id, isOpen, phase, presentation.mode]);

  useEffect(() => {
    if (!isOpen || phase !== "story" || isPaused) {
      return;
    }

    const timeoutId = window.setTimeout(goNext, STORY_DURATION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [goNext, isOpen, isPaused, phase]);

  useEffect(() => {
    if (!nextMemory?.photos[0]?.src) {
      return;
    }

    const image = new window.Image();
    image.src = nextMemory.photos[0].src;
  }, [nextMemory]);

  useEffect(() => {
    if (!isOpen || phase !== "story") {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closePresentation();
      } else if (event.key === "ArrowRight" || event.key === "Enter") {
        event.preventDefault();
        goNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrevious();
      } else if (event.key === " ") {
        event.preventDefault();
        setIsPaused((paused) => !paused);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closePresentation, goNext, goPrevious, isOpen, phase]);

  async function startPresentation() {
    setIsStarting(true);
    setError("");

    if (presentation.mode === "welcome") {
      const result = await startMemoryWelcomeAction();
      if (!result.ok) {
        setError(result.message);
      }
    }

    setAudioStarted(Boolean(backgroundSource));
    setPhase("story");
    setIsStarting(false);
  }

  if (!isOpen) {
    return null;
  }

  const currentPhoto = currentMemory.photos[0];

  return (
    <div
      aria-label="Presentación de recuerdos"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden bg-[#1d1715] text-white"
      role="dialog"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(196,126,104,0.28),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(110,126,95,0.2),transparent_40%)]" />

      <AnimatePresence mode="wait" initial={false}>
        {phase === "loading" ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="relative flex size-full flex-col items-center justify-center px-6 text-center"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            key="loading"
            transition={{ duration: shouldReduceMotion ? 0.1 : 0.45 }}
          >
            <motion.div
              animate={
                shouldReduceMotion
                  ? undefined
                  : { opacity: [0.7, 1, 0.7], scale: [1, 1.035, 1] }
              }
              className="flex size-20 items-center justify-center rounded-full border border-white/15 bg-white/10 text-3xl"
              transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
            >
              ♥
            </motion.div>
            <p className="mt-7 text-xs font-bold tracking-[0.22em] text-white/60 uppercase">
              Our Days
            </p>
            <p className="mt-3 max-w-sm font-serif text-3xl leading-tight sm:text-4xl">
              Un momento para volver a lo que han vivido.
            </p>
          </motion.div>
        ) : phase === "ready" ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="relative flex size-full flex-col items-center justify-center px-6 text-center"
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: 12 }}
            key="ready"
            transition={{ duration: shouldReduceMotion ? 0.1 : 0.42 }}
          >
            <p className="text-xs font-bold tracking-[0.22em] text-[#e6b9a8] uppercase">
              {presentation.mode === "welcome"
                ? "Una bienvenida"
                : presentation.mode === "replay"
                  ? "Una vuelta"
                  : "Hay algo nuevo"}
            </p>
            <h2 className="mt-4 max-w-2xl font-serif text-5xl leading-[0.98] sm:text-7xl">
              {presentation.mode === "welcome"
                ? "Esta es su historia."
                : presentation.mode === "replay"
                  ? "Volver a sus días."
                  : "Unos días quieren ser vistos."}
            </h2>
            <p className="mt-6 max-w-md text-base leading-7 text-white/65">
              {presentation.mode === "welcome"
                ? `${memories.length} ${memories.length === 1 ? "recuerdo" : "recuerdos"} para conocer el lugar que comparten.`
                : presentation.mode === "replay"
                  ? `${memories.length} ${memories.length === 1 ? "recuerdo" : "recuerdos"} para volver a mirar cuando quieran.`
                  : `${memories.length} ${memories.length === 1 ? "recuerdo nuevo" : "recuerdos nuevos"} esperan una mirada.`}
            </p>
            {backgroundSource ? (
              <p className="mt-4 inline-flex items-center gap-2 text-sm text-white/55">
                <MusicIcon size={16} />
                {presentation.backgroundSong?.title}
              </p>
            ) : null}
            <Button
              className="mt-9 min-w-56 border-white/15 bg-black text-[#2b211d]"
              loading={isStarting}
              loadingLabel="Preparando…"
              onClick={startPresentation}
            >
              {backgroundSource ? "Comenzar con música" : "Comenzar presentación"}
            </Button>
            <Button
              aria-label="Cerrar presentación"
              className="mt-4 text-white/70 hover:bg-white/10 hover:text-white"
              onClick={closePresentation}
              variant="quiet"
            >
              Ver después
            </Button>
          </motion.div>
        ) : (
          <motion.div
            animate={{ opacity: 1 }}
            className="relative size-full"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.1 : 0.32 }}
          >
            {currentPhoto ? (
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-cover bg-center opacity-45 blur-2xl"
                style={{
                  backgroundImage: currentPhoto.src
                    ? `url(${currentPhoto.src})`
                    : currentPhoto.gradient,
                }}
              />
            ) : null}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,18,16,0.6),rgba(24,18,16,0.1)_42%,rgba(24,18,16,0.88))]" />

            <div className="absolute inset-x-4 top-4 z-20 sm:inset-x-8 sm:top-7">
              <div className="flex gap-1.5" aria-label="Progreso de la presentación">
                {memories.map((memory, index) => (
                  <span
                    className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/25"
                    key={memory.id}
                  >
                    {index < currentIndex ? (
                      <span className="absolute inset-0 bg-white" />
                    ) : null}
                    {index === currentIndex ? (
                      <span
                        className="story-progress-fill absolute inset-0 origin-left bg-white"
                        key={`${memory.id}-${currentIndex}`}
                        style={{
                          animationDuration: `${STORY_DURATION_MS}ms`,
                          animationPlayState: isPaused ? "paused" : "running",
                        }}
                      />
                    ) : null}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between gap-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-white/65 uppercase">
                  {presentation.mode === "replay"
                    ? "Su historia"
                    : presentation.mode === "welcome"
                      ? "Su historia"
                      : "Para ponerse al día"}
                </p>
                <Button
                  aria-label="Cerrar presentación"
                  className="rounded-full bg-black/20 p-3 text-white hover:bg-black/35"
                  onClick={closePresentation}
                  ref={closeButton}
                  title="Cerrar"
                  variant="quiet"
                >
                  <XIcon size={18} />
                </Button>
              </div>
            </div>

            <div className="absolute inset-x-4 top-1/2 z-10 mx-auto flex max-w-5xl -translate-y-1/2 items-center justify-center sm:inset-x-16">
              <AnimatePresence initial={false} mode="wait">
                <motion.article
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="w-full"
                  exit={{ opacity: 0, scale: 0.985, y: 8 }}
                  initial={{ opacity: 0, scale: 0.985, y: 8 }}
                  key={currentMemory.id}
                  transition={{ duration: shouldReduceMotion ? 0.1 : 0.38 }}
                >
                  <div className="mx-auto max-w-3xl overflow-hidden rounded-[var(--radius-modal)] border border-white/15 bg-black/20 shadow-[0_30px_100px_rgba(0,0,0,0.25)] backdrop-blur-sm">
                    <div className="relative aspect-[4/3] max-h-[55vh] min-h-52 overflow-hidden bg-white/10 sm:aspect-[16/9]">
                      {currentPhoto?.src ? (
                        <motion.img
                          alt={currentPhoto.alt}
                          animate={{ scale: shouldReduceMotion ? 1 : 1.02 }}
                          className="size-full object-cover"
                          initial={{ scale: shouldReduceMotion ? 1 : 1.045 }}
                          src={currentPhoto.src}
                          transition={{ duration: 7, ease: "linear" }}
                        />
                      ) : (
                        <div
                          aria-label={currentPhoto?.alt ?? currentMemory.title}
                          className="size-full bg-cover bg-center"
                          role="img"
                          style={{ backgroundImage: currentPhoto?.gradient }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                    </div>
                    <div className="p-5 sm:p-8">
                      <time className="text-xs font-bold tracking-[0.16em] text-[#e6b9a8] uppercase">
                        {formatMemoryDate(currentMemory.memoryDate)}
                      </time>
                      <h1 className="mt-2 font-serif text-3xl leading-tight sm:text-5xl">
                        {currentMemory.title}
                      </h1>
                      <p className="mt-3 line-clamp-4 max-w-3xl text-sm leading-6 text-white/72 sm:text-base sm:leading-7">
                        {currentMemory.description}
                      </p>
                      <p className="mt-4 text-xs font-semibold tracking-wide text-white/50">
                        Guardado por {currentMemory.createdBy}
                      </p>
                    </div>
                  </div>
                </motion.article>
              </AnimatePresence>
            </div>

            <button
              aria-label="Recuerdo anterior"
              className="absolute inset-y-24 left-0 z-20 w-1/3 cursor-w-resize focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
              onClick={goPrevious}
              onPointerDown={() => setIsPaused(true)}
              onPointerUp={() => setIsPaused(false)}
              onPointerCancel={() => setIsPaused(false)}
              type="button"
            />
            <button
              aria-label="Siguiente recuerdo"
              className="absolute inset-y-24 right-0 z-20 w-1/3 cursor-e-resize focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
              onClick={goNext}
              onPointerDown={() => setIsPaused(true)}
              onPointerUp={() => setIsPaused(false)}
              onPointerCancel={() => setIsPaused(false)}
              type="button"
            />

            <div className="absolute inset-x-4 bottom-5 z-30 mx-auto flex max-w-5xl items-end justify-between gap-3 sm:inset-x-8 sm:bottom-7">
              <div className="flex min-w-0 items-end gap-2">
                {backgroundSource && audioStarted ? (
                  <div
                    aria-label={`Reproduciendo ${presentation.backgroundSong?.title ?? "la canción"}`}
                    className="relative flex min-w-0 max-w-[min(19rem,68vw)] items-center gap-2.5 overflow-hidden rounded-full border border-white/15 bg-black/30 px-2.5 py-2 shadow-[0_12px_35px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:gap-3 sm:px-3 sm:py-2.5"
                    role="status"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-[#e6b9a8] sm:size-9">
                      <MusicIcon aria-hidden="true" size={15} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-white/90 sm:text-sm">
                        {presentation.backgroundSong?.title ?? "La canción"}
                      </span>
                      <span className="block truncate text-[10px] tracking-[0.12em] text-white/50 uppercase sm:text-[11px]">
                        {presentation.backgroundSong?.artist ||
                          (backgroundSource.provider === "spotify"
                            ? "Spotify"
                            : "YouTube Music")}
                      </span>
                    </span>
                    <SongEmbed
                      autoplay
                      compact
                      visuallyHidden
                      source={backgroundSource}
                      title={presentation.backgroundSong?.title ?? "la canción"}
                    />
                  </div>
                ) : null}
                {error ? (
                  <p className="max-w-xs rounded-full bg-black/30 px-3 py-2 text-xs text-white/75" role="status">
                    {error}
                  </p>
                ) : null}
              </div>
              <Button
                aria-label={isPaused ? "Reanudar presentación" : "Pausar presentación"}
                className="rounded-full bg-black/25 p-3 text-white hover:bg-black/40"
                onClick={() => setIsPaused((paused) => !paused)}
                title={isPaused ? "Reanudar" : "Pausar"}
                variant="quiet"
              >
                {isPaused ? <PlayIcon size={18} /> : <PauseIcon size={18} />}
              </Button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
