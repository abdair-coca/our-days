"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import {
  deleteMemorySongAction,
  type MemorySongMutationResult,
} from "@/features/memories/mutations";
import type { MemorySong } from "@/types/memory";
import { Button } from "@/components/ui/button";
import { MusicIcon, PlusIcon } from "@/components/ui/icons";

import { SongCard } from "./song-card";
import { SongDialog } from "./song-dialog";

type SongCollectionProps = {
  memoryId: string;
  songs: readonly MemorySong[];
};

type DialogState =
  | { mode: "add"; song?: undefined }
  | { mode: "edit"; song: MemorySong }
  | null;

export function SongCollection({ memoryId, songs }: SongCollectionProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [activeSongId, setActiveSongId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [pendingSongId, setPendingSongId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  function handleSongCompleted(result: MemorySongMutationResult) {
    setDialog(null);
    setMessage(result.message);
    if (result.mode === "supabase") {
      router.refresh();
    }
  }

  async function handleDelete(song: MemorySong) {
    if (!window.confirm(`¿Eliminar “${song.title}”? Esta acción no se puede deshacer.`)) {
      return;
    }

    setPendingSongId(song.id);
    setMessage("");
    const result = await deleteMemorySongAction(memoryId, song.id);
    setPendingSongId(null);

    if (result.ok) {
      setActiveSongId((current) => (current === song.id ? null : current));
      setMessage(result.message);
      if (result.mode === "supabase") {
        router.refresh();
      }
      return;
    }

    setMessage(result.message);
  }

  return (
    <section aria-labelledby="songs-title" className="min-w-0">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-olive uppercase">
            <span className="inline-flex items-center gap-2">
              <MusicIcon size={16} />
              Banda sonora
            </span>
          </p>
          <h2 className="mt-2 font-serif text-2xl font-semibold" id="songs-title">
            {songs.length > 1 ? "Canciones del recuerdo" : "Canción del recuerdo"}
          </h2>
        </div>
        <Button
          aria-label="Añadir canción"
          className="shrink-0 p-3"
          onClick={() => {
            setMessage("");
            setDialog({ mode: "add" });
          }}
          title="Añadir canción"
          variant="secondary"
        >
          <PlusIcon size={18} />
        </Button>
      </div>

      {songs.length > 0 ? (
        <div className="grid gap-3">
          <AnimatePresence initial={false} mode="popLayout">
            {songs.map((song) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                exit={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.98, y: -4 }
                }
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                key={song.id}
                transition={{
                  duration: shouldReduceMotion ? 0.1 : 0.24,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <SongCard
                  isActive={activeSongId === song.id}
                  onDelete={pendingSongId ? undefined : () => handleDelete(song)}
                  onEdit={pendingSongId ? undefined : () => {
                    setMessage("");
                    setActiveSongId(null);
                    setDialog({ mode: "edit", song });
                  }}
                  onPlay={() => setActiveSongId((current) => (current === song.id ? null : song.id))}
                  song={song}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="rounded-[var(--radius-card)] border border-dashed border-border p-5">
          <p className="text-sm leading-6 text-text-soft">
            Todavía no hay una canción para este recuerdo.
          </p>
          <Button
            className="mt-4"
            onClick={() => setDialog({ mode: "add" })}
            variant="secondary"
          >
            <PlusIcon size={18} />
            Añadir canción
          </Button>
        </div>
      )}

      {message ? (
        <p aria-live="polite" className="mt-3 text-xs text-text-soft">
          {message}
        </p>
      ) : null}

      {dialog ? (
        <SongDialog
          memoryId={memoryId}
          onClose={() => setDialog(null)}
          onCompleted={handleSongCompleted}
          song={dialog.mode === "edit" ? dialog.song : undefined}
        />
      ) : null}
    </section>
  );
}
