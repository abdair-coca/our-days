"use server";

import { revalidatePath } from "next/cache";

import { getRuntimeMemoryRepository } from "@/features/memories/runtime-repository";
import type {
  MemoryMutationInput,
  MemoryPhotoInput,
} from "@/features/memories/repository";
import { memoryFormSchema } from "@/lib/validations/memory";

export type MemoryMutationResult = {
  message: string;
  mode: "demo" | "supabase";
  ok: boolean;
};

type PhotoDescriptor = {
  alt?: unknown;
  byteSize?: unknown;
  height?: unknown;
  id?: unknown;
  mimeType?: unknown;
  storagePath?: unknown;
  visualValue?: unknown;
  width?: unknown;
};

function textValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function optionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function getPhotoInputs(formData: FormData): readonly MemoryPhotoInput[] {
  const rawOrder = textValue(formData, "photoOrder");
  let descriptors: PhotoDescriptor[] = [];

  try {
    const parsed: unknown = JSON.parse(rawOrder || "[]");
    if (Array.isArray(parsed)) {
      descriptors = parsed.filter(
        (item): item is PhotoDescriptor =>
          typeof item === "object" && item !== null,
      );
    }
  } catch {
    descriptors = [];
  }

  return descriptors.flatMap((descriptor) => {
    const id = optionalString(descriptor.id);
    const alt = optionalString(descriptor.alt);

    if (!id || !alt) {
      return [];
    }

    const fileValue = formData.get(`photo:${id}`);
    const file =
      typeof File !== "undefined" && fileValue instanceof File && fileValue.size > 0
        ? fileValue
        : undefined;

    return [
      {
        alt,
        byteSize: optionalNumber(descriptor.byteSize),
        file,
        height: optionalNumber(descriptor.height),
        id,
        mimeType: optionalString(descriptor.mimeType),
        storagePath: optionalString(descriptor.storagePath),
        visualValue: optionalString(descriptor.visualValue),
        width: optionalNumber(descriptor.width),
      },
    ];
  });
}

function parseMemoryForm(formData: FormData):
  | { input: MemoryMutationInput }
  | { error: string } {
  const parsed = memoryFormSchema.safeParse({
    description: textValue(formData, "description"),
    memoryDate: textValue(formData, "memoryDate"),
    songArtist: textValue(formData, "songArtist"),
    songTitle: textValue(formData, "songTitle"),
    songUrl: textValue(formData, "songUrl"),
    title: textValue(formData, "title"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos del recuerdo." };
  }

  return {
    input: {
      ...parsed.data,
      photos: getPhotoInputs(formData),
    },
  };
}

function demoResult(): MemoryMutationResult {
  return {
    message: "Validación completa. Nada fue guardado porque la persistencia aún no está configurada.",
    mode: "demo",
    ok: true,
  };
}

function failureResult(message = "No pudimos guardar el recuerdo. Inténtalo de nuevo."): MemoryMutationResult {
  return { message, mode: "supabase", ok: false };
}

export async function createMemoryAction(
  formData: FormData,
): Promise<MemoryMutationResult> {
  const parsed = parseMemoryForm(formData);

  if ("error" in parsed) {
    return failureResult(parsed.error);
  }

  const runtime = await getRuntimeMemoryRepository();

  if (runtime.mode === "demo") {
    return demoResult();
  }

  try {
    const memory = await runtime.repository.create(parsed.input);

    if (!memory) {
      return failureResult();
    }

    revalidatePath("/");
    revalidatePath("/memories");
    return {
      message: "Recuerdo guardado en el espacio compartido.",
      mode: "supabase",
      ok: true,
    };
  } catch (error) {
    console.error("createMemoryAction failed", error);
    return failureResult();
  }
}

export async function updateMemoryAction(
  id: string,
  formData: FormData,
): Promise<MemoryMutationResult> {
  const parsed = parseMemoryForm(formData);

  if ("error" in parsed) {
    return failureResult(parsed.error);
  }

  const runtime = await getRuntimeMemoryRepository();

  if (runtime.mode === "demo") {
    return demoResult();
  }

  try {
    const memory = await runtime.repository.update(id, parsed.input);

    if (!memory) {
      return failureResult();
    }

    revalidatePath("/");
    revalidatePath("/memories");
    revalidatePath(`/memories/${id}`);
    revalidatePath(`/memories/${id}/edit`);
    return {
      message: "Cambios guardados en el espacio compartido.",
      mode: "supabase",
      ok: true,
    };
  } catch (error) {
    console.error("updateMemoryAction failed", error);
    return failureResult();
  }
}

export async function deleteMemoryAction(id: string): Promise<MemoryMutationResult> {
  const runtime = await getRuntimeMemoryRepository();

  if (runtime.mode === "demo") {
    return demoResult();
  }

  try {
    const removed = await runtime.repository.remove(id);

    if (!removed) {
      return failureResult();
    }

    revalidatePath("/");
    revalidatePath("/memories");
    revalidatePath(`/memories/${id}`);
    return {
      message: "Recuerdo eliminado del espacio compartido.",
      mode: "supabase",
      ok: true,
    };
  } catch (error) {
    console.error("deleteMemoryAction failed", error);
    return failureResult();
  }
}
