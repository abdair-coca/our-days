"use server";

import { getAuthContext } from "@/features/auth/auth-context";
import { getRuntimeMemoryRepository } from "@/features/memories/runtime-repository";
import { buildMusicLibrary } from "./library";

export async function getMusicLibraryAction() {
  const runtime = await getRuntimeMemoryRepository();
  const context = runtime.mode === "supabase" ? await getAuthContext() : null;
  if (runtime.mode === "supabase" && !context)
    throw new Error("La sesión expiró.");
  return {
    identity: context ? `${context.user.id}:${context.space.id}` : "demo",
    tracks: buildMusicLibrary(await runtime.catalog.list()),
  };
}
