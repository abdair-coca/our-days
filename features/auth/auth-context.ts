import type { User } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthContext = {
  profileName: string;
  role: "member" | "owner";
  space: {
    id: string;
    name: string;
  };
  user: User;
};

export async function getAuthContext(): Promise<AuthContext | null> {
  const client = await createSupabaseServerClient();

  if (!client) {
    return null;
  }

  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: spaceId, error: workspaceError } = await client.rpc(
    "ensure_current_user_workspace",
  );

  if (workspaceError || !spaceId) {
    throw workspaceError ?? new Error("No encontramos tu espacio compartido.");
  }

  const [{ data: membership, error: membershipError }, { data: space, error: spaceError }, { data: profile, error: profileError }] =
    await Promise.all([
      client
        .from("space_members")
        .select("role")
        .eq("space_id", spaceId)
        .eq("profile_id", user.id)
        .maybeSingle(),
      client.from("spaces").select("id, name").eq("id", spaceId).single(),
      client
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single(),
    ]);

  if (membershipError || spaceError || profileError || !membership || !space) {
    throw membershipError ?? spaceError ?? profileError ?? new Error("No pudimos cargar tu espacio.");
  }

  return {
    profileName: profile.display_name ?? user.email ?? "Nuestro espacio",
    role: membership.role,
    space,
    user,
  };
}
