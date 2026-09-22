import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function getSafeRedirect(request: NextRequest): URL {
  const fallback = new URL("/login", request.url);
  const rawNext = request.nextUrl.searchParams.get("next");

  if (!rawNext) {
    return fallback;
  }

  try {
    const nextUrl = new URL(rawNext, request.url);

    if (nextUrl.origin !== request.nextUrl.origin) {
      return fallback;
    }

    nextUrl.hash = "";
    return nextUrl;
  } catch {
    return fallback;
  }
}

function failureRedirect(request: NextRequest) {
  const redirectUrl = getSafeRedirect(request);
  redirectUrl.pathname = "/login";
  redirectUrl.search = "?confirmation=failed";
  return NextResponse.redirect(redirectUrl);
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");

  if (!tokenHash || type !== "email") {
    return failureRedirect(request);
  }

  const client = await createSupabaseServerClient();

  if (!client) {
    return failureRedirect(request);
  }

  try {
    const { error } = await client.auth.verifyOtp({
      token_hash: tokenHash,
      type: "email",
    });

    if (error) {
      return failureRedirect(request);
    }
  } catch {
    return failureRedirect(request);
  }

  return NextResponse.redirect(getSafeRedirect(request));
}
