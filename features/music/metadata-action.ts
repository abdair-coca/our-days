"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import { fetchSongMetadata, type SongMetadata } from "./song-metadata";

export type SongMetadataResult = { ok: true; metadata: SongMetadata } | { ok: false };

/** Signed-in members only (or the local demo), so this is never an open proxy. */
export async function getSongMetadataAction(url: string): Promise<SongMetadataResult> {
  if (typeof url !== "string" || url.length > 500) return { ok: false };
  const client = await createSupabaseServerClient();
  if (client) {
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return { ok: false };
  }
  const metadata = await fetchSongMetadata(url);
  return metadata ? { ok: true, metadata } : { ok: false };
}
