import type { Memory } from "@/types/memory";

/**
 * Data seam for memory-reading pages. Callers know only ordering and misses:
 * list is newest-first, years is descending, and getById returns null on a miss.
 */
export interface MemoryCatalog {
  list(): Promise<readonly Memory[]>;
  getById(id: string): Promise<Memory | null>;
  years(): Promise<readonly number[]>;
}
