"use client";

import type { FieldError, Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";

import { FieldMessage } from "@/components/ui/field-message";
import { useDemoSubmit } from "@/hooks/use-demo-submit";
import {
  memoryFormSchema,
  type MemoryFormValues,
} from "@/lib/validations/memory";

type MemoryFormProps = {
  mode: "create" | "edit";
  defaultValues?: MemoryFormValues;
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

const inputClassName =
  "mt-2 min-h-12 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-ink shadow-sm transition placeholder:text-muted/60 hover:border-ink/30 focus:border-blush focus:outline-none focus:ring-3 focus:ring-blush/20 disabled:cursor-not-allowed disabled:bg-ink/5";

export function MemoryForm({ mode, defaultValues }: MemoryFormProps) {
  const demoSubmit = useDemoSubmit();
  const {
    formState: { errors, isDirty },
    handleSubmit,
    register,
  } = useForm<MemoryFormValues>({
    defaultValues: defaultValues ?? emptyValues,
    resolver: memoryResolver,
  });

  const onSubmit = handleSubmit(async () => {
    await demoSubmit.submit();
  });

  const isSubmitting = demoSubmit.state === "submitting";

  return (
    <form className="space-y-7" noValidate onSubmit={onSubmit}>
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        Modo demostración: puedes validar el formulario, pero ningún cambio se guarda ni se envía.
      </div>

      <fieldset className="space-y-5" disabled={isSubmitting}>
        <legend className="font-serif text-2xl font-semibold">El recuerdo</legend>

        <div>
          <label className="text-sm font-semibold" htmlFor="title">
            Título
          </label>
          <input
            aria-describedby={errors.title ? "title-error" : undefined}
            aria-invalid={Boolean(errors.title)}
            className={inputClassName}
            id="title"
            placeholder="Una tarde que queremos guardar"
            type="text"
            {...register("title")}
          />
          <FieldMessage id="title-error" message={errors.title?.message} />
        </div>

        <div>
          <label className="text-sm font-semibold" htmlFor="memoryDate">
            Fecha
          </label>
          <input
            aria-describedby={errors.memoryDate ? "memory-date-error" : undefined}
            aria-invalid={Boolean(errors.memoryDate)}
            className={inputClassName}
            id="memoryDate"
            type="date"
            {...register("memoryDate")}
          />
          <FieldMessage
            id="memory-date-error"
            message={errors.memoryDate?.message}
          />
        </div>

        <div>
          <label className="text-sm font-semibold" htmlFor="description">
            Historia
          </label>
          <textarea
            aria-describedby={errors.description ? "description-error" : "description-help"}
            aria-invalid={Boolean(errors.description)}
            className={`${inputClassName} min-h-36 resize-y`}
            id="description"
            placeholder="¿Qué hizo especial este día?"
            {...register("description")}
          />
          <p className="mt-2 text-sm text-muted" id="description-help">
            Escribe lo que te gustaría recordar dentro de unos años.
          </p>
          <FieldMessage
            id="description-error"
            message={errors.description?.message}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-5" disabled={isSubmitting}>
        <legend className="font-serif text-2xl font-semibold">Fotos</legend>
        <div>
          <label className="text-sm font-semibold" htmlFor="photos">
            Elegir imágenes
          </label>
          <input
            accept="image/jpeg,image/png,image/webp"
            aria-describedby="photos-help"
            className={`${inputClassName} file:mr-3 file:rounded-full file:border-0 file:bg-blush/10 file:px-4 file:py-2 file:font-semibold file:text-blush-dark`}
            id="photos"
            multiple
            type="file"
          />
          <p className="mt-2 text-sm text-muted" id="photos-help">
            Selección local solamente. La carga y el reordenamiento llegarán al conectar Storage.
          </p>
        </div>
      </fieldset>

      <fieldset className="space-y-5" disabled={isSubmitting}>
        <legend className="font-serif text-2xl font-semibold">Canción opcional</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold" htmlFor="songTitle">
              Canción
            </label>
            <input
              aria-describedby={errors.songTitle ? "song-title-error" : undefined}
              aria-invalid={Boolean(errors.songTitle)}
              className={inputClassName}
              id="songTitle"
              type="text"
              {...register("songTitle")}
            />
            <FieldMessage
              id="song-title-error"
              message={errors.songTitle?.message}
            />
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor="songArtist">
              Artista
            </label>
            <input
              aria-describedby={errors.songArtist ? "song-artist-error" : undefined}
              aria-invalid={Boolean(errors.songArtist)}
              className={inputClassName}
              id="songArtist"
              type="text"
              {...register("songArtist")}
            />
            <FieldMessage
              id="song-artist-error"
              message={errors.songArtist?.message}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold" htmlFor="songUrl">
            Enlace musical
          </label>
          <input
            aria-describedby={errors.songUrl ? "song-url-error" : "song-url-help"}
            aria-invalid={Boolean(errors.songUrl)}
            className={inputClassName}
            id="songUrl"
            inputMode="url"
            placeholder="https://…"
            type="url"
            {...register("songUrl")}
          />
          <p className="mt-2 text-sm text-muted" id="song-url-help">
            Spotify, YouTube Music u otro enlace completo.
          </p>
          <FieldMessage id="song-url-error" message={errors.songUrl?.message} />
        </div>
      </fieldset>

      <div className="flex flex-col gap-3 border-t border-ink/10 pt-6 sm:flex-row sm:items-center">
        <button
          className="min-h-12 rounded-full bg-blush px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blush-dark disabled:cursor-wait disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting
            ? "Validando…"
            : mode === "create"
              ? "Probar creación"
              : "Probar cambios"}
        </button>
        <p className="text-sm text-muted" aria-live="polite">
          {demoSubmit.state === "success"
            ? "Validación completa. Nada fue guardado."
            : isDirty
              ? "Cambios locales sin guardar."
              : "Sin cambios."}
        </p>
      </div>
    </form>
  );
}
