"use server";

import { getAuthContext } from "@/features/auth/auth-context";
import { resolveSongLink } from "@/features/music/song-source";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Memory, MemorySong } from "@/types/memory";

export type MemoryPresentationMode = "welcome" | "new-memories" | "replay";

export type MemoryPresentation = {
  backgroundSong: MemorySong | null;
  memories: readonly Memory[];
  mode: MemoryPresentationMode;
};

export type PresentationActionResult = {
  message: string;
  ok: boolean;
};

function actionError(message: string): PresentationActionResult {
  const normalized = message.toLowerCase();

  if (normalized.includes("memory_access_denied")) {
    return {
      message: "Este recuerdo ya no está disponible para este espacio.",
      ok: false,
    };
  }

  if (normalized.includes("space_access_denied")) {
    return {
      message: "No pudimos actualizar la presentación de este espacio.",
      ok: false,
    };
  }

  return {
    message: "No pudimos guardar el progreso de la presentación.",
    ok: false,
  };
}

function sortMemories(memories: readonly Memory[]): Memory[] {
  return [...memories].sort((left, right) => {
    const dateOrder = left.memoryDate.localeCompare(right.memoryDate);
    return dateOrder || left.id.localeCompare(right.id);
  });
}

function firstPlayableSong(memories: readonly Memory[]): MemorySong | null {
  for (const memory of memories) {
    for (const song of memory.songs) {
      if (resolveSongLink(song.url).ok) {
        return song;
      }
    }
  }

  return null;
}

function createPresentation(
  memories: readonly Memory[],
  mode: MemoryPresentationMode,
): MemoryPresentation | null {
  const orderedMemories = sortMemories(memories);

  if (orderedMemories.length === 0) {
    return null;
  }

  return {
    backgroundSong: firstPlayableSong(orderedMemories),
    memories: orderedMemories,
    mode,
  };
}

export async function getMemoryPresentation(
  memories: readonly Memory[],
): Promise<MemoryPresentation | null> {
  const client = await createSupabaseServerClient();

  if (!client || memories.length === 0) {
    return null;
  }

  const context = await getAuthContext();

  if (!context) {
    return null;
  }

  const [{ data: membership, error: membershipError }, { data: views, error: viewsError }, { data: owners, error: ownersError }] =
    await Promise.all([
      client
        .from("space_members")
        .select("welcome_seen_at")
        .eq("space_id", context.space.id)
        .eq("profile_id", context.user.id)
        .single(),
      client.from("memory_views").select("memory_id").eq("profile_id", context.user.id),
      client
        .from("memories")
        .select("id, created_by")
        .eq("space_id", context.space.id),
    ]);

  if (membershipError || viewsError || ownersError || !membership) {
    return null;
  }

  const viewedMemoryIds = new Set(
    (views ?? []).map((view) => view.memory_id as string),
  );
  const ownerByMemoryId = new Map(
    (owners ?? []).map((memory) => [memory.id as string, memory.created_by as string]),
  );
  const isWelcome = membership.welcome_seen_at === null;
  const orderedMemories = sortMemories(memories);
  const presentationMemories = isWelcome
    ? orderedMemories
    : orderedMemories.filter(
        (memory) =>
          !viewedMemoryIds.has(memory.id) &&
          ownerByMemoryId.get(memory.id) !== context.user.id,
      );

  if (presentationMemories.length === 0) {
    return null;
  }

  return createPresentation(
    presentationMemories,
    isWelcome ? "welcome" : "new-memories",
  );
}

export async function getReplayPresentation(
  memories: readonly Memory[],
): Promise<MemoryPresentation | null> {
  return createPresentation(memories, "replay");
}

export async function startMemoryWelcomeAction(): Promise<PresentationActionResult> {
  const client = await createSupabaseServerClient();

  if (!client) {
    return {
      message: "La presentación solo está disponible con una cuenta conectada.",
      ok: false,
    };
  }

  let context;

  try {
    context = await getAuthContext();
  } catch {
    return {
      message: "No pudimos preparar la presentación. Inténtalo de nuevo.",
      ok: false,
    };
  }

  if (!context) {
    return {
      message: "Inicia sesión para ver la presentación.",
      ok: false,
    };
  }

  const { error } = await client.rpc("start_memory_welcome", {
    target_space_id: context.space.id,
  });

  if (error) {
    return actionError(error.message);
  }

  return { message: "", ok: true };
}

export async function markMemorySeenAction(
  memoryId: string,
): Promise<PresentationActionResult> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(memoryId)) {
    return {
      message: "Este recuerdo no tiene un identificador válido.",
      ok: false,
    };
  }

  const client = await createSupabaseServerClient();

  if (!client) {
    return {
      message: "La presentación solo está disponible con una cuenta conectada.",
      ok: false,
    };
  }

  const { error } = await client.rpc("mark_memory_seen", {
    target_memory_id: memoryId,
  });

  if (error) {
    return actionError(error.message);
  }

  return { message: "", ok: true };
}
