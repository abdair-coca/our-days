import { z } from "zod";

export const memoryFormSchema = z.object({
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
});

export type MemoryFormValues = z.infer<typeof memoryFormSchema>;
