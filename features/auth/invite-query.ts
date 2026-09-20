import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type InvitePreview = {
  expiresAt: string;
  invitedEmail: string | null;
  isValid: boolean;
  spaceName: string;
};

export async function getInvitePreview(token: string): Promise<InvitePreview | null> {
  const client = await createSupabaseServerClient();

  if (!client || !token) {
    return null;
  }

  const { data, error } = await client.rpc("get_space_invite", {
    invite_token: token,
  });

  if (error) {
    return null;
  }

  const row = Array.isArray(data) ? data[0] : data;

  if (!row) {
    return null;
  }

  return {
    expiresAt: row.expires_at,
    invitedEmail: row.invited_email,
    isValid: row.is_valid,
    spaceName: row.space_name,
  };
}
