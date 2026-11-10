export type MemoryPhoto = {
  id: string;
  alt: string;
  /** Tiny data-URL preview shown while the real photo loads. */
  placeholder?: string;
  byteSize?: number;
  gradient: string;
  height?: number;
  mimeType?: string;
  src?: string;
  storagePath?: string;
  width?: number;
};

export type MemorySong = {
  addedAt: string;
  addedBy: string;
  artworkUrl?: string;
  id: string;
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
  songs: readonly MemorySong[];
};
