import type { Memory, MemorySong } from "@/types/memory";

import type { MemoryCatalog } from "@/features/memories/catalog";

export type MemoryPhotoInput = {
  alt: string;
  byteSize?: number;
  file?: File;
  height?: number;
  id?: string;
  mimeType?: string;
  storagePath?: string;
  visualValue?: string;
  width?: number;
};

export type MemoryMutationInput = {
  description: string;
  memoryDate: string;
  photos?: readonly MemoryPhotoInput[];
  songArtist: string;
  songTitle: string;
  songUrl: string;
  title: string;
};

export type MemorySongMutationInput = {
  artist: string;
  title: string;
  url: string;
};

export interface MemoryRepository extends MemoryCatalog {
  addSong(memoryId: string, input: MemorySongMutationInput): Promise<MemorySong | null>;
  create(input: MemoryMutationInput): Promise<Memory | null>;
  remove(id: string): Promise<boolean>;
  removeSong(memoryId: string, songId: string): Promise<boolean>;
  update(id: string, input: MemoryMutationInput): Promise<Memory | null>;
  updateSong(
    memoryId: string,
    songId: string,
    input: MemorySongMutationInput,
  ): Promise<MemorySong | null>;
}
