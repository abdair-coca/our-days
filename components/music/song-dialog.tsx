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
import type { SongMetadata } from "@/features/music/song-metadata";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MusicIcon, PlayIcon, XIcon } from "@/components/ui/icons";

import { useTemporaryMusic } from "./music-player";
import { SongLinkCard } from "./song-link-card";
import { useSongMetadata } from "./use-song-metadata";
import type { MusicTrack } from "@/features/music/library";

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
  const urlInput = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(song?.title ?? "");
  const [artist, setArtist] = useState(song?.artist ?? "");
  const [url, setUrl] = useState(song?.url ?? "");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Fields people typed themselves are never overwritten by a lookup.
  const [edited, setEdited] = useState({ artist: Boolean(song), title: Boolean(song) });
  const [found, setFound] = useState<{ artworkUrl: string; url: string } | null>(null);
  const [flash, setFlash] = useState({ artist: 0, title: 0 });
  const source = url.trim() ? resolveSongLink(url) : null;
  const savedSource = song ? resolveSongLink(song.url) : null;
  const savedUrl = savedSource?.ok ? savedSource.canonicalUrl : undefined;
  const canonicalUrl = source?.ok ? source.canonicalUrl : undefined;
  // The saved cover belongs to the saved link; a looked-up cover to its link.
  const artworkUrl =
    canonicalUrl && canonicalUrl === savedUrl
      ? (song?.artworkUrl ?? "")
      : found && found.url === canonicalUrl
        ? found.artworkUrl
        : "";
  const metadataStatus = useSongMetadata(url, {
    onResolved: (metadata: SongMetadata | null, resolvedUrl: string) => {
      setFound({ artworkUrl: metadata?.artworkUrl ?? "", url: resolvedUrl });
      if (!metadata) return;
      if (!edited.title || !title.trim()) {
        setTitle(metadata.title);
        setFlash((current) => ({ ...current, title: current.title + 1 }));
      }
      if (metadata.artist && (!edited.artist || !artist.trim())) {
        setArtist(metadata.artist);
        setFlash((current) => ({ ...current, artist: current.artist + 1 }));
      }
    },
    skipUrl: savedUrl,
  });
  const previewTrack: MusicTrack | null = source?.ok
    ? {
        id: "preview",
        key: "preview:song-dialog",
        addedAt: "",
        addedBy: "",
        title: title || "Vista previa",
        artist,
        url,
        source,
        memoryId,
        memoryTitle: "Vista previa",
      }
    : null;
  useTemporaryMusic(previewTrack, previewOpen);
  const currentDialog = useRef({ isEditing: Boolean(song), isSubmitting, onClose });
  useEffect(() => {
    currentDialog.current = { isEditing: Boolean(song), isSubmitting, onClose };
  }, [isSubmitting, onClose, song]);

  useEffect(() => {
    const previousFocus = document.activeElement;
    // Adding starts from the link (it fills the rest); editing from the name.
    (currentDialog.current.isEditing ? titleInput : urlInput).current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !currentDialog.current.isSubmitting) {
        currentDialog.current.onClose();
        return;
      }

      if (event.key === "Tab") {
        const focusable = Array.from([
          ...(dialogPanel.current?.querySelectorAll<HTMLElement>(
            'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
          ) ?? []),
          ...document.querySelectorAll<HTMLElement>(
            ".music-owner-preview:not([hidden]) button:not([disabled]), .music-owner-preview:not([hidden]) a[href], .music-owner-preview:not([hidden]) iframe, .music-owner-preview:not([hidden]) input",
          ),
        ]).filter((element) => element.getClientRects().length > 0);
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
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const parsed = memorySongSchema.safeParse({ artist, title, url });

    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ?? "Revisa los datos de la canción.",
      );
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
    formData.set("artworkUrl", artworkUrl);
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
        aria-owns={previewOpen ? "global-music-player" : undefined}
        className={`song-dialog-panel ${previewOpen ? "song-dialog-with-preview" : ""} w-full max-w-xl overflow-y-auto rounded-t-[var(--radius-modal)] border border-border-soft bg-surface p-5 shadow-[var(--shadow-overlay)] sm:max-h-[min(88vh,42rem)] sm:rounded-[var(--radius-modal)] sm:p-7`}
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
            <h2
              className="mt-2 font-serif text-3xl font-semibold"
              id="song-dialog-title"
            >
              {song ? "Editar canción" : "Añadir canción"}
            </h2>
            <p
              className="mt-2 text-sm leading-6 text-text-soft"
              id="song-dialog-description"
            >
              Pega el enlace: completamos el nombre, el artista y la
              portada. Puedes cambiarlos antes de guardar.
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
            error={error && !source?.ok ? error : undefined}
            helpText="Una canción de Spotify o YouTube Music."
            inputMode="url"
            label="Enlace musical"
            onChange={(event) => {
              setUrl(event.target.value);
              setPreviewOpen(false);
              setError("");
            }}
            placeholder="https://open.spotify.com/track/…"
            ref={urlInput}
            required
            type="url"
            value={url}
          />

          {source ? (
            <SongLinkCard
              action={
                source.ok ? (
                  <Button
                    aria-label={previewOpen ? "Cerrar vista previa" : "Probar canción"}
                    className="size-11 shrink-0 rounded-full! px-0! py-0!"
                    onClick={() => setPreviewOpen((current) => !current)}
                    title={previewOpen ? "Cerrar vista previa" : "Probar canción"}
                    variant="secondary"
                  >
                    {previewOpen ? <XIcon size={18} /> : <PlayIcon size={18} />}
                  </Button>
                ) : null
              }
              artist={artist}
              artworkUrl={artworkUrl || undefined}
              footer={
                source.ok && previewOpen ? (
                  <p className="mt-3 text-xs text-text-soft">
                    La vista previa está en el reproductor flotante. Al cerrar,
                    volverás a tu música.
                  </p>
                ) : null
              }
              source={source}
              status={metadataStatus}
              title={title}
            />
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              className={flash.title ? "autofill-flash" : undefined}
              label="Canción"
              onAnimationEnd={() => setFlash((current) => ({ ...current, title: 0 }))}
              onChange={(event) => {
                setTitle(event.target.value);
                setEdited((current) => ({ ...current, title: true }));
              }}
              ref={titleInput}
              required
              value={title}
            />
            <Input
              className={flash.artist ? "autofill-flash" : undefined}
              helpText="Puedes dejarlo vacío."
              label="Artista"
              onAnimationEnd={() => setFlash((current) => ({ ...current, artist: 0 }))}
              onChange={(event) => {
                setArtist(event.target.value);
                setEdited((current) => ({ ...current, artist: true }));
              }}
              value={artist}
            />
          </div>

          {error && source?.ok ? (
            <p
              aria-live="polite"
              className="text-sm font-semibold text-error"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-border-soft pt-5 sm:flex-row sm:justify-end">
            <Button disabled={isSubmitting} onClick={onClose} variant="ghost">
              Cancelar
            </Button>
            <Button
              loading={isSubmitting}
              loadingLabel="Guardando…"
              type="submit"
            >
              {song ? "Guardar cambios" : "Añadir canción"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
