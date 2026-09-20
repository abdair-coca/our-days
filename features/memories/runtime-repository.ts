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
    } = await client.auth.getUser();

    if (!user) {
      return { catalog: localMemoryCatalog, mode: "demo" };
    }

    const repository = createSupabaseMemoryRepository(client, user.id);
    return { catalog: repository, mode: "supabase", repository };
  } catch {
    return { catalog: localMemoryCatalog, mode: "demo" };
  }
}

export async function getMemoryCatalog(): Promise<MemoryCatalog> {
  const runtime = await getRuntimeMemoryRepository();
  return runtime.catalog;
}
