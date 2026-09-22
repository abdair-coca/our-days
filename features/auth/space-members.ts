"use server";

import { getAuthContext } from "@/features/auth/auth-context";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SpaceMember = {
  displayName: string;
  email: string;
  joinedAt: string;
  profileId: string;
  role: "member" | "owner";
};

export type SpaceUserSearchResult = SpaceMember & {
  isMember: boolean;
};

export type SpaceMemberActionResult = {
  member?: SpaceMember;
  message: string;
  ok: boolean;
};

function errorMessage(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("owner_required")) {
    return "Solo la persona propietaria puede quitar a alguien del espacio.";
  }

  if (normalized.includes("owner_cannot_be_removed")) {
    return "La persona propietaria no se puede quitar del espacio.";
  }

  if (normalized.includes("user_already_member")) {
    return "Esta persona ya está conectada a tus recuerdos.";
  }

  if (normalized.includes("user_not_found")) {
    return "No encontramos a esa persona.";
  }

  if (normalized.includes("space_access_denied")) {
    return "No tienes acceso para gestionar este espacio.";
  }

  return "No pudimos actualizar las personas del espacio. Inténtalo de nuevo.";
}

function connectionError(message: string): SpaceMemberActionResult {
  return {
    message,
    ok: false,
  };
}

function mapMember(row: {
  display_name: string | null;
  email: string | null;
  joined_at: string;
  profile_id: string;
  role: string;
}): SpaceMember {
  return {
    displayName: row.display_name || row.email || "Persona sin nombre",
    email: row.email || "",
    joinedAt: row.joined_at,
    profileId: row.profile_id,
    role: row.role === "owner" ? "owner" : "member",
  };
}

export async function getSpaceMembers(): Promise<SpaceMember[]> {
  const client = await createSupabaseServerClient();

  if (!client) {
    return [];
  }

  const context = await getAuthContext();
  if (!context) {
    return [];
  }

  const { data, error } = await client.rpc("list_space_members", {
    target_space_id: context.space.id,
  });

  if (error) {
    throw new Error("No pudimos cargar las personas del espacio.");
  }

  return ((data ?? []) as Array<{
    display_name: string | null;
    email: string | null;
    joined_at: string;
    profile_id: string;
    role: string;
  }>).map(mapMember);
}

export async function searchSpaceUsersAction(
  query: string,
): Promise<{ error: string; results: SpaceUserSearchResult[] }> {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    return { error: "", results: [] };
  }

  const client = await createSupabaseServerClient();

  if (!client) {
    return { error: "Configura Supabase para buscar personas.", results: [] };
  }

  let context;

  try {
    context = await getAuthContext();
  } catch {
    return { error: "No pudimos cargar tu espacio. Inténtalo de nuevo.", results: [] };
  }

  if (!context) {
    return { error: "Inicia sesión para buscar personas.", results: [] };
  }

  const { data, error } = await client.rpc("search_space_users", {
    search_query: normalizedQuery,
    target_space_id: context.space.id,
  });

  if (error) {
    return { error: errorMessage(error.message), results: [] };
  }

  return {
    error: "",
    results: ((data ?? []) as Array<{
      display_name: string | null;
      email: string | null;
      is_member: boolean;
      profile_id: string;
    }>).map((row) => ({
      ...mapMember({ ...row, joined_at: "", role: "member" }),
      isMember: row.is_member,
    })),
  };
}

export async function addSpaceMemberAction(
  profileId: string,
): Promise<SpaceMemberActionResult> {
  const normalizedProfileId = profileId.trim();
  const client = await createSupabaseServerClient();

  if (!client || !normalizedProfileId) {
    return connectionError("No pudimos añadir a esta persona. Inténtalo de nuevo.");
  }

  let context;

  try {
    context = await getAuthContext();
  } catch {
    return connectionError("No pudimos cargar tu espacio. Inténtalo de nuevo.");
  }

  if (!context) {
    return connectionError("Inicia sesión para añadir personas.");
  }

  const { data, error } = await client.rpc("add_space_member", {
    target_profile_id: normalizedProfileId,
    target_space_id: context.space.id,
  });

  if (error) {
    return {
      message: errorMessage(error.message),
      ok: false,
    };
  }

  const row = (data as Array<{
    display_name: string | null;
    email: string | null;
    joined_at: string;
    profile_id: string;
    role: string;
  }> | null)?.[0];

  return {
    member: row ? mapMember(row) : undefined,
    message: "Persona añadida a tus recuerdos.",
    ok: true,
  };
}

export async function removeSpaceMemberAction(
  profileId: string,
): Promise<SpaceMemberActionResult> {
  const normalizedProfileId = profileId.trim();
  const client = await createSupabaseServerClient();

  if (!client || !normalizedProfileId) {
    return connectionError("No pudimos quitar a esta persona. Inténtalo de nuevo.");
  }

  let context;

  try {
    context = await getAuthContext();
  } catch {
    return connectionError("No pudimos cargar tu espacio. Inténtalo de nuevo.");
  }

  if (!context) {
    return connectionError("Inicia sesión para quitar personas.");
  }

  const { error } = await client.rpc("remove_space_member", {
    target_profile_id: normalizedProfileId,
    target_space_id: context.space.id,
  });

  if (error) {
    return {
      message: errorMessage(error.message),
      ok: false,
    };
  }

  return {
    message: "Persona quitada del espacio.",
    ok: true,
  };
}
