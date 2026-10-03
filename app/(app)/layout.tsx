import type { ReactNode } from "react";

import { AppFrame } from "@/components/layout/app-frame";
import { MusicLibraryScope } from "@/components/music/music-player";
import { getMusicLibraryAction } from "@/features/music/library-action";

export default async function PrivateDemoLayout({
  children,
}: {
  children: ReactNode;
}) {
  const library = await getMusicLibraryAction();
  return (
    <>
      <MusicLibraryScope library={library} />
      <AppFrame>{children}</AppFrame>
    </>
  );
}
