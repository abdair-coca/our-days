"use client";

import type { ReactNode } from "react";
import { signOutAction } from "@/features/auth/actions";
import { useMusicPlayer } from "./music-player";

export function MusicSignOutForm({ children }: { children: ReactNode }) {
  const { deactivate } = useMusicPlayer();
  return (
    <form action={signOutAction} onSubmit={deactivate}>
      {children}
    </form>
  );
}
