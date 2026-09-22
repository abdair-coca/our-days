import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  MemoryPhotoInput,
  MemorySongMutationInput,
  MemoryRepository,
} from "@/features/memories/repository";
import { resolveSongLink } from "@/features/music/song-source";
import { demoGradients } from "@/lib/images/demo-art";
import type { MemoryPhotoRow, MemoryRow, MemorySongRow } from "@/types/database";
import type { Memory, MemoryPhoto, MemorySong } from "@/types/memory";

const PHOTO_BUCKET = "memory-photos";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

type ProfileJoin =
  | { display_name: string | null }
  | { display_name: string | null }[]
  | null;

type MemoryQueryRow = MemoryRow & {
  memory_photos: MemoryPhotoRow[] | null;
  memory_songs: MemorySongRow[] | null;
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

function mapSong(row: MemorySongRow): MemorySong {
  return {
    addedAt: row.created_at,
    addedBy: row.added_by,
    artist: row.artist,
    id: row.id,
    title: row.title,
    url: row.url,
  };
}

function canonicalSongInput(input: MemorySongMutationInput): MemorySongMutationInput {
  const title = input.title.trim();
  const artist = input.artist.trim();
  const url = input.url.trim();

  if (!title || !url) {
    throw new Error("La canción necesita un título y un enlace compatible.");
  }

  const source = resolveSongLink(url);

  if (!source.ok) {
    throw new Error("Usa un enlace de una canción de Spotify o YouTube Music.");
  }

  return { artist, title, url: source.canonicalUrl };
}

function hasSongFields(input: MemorySongMutationInput): boolean {
  return Boolean(input.title.trim() || input.artist.trim() || input.url.trim());
}

function duplicateSongError(error: unknown): Error {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  ) {
    return new Error("Ya añadieron esta canción a este recuerdo.");
  }

  return error instanceof Error ? error : new Error("No pudimos guardar la canción.");
}

async function mapMemory(
  client: SupabaseClient,
  row: MemoryQueryRow,
): Promise<Memory> {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  const photos = [...(row.memory_photos ?? [])]
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((photo) => mapPhoto(client, photo));
  const songs = [...(row.memory_songs ?? [])]
    .sort((left, right) => {
      const createdAt = left.created_at.localeCompare(right.created_at);
      return createdAt || left.id.localeCompare(right.id);
    })
    .map(mapSong);

  // The migration backfills this collection. The fallback keeps reads safe during
  // a rolling deploy and lets old memories remain visible if the child row is absent.
  const legacySong =
    row.song_title || row.song_artist || row.song_url
      ? {
          addedAt: row.created_at,
          addedBy: row.created_by,
          artist: row.song_artist ?? "",
          id: `legacy-${row.id}`,
          title: row.song_title ?? "",
          url: row.song_url ?? "",
        }
      : null;

  return {
    createdBy: profile?.display_name ?? "Nuestro espacio",
    description: row.description,
    id: row.id,
    memoryDate: row.memory_date,
    photos: await Promise.all(photos),
    songs: songs.length > 0 ? songs : legacySong ? [legacySong] : [],
    title: row.title,
  };
}

export function createSupabaseMemoryRepository(
  client: SupabaseClient,
  userId: string,
): MemoryRepository {
  async function getSpaceId(): Promise<string | null> {
    const { data, error } = await client.rpc("ensure_current_user_workspace");

    if (error) {
      throw error;
    }

    return data ?? null;
  }

  async function fetchRows(filters?: { id?: string; spaceId?: string }) {
    const spaceId = filters?.spaceId ?? (await getSpaceId());

    if (!spaceId) {
      return [];
    }

    let query = client
      .from("memories")
      .select("*, memory_photos(*), memory_songs(*), profiles:created_by(display_name)")
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

  async function listSongs(memoryId: string): Promise<MemorySong[]> {
    const { data, error } = await client
      .from("memory_songs")
      .select("*")
      .eq("memory_id", memoryId)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    return ((data ?? []) as unknown as MemorySongRow[]).map(mapSong);
  }

  async function insertSong(
    memoryId: string,
    input: MemorySongMutationInput,
  ): Promise<MemorySong | null> {
    const song = canonicalSongInput(input);
    const { data, error } = await client
      .from("memory_songs")
      .insert({
        added_by: userId,
        artist: song.artist,
        memory_id: memoryId,
        title: song.title,
        url: song.url,
      })
      .select("*")
      .single();

    if (error) {
      throw duplicateSongError(error);
    }

    return data ? mapSong(data as unknown as MemorySongRow) : null;
  }

  async function syncLegacySongColumns(memoryId: string): Promise<void> {
    const [firstSong] = await listSongs(memoryId);
    const { error } = await client
      .from("memories")
      .update({
        song_artist: firstSong?.artist ?? null,
        song_title: firstSong?.title ?? null,
        song_url: firstSong?.url ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", memoryId);

    if (error) {
      throw error;
    }
  }

  function initialSongFromMemoryInput(input: {
    songArtist: string;
    songTitle: string;
    songUrl: string;
  }): MemorySongMutationInput | null {
    const candidate = {
      artist: input.songArtist,
      title: input.songTitle,
      url: input.songUrl,
    };

    return hasSongFields(candidate) ? canonicalSongInput(candidate) : null;
  }

  const repository: MemoryRepository = {
    async create(input) {
      const spaceId = await getSpaceId();

      if (!spaceId) {
        throw new Error("No hay un espacio disponible para este usuario.");
      }

      const firstSong = initialSongFromMemoryInput(input);

      const { data, error } = await client
        .from("memories")
        .insert({
          created_by: userId,
          description: input.description,
          memory_date: input.memoryDate,
          song_artist: firstSong?.artist ?? null,
          song_title: firstSong?.title ?? null,
          song_url: firstSong?.url ?? null,
          space_id: spaceId,
          title: input.title,
        })
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      try {
        if (firstSong) {
          await insertSong(data.id, firstSong);
        }
      } catch (songError) {
        await client.from("memories").delete().eq("id", data.id).eq("space_id", spaceId);
        throw songError;
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
    async addSong(memoryId, input) {
      const song = await insertSong(memoryId, input);
      await syncLegacySongColumns(memoryId);
      return song;
    },
    async update(id, input) {
      const spaceId = await getSpaceId();

      if (!spaceId) {
        throw new Error("No hay un espacio disponible para este usuario.");
      }

      const firstSong = initialSongFromMemoryInput(input);

      const { data, error } = await client
        .from("memories")
        .update({
          description: input.description,
          memory_date: input.memoryDate,
          song_artist: firstSong?.artist ?? null,
          song_title: firstSong?.title ?? null,
          song_url: firstSong?.url ?? null,
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

      const [oldestSong] = await listSongs(id);

      if (firstSong) {
        if (oldestSong) {
          const { error: songError } = await client
            .from("memory_songs")
            .update({ ...firstSong, updated_at: new Date().toISOString() })
            .eq("id", oldestSong.id)
            .eq("memory_id", id);

          if (songError) {
            throw duplicateSongError(songError);
          }
        } else {
          await insertSong(id, firstSong);
        }
      } else if (oldestSong) {
        const { error: songError } = await client
          .from("memory_songs")
          .delete()
          .eq("id", oldestSong.id)
          .eq("memory_id", id);

        if (songError) {
          throw songError;
        }
      }

      if (input.photos) {
        await replacePhotos(spaceId, id, input.photos);
      }

      return getMemory(id);
    },
    async removeSong(memoryId, songId) {
      const { data, error } = await client
        .from("memory_songs")
        .delete()
        .eq("id", songId)
        .eq("memory_id", memoryId)
        .select("id")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        return false;
      }

      await syncLegacySongColumns(memoryId);
      return true;
    },
    async updateSong(memoryId, songId, input) {
      const song = canonicalSongInput(input);
      const { data, error } = await client
        .from("memory_songs")
        .update({ ...song, updated_at: new Date().toISOString() })
        .eq("id", songId)
        .eq("memory_id", memoryId)
        .select("*")
        .maybeSingle();

      if (error) {
        throw duplicateSongError(error);
      }

      if (!data) {
        return null;
      }

      await syncLegacySongColumns(memoryId);
      return mapSong(data as unknown as MemorySongRow);
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
