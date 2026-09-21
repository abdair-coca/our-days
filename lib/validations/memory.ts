import { resolveSongLink } from "@/features/music/song-source";
import { z } from "zod";

export const memoryFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "Escribe un título de al menos 2 caracteres.")
      .max(80, "Usa 80 caracteres o menos."),
    memoryDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Selecciona una fecha válida."),
    description: z
      .string()
      .trim()
      .min(10, "Cuenta un poco más: usa al menos 10 caracteres.")
      .max(1200, "Usa 1200 caracteres o menos."),
    songTitle: z.string().trim().max(100, "Usa 100 caracteres o menos."),
    songArtist: z.string().trim().max(100, "Usa 100 caracteres o menos."),
    songUrl: z
      .union([
        z.literal(""),
        z.string().trim().url("Usa una URL completa, por ejemplo https://…"),
      ]),
  })
  .superRefine((values, context) => {
    const hasSongFields = Boolean(
      values.songTitle.trim() || values.songArtist.trim() || values.songUrl.trim(),
    );

    if (!hasSongFields) {
      return;
    }

    if (!values.songTitle.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Escribe el nombre de la canción.",
        path: ["songTitle"],
      });
    }

    if (!values.songUrl.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Añade un enlace de Spotify o YouTube Music.",
        path: ["songUrl"],
      });
      return;
    }

    const source = resolveSongLink(values.songUrl);

    if (!source.ok) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Usa un enlace de una canción de Spotify o YouTube Music.",
        path: ["songUrl"],
      });
    }
  });

export const memorySongSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Escribe el nombre de la canción.")
    .max(100, "Usa 100 caracteres o menos."),
  artist: z.string().trim().max(100, "Usa 100 caracteres o menos."),
  url: z
    .string()
    .trim()
    .url("Usa un enlace completo de Spotify o YouTube Music."),
});

export type MemoryFormValues = z.infer<typeof memoryFormSchema>;
export type MemorySongFormValues = z.infer<typeof memorySongSchema>;
