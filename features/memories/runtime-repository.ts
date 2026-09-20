import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MemoryCatalog } from "@/features/memories/catalog";
import type { MemoryRepository } from "@/features/memories/repository";
import { localMemoryCatalog } from "@/features/memories/local-memory-catalog";
import { createSupabaseMemoryRepository } from "@/features/memories/supabase-memory-repository";

export type RuntimeMemoryRepository =
  | { catalog: MemoryCatalog; mode: "demo" }
  | { catalog: MemoryRepository; mode: "supabase"; repository: MemoryRepository };

export async function getRuntimeMemoryRepository(): Promise<RuntimeMemoryRepository> {
  const client = await createSupabaseServerClient();

  if (!client) {
    return { catalog: localMemoryCatalog, mode: "demo" };
  }

  try {
    const {
      data: { user },
      error: userError,
    } = await client.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      throw new Error("La sesión expiró. Vuelve a iniciar sesión.");
    }

    const { error: workspaceError } = await client.rpc(
      "ensure_current_user_workspace",
    );

    if (workspaceError) {
      throw workspaceError;
    }

    const repository = createSupabaseMemoryRepository(client, user.id);
    return { catalog: repository, mode: "supabase", repository };
  } catch (error) {
    console.error("getRuntimeMemoryRepository failed", error);
    throw error instanceof Error
      ? error
      : new Error("No pudimos comprobar tu sesión.");
  }
}

export async function getMemoryCatalog(): Promise<MemoryCatalog> {
  const runtime = await getRuntimeMemoryRepository();
  return runtime.catalog;
}
