"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import {
  addMemorySongAction,
  updateMemorySongAction,
  type MemorySongMutationResult,
} from "@/features/memories/mutations";
import { resolveSongLink } from "@/features/music/song-source";
import { memorySongSchema } from "@/lib/validations/memory";
import type { MemorySong } from "@/types/memory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MusicIcon, PlayIcon, XIcon } from "@/components/ui/icons";

import { SongEmbed } from "./song-embed";

type SongDialogProps = {
  memoryId: string;
  onClose: () => void;
  onCompleted: (result: MemorySongMutationResult) => void;
  song?: MemorySong;
};

export function SongDialog({
  memoryId,
  onClose,
  onCompleted,
  song,
}: SongDialogProps) {
  const dialogPanel = useRef<HTMLDivElement>(null);
  const titleInput = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(song?.title ?? "");
  const [artist, setArtist] = useState(song?.artist ?? "");
  const [url, setUrl] = useState(song?.url ?? "");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const source = url.trim() ? resolveSongLink(url) : null;

  useEffect(() => {
    titleInput.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
        return;
      }

      if (event.key === "Tab") {
        const focusable = Array.from(
          dialogPanel.current?.querySelectorAll<HTMLElement>(
            "button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex=\"-1\"])",
          ) ?? [],
        );
        const first = focusable[0];
        const last = focusable.at(-1);

        if (!first || !last) {
          return;
        }

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSubmitting, onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const parsed = memorySongSchema.safeParse({ artist, title, url });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa los datos de la canción.");
      return;
    }

    if (!source?.ok) {
      setError("Pega un enlace de una canción de Spotify o YouTube Music.");
      return;
    }

    const formData = new FormData();
    formData.set("artist", parsed.data.artist);
    formData.set("title", parsed.data.title);
    formData.set("url", source.canonicalUrl);
    setIsSubmitting(true);

    let result: MemorySongMutationResult;

    if (song) {
      result = await updateMemorySongAction(memoryId, song.id, formData);
    } else {
      result = await addMemorySongAction(memoryId, formData);
    }

    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    onCompleted(result);
  }

  return (
    <div
      aria-label={song ? "Editar canción" : "Añadir canción"}
      className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(30,22,18,0.3)] p-0 sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        aria-describedby="song-dialog-description"
        aria-labelledby="song-dialog-title"
        aria-modal="true"
        className="w-full max-w-xl overflow-y-auto rounded-t-[var(--radius-modal)] border border-border-soft bg-surface p-5 shadow-[var(--shadow-overlay)] sm:max-h-[min(88vh,42rem)] sm:rounded-[var(--radius-modal)] sm:p-7"
        ref={dialogPanel}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-olive uppercase">
              <span className="inline-flex items-center gap-2">
                <MusicIcon size={16} />
                Banda sonora
              </span>
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold" id="song-dialog-title">
              {song ? "Editar canción" : "Añadir canción"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-soft" id="song-dialog-description">
              Guarda el enlace y comprueba que sea la canción que quieres conservar.
            </p>
          </div>
          <Button
            aria-label="Cerrar"
            className="shrink-0 p-3"
            disabled={isSubmitting}
            onClick={onClose}
            title="Cerrar"
            variant="quiet"
          >
            <XIcon size={18} />
          </Button>
        </div>

        <form className="mt-6 grid gap-5" noValidate onSubmit={handleSubmit}>
          <Input
            label="Canción"
            onChange={(event) => setTitle(event.target.value)}
            ref={titleInput}
            required
            value={title}
          />
          <Input
            helpText="Puedes dejarlo vacío."
            label="Artista"
            onChange={(event) => setArtist(event.target.value)}
            value={artist}
          />
          <Input
            error={error && !source?.ok ? error : undefined}
            helpText="Aceptamos canciones individuales de Spotify o YouTube Music."
            inputMode="url"
            label="Enlace musical"
            onChange={(event) => {
              setUrl(event.target.value);
              setPreviewOpen(false);
              setError("");
            }}
            required
            type="url"
            value={url}
          />

          {source ? (
            <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface-soft p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {source.ok ? `${source.provider === "spotify" ? "Spotify" : "YouTube Music"} listo` : "Enlace no compatible"}
                  </p>
                  <p className="mt-1 text-xs text-text-soft">
                    {source.ok
                      ? "La vista previa solo se carga cuando la solicitas."
                      : "Usa un enlace de una canción individual."}
                  </p>
                </div>
                {source.ok ? (
                  <Button
                    aria-label={previewOpen ? "Cerrar vista previa" : "Probar canción"}
                    className="shrink-0 p-3"
                    onClick={() => setPreviewOpen((current) => !current)}
                    title={previewOpen ? "Cerrar vista previa" : "Probar canción"}
                    variant="secondary"
                  >
                    {previewOpen ? <XIcon size={18} /> : <PlayIcon size={18} />}
                  </Button>
                ) : null}
              </div>
              {source.ok && previewOpen ? (
                <div className="mt-4">
                  <SongEmbed autoplay source={source} title={title || "esta canción"} />
                </div>
              ) : null}
            </div>
          ) : null}

          {error && source?.ok ? (
            <p aria-live="polite" className="text-sm font-semibold text-error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-border-soft pt-5 sm:flex-row sm:justify-end">
            <Button disabled={isSubmitting} onClick={onClose} variant="ghost">
              Cancelar
            </Button>
            <Button loading={isSubmitting} loadingLabel="Guardando…" type="submit">
              {song ? "Guardar cambios" : "Añadir canción"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
