import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  MemoryPhotoInput,
  MemoryRepository,
} from "@/features/memories/repository";
import { demoGradients } from "@/lib/images/demo-art";
import type { MemoryPhotoRow, MemoryRow } from "@/types/database";
import type { Memory, MemoryPhoto } from "@/types/memory";

type ProfileJoin = { display_name: string | null } | { display_name: string | null }[] | null;

type MemoryQueryRow = MemoryRow & {
  memory_photos: MemoryPhotoRow[] | null;
  profiles: ProfileJoin;
};

const fallbackGradient = `linear-gradient(145deg, ${demoGradients.sunset})`;

function visualValueToBackground(value: string | null): string {
  if (!value) {
    return fallbackGradient;
  }

  return value.startsWith("url(") || value.startsWith("linear-gradient") || value.startsWith("radial-gradient")
    ? value
    : `url(${value})`;
}

function mapPhoto(row: MemoryPhotoRow): MemoryPhoto {
  return {
    alt: row.alt_text,
    gradient: visualValueToBackground(row.visual_value),
    id: row.id,
  };
}

function mapMemory(row: MemoryQueryRow): Memory {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

  return {
    createdBy: profile?.display_name ?? "Nuestro espacio",
    description: row.description,
    id: row.id,
    memoryDate: row.memory_date,
    photos: [...(row.memory_photos ?? [])]
      .sort((left, right) => left.sort_order - right.sort_order)
      .map(mapPhoto),
    song:
      row.song_title || row.song_artist || row.song_url
        ? {
            artist: row.song_artist ?? "",
            title: row.song_title ?? "",
            url: row.song_url ?? "",
          }
        : null,
    title: row.title,
  };
}

export function createSupabaseMemoryRepository(
  client: SupabaseClient,
  userId: string,
): MemoryRepository {
  async function getSpaceId(): Promise<string | null> {
    const { data, error } = await client
      .from("space_members")
      .select("space_id")
      .eq("profile_id", userId)
      .order("joined_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data?.space_id ?? null;
  }

  async function fetchRows(filters?: { id?: string; spaceId?: string }) {
    const spaceId = filters?.spaceId ?? (await getSpaceId());

    if (!spaceId) {
      return [];
    }

    let query = client
      .from("memories")
      .select(
        "*, memory_photos(*), profiles:created_by(display_name)",
      )
      .eq("space_id", spaceId)
      .order("memory_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (filters?.id) {
      query = query.eq("id", filters.id);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data ?? []) as unknown as MemoryQueryRow[];
  }

  async function insertPhotos(memoryId: string, photos: readonly MemoryPhotoInput[]) {
    if (photos.length === 0) {
      return;
    }

    const { error } = await client.from("memory_photos").insert(
      photos.map((photo, sortOrder) => ({
        alt_text: photo.alt,
        memory_id: memoryId,
        sort_order: sortOrder,
        storage_path: null,
        visual_value: photo.visualValue ?? null,
      })),
    );

    if (error) {
      throw error;
    }
  }

  async function getMemory(id: string): Promise<Memory | null> {
    const rows = await fetchRows({ id });
    return rows[0] ? mapMemory(rows[0]) : null;
  }

  const repository: MemoryRepository = {
    async create(input) {
      const spaceId = await getSpaceId();

      if (!spaceId) {
        throw new Error("No hay un espacio disponible para este usuario.");
      }

      const { data, error } = await client
        .from("memories")
        .insert({
          created_by: userId,
          description: input.description,
          memory_date: input.memoryDate,
          song_artist: input.songArtist || null,
          song_title: input.songTitle || null,
          song_url: input.songUrl || null,
          space_id: spaceId,
          title: input.title,
        })
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      if (input.photos) {
        await insertPhotos(data.id, input.photos);
      }

      return getMemory(data.id);
    },
    async getById(id) {
      return getMemory(id);
    },
    async list() {
      return (await fetchRows()).map(mapMemory);
    },
    async remove(id) {
      const spaceId = await getSpaceId();

      if (!spaceId) {
        return false;
      }

      const { error, count } = await client
        .from("memories")
        .delete({ count: "exact" })
        .eq("id", id)
        .eq("space_id", spaceId);

      if (error) {
        throw error;
      }

      return count === 1;
    },
    async update(id, input) {
      const spaceId = await getSpaceId();

      if (!spaceId) {
        throw new Error("No hay un espacio disponible para este usuario.");
      }

      const { data, error } = await client
        .from("memories")
        .update({
          description: input.description,
          memory_date: input.memoryDate,
          song_artist: input.songArtist || null,
          song_title: input.songTitle || null,
          song_url: input.songUrl || null,
          title: input.title,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("space_id", spaceId)
        .select("id")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        return null;
      }

      if (input.photos) {
        const { error: deleteError } = await client
          .from("memory_photos")
          .delete()
          .eq("memory_id", id);

        if (deleteError) {
          throw deleteError;
        }

        await insertPhotos(id, input.photos);
      }

      return getMemory(id);
    },
    async years() {
      const memories = await repository.list();

      return [...new Set(memories.map((memory) => Number(memory.memoryDate.slice(0, 4))))].sort(
        (left, right) => right - left,
      );
    },
  };

  return repository;
}
