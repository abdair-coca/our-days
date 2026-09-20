import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  MemoryPhotoInput,
  MemoryRepository,
} from "@/features/memories/repository";
import { demoGradients } from "@/lib/images/demo-art";
import type { MemoryPhotoRow, MemoryRow } from "@/types/database";
import type { Memory, MemoryPhoto } from "@/types/memory";

const PHOTO_BUCKET = "memory-photos";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

type ProfileJoin =
  | { display_name: string | null }
  | { display_name: string | null }[]
  | null;

type MemoryQueryRow = MemoryRow & {
  memory_photos: MemoryPhotoRow[] | null;
  profiles: ProfileJoin;
};

type InsertedPhotoResult = {
  insertedIds: string[];
  retainedStoragePaths: string[];
  uploadedPaths: string[];
};

function visualValueToBackground(value: string | null): string {
  if (!value) {
    return demoGradients.sunset;
  }

  return value.startsWith("url(") ||
    value.startsWith("linear-gradient") ||
    value.startsWith("radial-gradient")
    ? value
    : `url(${value})`;
}

async function mapPhoto(
  client: SupabaseClient,
  row: MemoryPhotoRow,
): Promise<MemoryPhoto> {
  let background = visualValueToBackground(row.visual_value);
  let src: string | undefined;

  if (row.storage_path) {
    const { data } = await client.storage
      .from(PHOTO_BUCKET)
      .createSignedUrl(row.storage_path, SIGNED_URL_TTL_SECONDS);

    if (data?.signedUrl) {
      src = data.signedUrl;
      background = `url(${data.signedUrl})`;
    }
  }

  return {
    alt: row.alt_text,
    byteSize: row.byte_size ?? undefined,
    gradient: background,
    height: row.height ?? undefined,
    id: row.id,
    mimeType: row.mime_type ?? undefined,
    src,
    storagePath: row.storage_path ?? undefined,
    width: row.width ?? undefined,
  };
}

async function mapMemory(
  client: SupabaseClient,
  row: MemoryQueryRow,
): Promise<Memory> {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  const photos = [...(row.memory_photos ?? [])]
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((photo) => mapPhoto(client, photo));

  return {
    createdBy: profile?.display_name ?? "Nuestro espacio",
    description: row.description,
    id: row.id,
    memoryDate: row.memory_date,
    photos: await Promise.all(photos),
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
      .select("*, memory_photos(*), profiles:created_by(display_name)")
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

  async function uploadPhoto(
    spaceId: string,
    memoryId: string,
    photo: MemoryPhotoInput,
  ) {
    if (!photo.file) {
      return { path: photo.storagePath ?? null, uploaded: false };
    }

    const extension = photo.file.type === "image/webp" ? "webp" : "jpg";
    const path = `${spaceId}/${memoryId}/${crypto.randomUUID()}.${extension}`;
    const { error } = await client.storage.from(PHOTO_BUCKET).upload(path, photo.file, {
      cacheControl: "31536000",
      contentType: photo.file.type || "image/webp",
      upsert: false,
    });

    if (error) {
      throw error;
    }

    return { path, uploaded: true };
  }

  async function insertPhotos(
    spaceId: string,
    memoryId: string,
    photos: readonly MemoryPhotoInput[],
  ): Promise<InsertedPhotoResult> {
    const uploadedPaths: string[] = [];

    try {
      const rows = [];

      for (const [sortOrder, photo] of photos.entries()) {
        const uploaded = await uploadPhoto(spaceId, memoryId, photo);

        if (uploaded.uploaded && uploaded.path) {
          uploadedPaths.push(uploaded.path);
        }

        rows.push({
          alt_text: photo.alt,
          byte_size: photo.byteSize ?? photo.file?.size ?? null,
          height: photo.height ?? null,
          memory_id: memoryId,
          mime_type: photo.mimeType ?? photo.file?.type ?? null,
          sort_order: sortOrder,
          storage_path: uploaded.path,
          visual_value: uploaded.uploaded ? null : photo.visualValue ?? null,
          width: photo.width ?? null,
        });
      }

      if (rows.length === 0) {
        return { insertedIds: [], retainedStoragePaths: [], uploadedPaths };
      }

      const { data, error } = await client
        .from("memory_photos")
        .insert(rows)
        .select("id, storage_path");

      if (error) {
        throw error;
      }

      return {
        insertedIds: (data ?? []).map((row) => row.id),
        retainedStoragePaths: rows.flatMap((row) =>
          row.storage_path ? [row.storage_path] : [],
        ),
        uploadedPaths,
      };
    } catch (error) {
      if (uploadedPaths.length > 0) {
        await client.storage.from(PHOTO_BUCKET).remove(uploadedPaths);
      }
      throw error;
    }
  }

  async function replacePhotos(
    spaceId: string,
    memoryId: string,
    photos: readonly MemoryPhotoInput[],
  ) {
    const { data: previousRows, error: previousError } = await client
      .from("memory_photos")
      .select("id, storage_path")
      .eq("memory_id", memoryId);

    if (previousError) {
      throw previousError;
    }

    const inserted = await insertPhotos(spaceId, memoryId, photos);
    const previousIds = (previousRows ?? []).map((row) => row.id);

    if (previousIds.length > 0) {
      const { error } = await client
        .from("memory_photos")
        .delete()
        .in("id", previousIds);

      if (error) {
        throw error;
      }
    }

    const retainedPaths = new Set(inserted.retainedStoragePaths);
    const removedPaths = (previousRows ?? [])
      .map((row) => row.storage_path)
      .filter((path): path is string => Boolean(path) && !retainedPaths.has(path));

    if (removedPaths.length > 0) {
      await client.storage.from(PHOTO_BUCKET).remove(removedPaths);
    }
  }

  async function getMemory(id: string): Promise<Memory | null> {
    const rows = await fetchRows({ id });
    return rows[0] ? mapMemory(client, rows[0]) : null;
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
        try {
          await insertPhotos(spaceId, data.id, input.photos);
        } catch (photoError) {
          await client.from("memories").delete().eq("id", data.id).eq("space_id", spaceId);
          throw photoError;
        }
      }

      return getMemory(data.id);
    },
    async getById(id) {
      return getMemory(id);
    },
    async list() {
      const rows = await fetchRows();
      return Promise.all(rows.map((row) => mapMemory(client, row)));
    },
    async remove(id) {
      const spaceId = await getSpaceId();

      if (!spaceId) {
        return false;
      }

      const { data: photos, error: photoError } = await client
        .from("memory_photos")
        .select("storage_path")
        .eq("memory_id", id);

      if (photoError) {
        throw photoError;
      }

      const { error } = await client
        .from("memories")
        .delete()
        .eq("id", id)
        .eq("space_id", spaceId);

      if (error) {
        throw error;
      }

      const paths = (photos ?? [])
        .map((photo) => photo.storage_path)
        .filter((path): path is string => Boolean(path));

      if (paths.length > 0) {
        await client.storage.from(PHOTO_BUCKET).remove(paths);
      }

      return true;
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
        await replacePhotos(spaceId, id, input.photos);
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
