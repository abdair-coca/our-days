"use client";

import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import type { FieldError, Resolver } from "react-hook-form";
import { useForm, useWatch } from "react-hook-form";

import { useDemoSubmit } from "@/hooks/use-demo-submit";
import { memoryFormSchema, type MemoryFormValues } from "@/lib/validations/memory";
import type { MemoryPhoto } from "@/types/memory";
import { Button } from "@/components/ui/button";
import { SuccessState } from "@/components/ui/status-panel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ImagePlusIcon,
  TrashIcon,
} from "@/components/ui/icons";

type MemoryFormProps = {
  defaultValues?: MemoryFormValues;
  initialPhotos?: readonly MemoryPhoto[];
  mode: "create" | "edit";
};

type PhotoDraft = {
  file?: File;
  gradient?: string;
  id: string;
  name: string;
  preview?: string;
};

const emptyValues: MemoryFormValues = {
  title: "",
  memoryDate: "",
  description: "",
  songTitle: "",
  songArtist: "",
  songUrl: "",
};

const memoryResolver: Resolver<MemoryFormValues> = async (values) => {
  const parsed = memoryFormSchema.safeParse(values);

  if (parsed.success) {
    return { values: parsed.data, errors: {} };
  }

  const errors: Record<string, FieldError> = {};

  for (const issue of parsed.error.issues) {
    const field = String(issue.path[0]);
    errors[field] ??= { type: "validation", message: issue.message };
  }

  return { values: {}, errors };
};

function createInitialPhotos(photos: readonly MemoryPhoto[] = []): PhotoDraft[] {
  return photos.map((photo, index) => ({
    gradient: photo.gradient,
    id: `initial-${photo.id}-${index}`,
    name: photo.alt,
  }));
}

function PhotoPreview({ photo }: { photo: PhotoDraft }) {
  return (
    <div
      aria-label={photo.name}
      className="aspect-[4/3] w-full rounded-[var(--radius-card)] bg-cover bg-center"
      role="img"
      style={{
        backgroundImage: photo.preview ? `url(${photo.preview})` : photo.gradient,
      }}
    />
  );
}

export function MemoryForm({
  defaultValues,
  initialPhotos = [],
  mode,
}: MemoryFormProps) {
  const demoSubmit = useDemoSubmit();
  const [photos, setPhotos] = useState<PhotoDraft[]>(() =>
    createInitialPhotos(initialPhotos),
  );
  const previewUrls = useRef(new Set<string>());
  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    register,
  } = useForm<MemoryFormValues>({
    defaultValues: defaultValues ?? emptyValues,
    resolver: memoryResolver,
  });
  const previewValues = useWatch({ control });
  const isSubmitting = demoSubmit.state === "submitting";

  useEffect(() => {
    const urls = previewUrls.current;

    return () => {
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  const onSubmit = handleSubmit(async () => {
    await demoSubmit.submit();
  });

  function handlePhotosChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);

    setPhotos((current) => [
      ...current,
      ...selectedFiles.map((file, index) => {
        const preview = URL.createObjectURL(file);
        previewUrls.current.add(preview);

        return {
          file,
          id: `file-${Date.now()}-${index}`,
          name: file.name,
          preview,
        };
      }),
    ]);
    event.target.value = "";
  }

  function movePhoto(index: number, direction: -1 | 1) {
    setPhotos((current) => {
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const reordered = [...current];
      [reordered[index], reordered[targetIndex]] = [
        reordered[targetIndex],
        reordered[index],
      ];
      return reordered;
    });
  }

  function removePhoto(id: string) {
    setPhotos((current) => {
      const photo = current.find((item) => item.id === id);

      if (photo?.preview) {
        URL.revokeObjectURL(photo.preview);
        previewUrls.current.delete(photo.preview);
      }

      return current.filter((item) => item.id !== id);
    });
  }

  return (
    <form
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]"
      noValidate
      onSubmit={onSubmit}
    >
      <div className="space-y-8">
        <div className="rounded-[var(--radius-card)] border border-accent-soft bg-accent-soft/35 p-4 text-sm leading-6 text-text">
          Modo demostración: puedes validar, ordenar y previsualizar el recuerdo. Nada se guarda todavía.
        </div>

        <fieldset className="grid gap-5" disabled={isSubmitting}>
          <legend className="font-serif text-2xl font-semibold">El recuerdo</legend>
          <Input
            error={errors.title?.message}
            id="title"
            label="Título"
            placeholder="Una tarde que queremos guardar"
            required
            {...register("title")}
          />
          <Input
            error={errors.memoryDate?.message}
            id="memoryDate"
            label="Fecha"
            required
            type="date"
            {...register("memoryDate")}
          />
          <Textarea
            error={errors.description?.message}
            helpText="Escribe lo que te gustaría recordar dentro de unos años."
            id="description"
            label="Historia"
            placeholder="¿Qué hizo especial este día?"
            required
            {...register("description")}
          />
        </fieldset>

        <fieldset className="grid gap-5" disabled={isSubmitting}>
          <legend className="font-serif text-2xl font-semibold">Fotos</legend>
          <div className="flex items-end justify-between gap-4">
            <p className="text-sm text-text-soft">La primera será la portada del recuerdo.</p>
            <span className="text-sm text-text-soft">
              {photos.length} {photos.length === 1 ? "foto" : "fotos"}
            </span>
          </div>
          <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-button)] border border-dashed border-accent px-4 py-3 text-sm font-semibold text-accent transition-[background-color,border-color,transform] duration-[var(--motion-fast)] hover:-translate-y-px hover:bg-accent-soft/45">
            <ImagePlusIcon />
            Añadir fotos
            <input
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              multiple
              onChange={handlePhotosChange}
              type="file"
            />
          </label>

          {photos.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {photos.map((photo, index) => (
                <article
                  className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-card)]"
                  key={photo.id}
                >
                  <PhotoPreview photo={photo} />
                  <div className="flex items-center justify-between gap-2 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {index === 0 ? "Portada" : `Foto ${index + 1}`}
                      </p>
                      <p className="truncate text-xs text-text-soft">{photo.name}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        aria-label={`Subir foto ${index + 1}`}
                        className="p-2"
                        disabled={index === 0}
                        onClick={() => movePhoto(index, -1)}
                        title="Subir foto"
                        type="button"
                        variant="quiet"
                      >
                        <ChevronUpIcon size={18} />
                      </Button>
                      <Button
                        aria-label={`Bajar foto ${index + 1}`}
                        className="p-2"
                        disabled={index === photos.length - 1}
                        onClick={() => movePhoto(index, 1)}
                        title="Bajar foto"
                        type="button"
                        variant="quiet"
                      >
                        <ChevronDownIcon size={18} />
                      </Button>
                      <Button
                        aria-label={`Eliminar foto ${index + 1}`}
                        className="p-2 text-error"
                        onClick={() => removePhoto(photo.id)}
                        title="Eliminar foto"
                        type="button"
                        variant="quiet"
                      >
                        <TrashIcon size={18} />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[var(--radius-card)] border border-dashed border-border p-6 text-center text-sm text-text-soft">
              Aún no has añadido fotos. Puedes continuar y agregarlas después.
            </div>
          )}
        </fieldset>

        <fieldset className="grid gap-5" disabled={isSubmitting}>
          <legend className="font-serif text-2xl font-semibold">Canción opcional</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              error={errors.songTitle?.message}
              id="songTitle"
              label="Canción"
              {...register("songTitle")}
            />
            <Input
              error={errors.songArtist?.message}
              id="songArtist"
              label="Artista"
              {...register("songArtist")}
            />
          </div>
          <Input
            error={errors.songUrl?.message}
            helpText="Spotify, YouTube Music u otro enlace completo."
            id="songUrl"
            inputMode="url"
            label="Enlace musical"
            placeholder="https://…"
            type="url"
            {...register("songUrl")}
          />
        </fieldset>

        <div className="flex flex-col gap-3 border-t border-border-soft pt-6 sm:flex-row sm:items-center">
          <Button disabled={isSubmitting} loading={isSubmitting} type="submit">
            {mode === "create" ? "Probar creación" : "Probar cambios"}
          </Button>
          <p aria-live="polite" className="text-sm text-text-soft">
            {demoSubmit.state === "success"
              ? "Validación completa. Nada fue guardado."
              : isDirty
                ? "Cambios locales sin guardar."
                : "Sin cambios."}
          </p>
        </div>

        {demoSubmit.state === "success" ? (
          <SuccessState title="Listo para conectar">
            La validación pasó. En la siguiente integración, este contenido podrá guardarse en el espacio compartido.
          </SuccessState>
        ) : null}
      </div>

      <aside className="h-fit rounded-[var(--radius-card)] border border-border-soft bg-surface-soft p-5 lg:sticky lg:top-6">
        <p className="text-xs font-bold tracking-[0.16em] text-olive uppercase">Preview</p>
        <div className="mt-4 overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)]">
          {photos[0] ? (
            <PhotoPreview photo={photos[0]} />
          ) : (
            <div className="grid aspect-[4/3] place-items-center bg-accent-soft/35 px-5 text-center text-sm text-text-soft">
              La portada aparecerá aquí
            </div>
          )}
          <div className="p-4">
            <p className="text-xs font-bold tracking-[0.12em] text-accent-hover uppercase">
              {previewValues.memoryDate || "Fecha del recuerdo"}
            </p>
            <h2 className="mt-2 font-serif text-2xl font-semibold leading-tight">
              {previewValues.title || "Un recuerdo más"}
            </h2>
            <p className="mt-2 line-clamp-4 text-sm leading-6 text-text-soft">
              {previewValues.description || "La historia aparecerá aquí mientras la escribes."}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-text-soft">
          <CheckIcon size={16} />
          <span>La portada se puede cambiar con los controles.</span>
        </div>
      </aside>
    </form>
  );
}
