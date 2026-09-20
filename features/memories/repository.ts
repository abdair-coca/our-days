import type { Memory } from "@/types/memory";

import type { MemoryCatalog } from "@/features/memories/catalog";

export type MemoryPhotoInput = {
  alt: string;
  id?: string;
  visualValue?: string;
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

export interface MemoryRepository extends MemoryCatalog {
  create(input: MemoryMutationInput): Promise<Memory | null>;
  remove(id: string): Promise<boolean>;
  update(id: string, input: MemoryMutationInput): Promise<Memory | null>;
}
