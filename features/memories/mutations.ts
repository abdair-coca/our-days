"use server";

import { revalidatePath } from "next/cache";

import { getRuntimeMemoryRepository } from "@/features/memories/runtime-repository";
import type { MemoryMutationInput } from "@/features/memories/repository";

export type MemoryMutationResult = {
  message: string;
  mode: "demo" | "supabase";
  ok: boolean;
};

function demoResult(): MemoryMutationResult {
  return {
    message: "Validación completa. Nada fue guardado porque la persistencia aún no está configurada.",
    mode: "demo",
    ok: true,
  };
}

function failureResult(): MemoryMutationResult {
  return {
    message: "No pudimos guardar el recuerdo. Inténtalo de nuevo.",
    mode: "supabase",
    ok: false,
  };
}

export async function createMemoryAction(
  input: MemoryMutationInput,
): Promise<MemoryMutationResult> {
  const runtime = await getRuntimeMemoryRepository();

  if (runtime.mode === "demo") {
    return demoResult();
  }

  try {
    const memory = await runtime.repository.create(input);

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
  input: MemoryMutationInput,
): Promise<MemoryMutationResult> {
  const runtime = await getRuntimeMemoryRepository();

  if (runtime.mode === "demo") {
    return demoResult();
  }

  try {
    const memory = await runtime.repository.update(id, input);

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
