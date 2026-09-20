export type MemoryPhoto = {
  id: string;
  alt: string;
  gradient: string;
};

export type MemorySong = {
  title: string;
  artist: string;
  url: string;
};

export type Memory = {
  id: string;
  title: string;
  description: string;
  memoryDate: string;
  createdBy: string;
  photos: readonly MemoryPhoto[];
  song: MemorySong | null;
};
