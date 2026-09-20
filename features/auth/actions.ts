"use server";

import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getAuthContext } from "@/features/auth/auth-context";
import {
  initialAuthActionState,
  type AuthActionState,
} from "@/features/auth/action-state";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function textValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function safeNextPath(value: string): string {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

function authErrorMessage(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "El correo o la contraseña no coinciden.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Confirma tu correo antes de entrar.";
  }

  if (normalized.includes("user already registered")) {
    return "Esta cuenta ya existe. Intenta entrar.";
  }

  return "No pudimos completar el acceso. Inténtalo de nuevo.";
}

function inviteErrorMessage(message: string): string {
  if (message.includes("invite_email_mismatch")) {
    return "Esta invitación está dirigida a otro correo.";
  }

  if (message.includes("invite_invalid_or_expired")) {
    return "Esta invitación ya no es válida o ha caducado.";
  }

  return "No pudimos aceptar la invitación. Inténtalo de nuevo.";
}

function getSiteOrigin(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (siteUrl) {
    return siteUrl.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

export async function authAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const client = await createSupabaseServerClient();

  if (!client) {
    return {
      ...initialAuthActionState,
      error: "Configura Supabase para activar el acceso privado.",
    };
  }

  const email = textValue(formData, "email");
  const password = textValue(formData, "password");
  const displayName = textValue(formData, "displayName");
  const intent = textValue(formData, "intent");
  const nextPath = safeNextPath(textValue(formData, "next"));

  if (!email || !password) {
    return {
      ...initialAuthActionState,
      error: "Escribe tu correo y contraseña.",
    };
  }

  if (intent === "signup") {
    if (password.length < 8) {
      return {
        ...initialAuthActionState,
        error: "La contraseña debe tener al menos 8 caracteres.",
      };
    }

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: displayName ? { display_name: displayName } : undefined,
      },
    });

    if (error) {
      return { ...initialAuthActionState, error: authErrorMessage(error.message) };
    }

    if (!data.session) {
      return {
        ...initialAuthActionState,
        message: "Cuenta creada. Revisa tu correo para confirmar el acceso.",
        ok: true,
      };
    }

    redirect(nextPath);
  }

  const { error } = await client.auth.signInWithPassword({ email, password });

  if (error) {
    return { ...initialAuthActionState, error: authErrorMessage(error.message) };
  }

  redirect(nextPath);
}

export async function signOutAction() {
  const client = await createSupabaseServerClient();
  await client?.auth.signOut();
  redirect("/login");
}

export async function createInviteAction(
  previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const client = await createSupabaseServerClient();
  const context = await getAuthContext();

  if (!client || !context) {
    return {
      ...previousState,
      error: "Inicia sesión para crear una invitación.",
      inviteUrl: undefined,
      ok: false,
    };
  }

  const invitedEmail = textValue(formData, "invitedEmail").toLowerCase();

  if (invitedEmail && !/^\S+@\S+\.\S+$/.test(invitedEmail)) {
    return {
      ...previousState,
      error: "Escribe un correo válido o deja el campo vacío.",
      inviteUrl: undefined,
      ok: false,
    };
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await client.from("space_invites").insert({
    created_by: context.user.id,
    expires_at: expiresAt,
    invited_email: invitedEmail || null,
    space_id: context.space.id,
    token_hash: tokenHash,
  });

  if (error) {
    return {
      ...previousState,
      error: "No pudimos crear la invitación. Inténtalo de nuevo.",
      inviteUrl: undefined,
      ok: false,
    };
  }

  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const forwardedProtocol = headerStore.get("x-forwarded-proto") ?? "http";
  const origin = forwardedHost
    ? `${forwardedProtocol}://${forwardedHost}`
    : getSiteOrigin();

  return {
    error: "",
    inviteUrl: `${origin}/invite?token=${encodeURIComponent(token)}`,
    message: "Invitación lista. Comparte este enlace con tu persona.",
    ok: true,
  };
}

export async function acceptInviteAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const token = textValue(formData, "token");
  const client = await createSupabaseServerClient();

  if (!client || !token) {
    return {
      ...initialAuthActionState,
      error: "Esta invitación no está disponible.",
    };
  }

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return {
      ...initialAuthActionState,
      error: "Inicia sesión para aceptar la invitación.",
    };
  }

  const { error } = await client.rpc("accept_space_invite", {
    invite_token: token,
  });

  if (error) {
    return {
      ...initialAuthActionState,
      error: inviteErrorMessage(error.message),
    };
  }

  redirect("/");
}
