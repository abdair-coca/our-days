import Link from "next/link";
import type { ReactNode } from "react";

import { SiteNavigation } from "@/components/navigation/site-navigation";
import { MusicLibraryButton } from "@/components/music/music-player";

type AppFrameProps = {
  children: ReactNode;
};

export function AppFrame({ children }: AppFrameProps) {
  return (
    <div className="app-frame min-h-dvh overflow-x-clip">
      <a
        className="fixed top-3 left-3 z-50 -translate-y-20 rounded-button bg-ink px-4 py-3 text-sm font-semibold text-white transition focus:translate-y-0"
        href="#main-content"
      >
        Saltar al contenido
      </a>
      <header className="app-header border-b border-border-soft bg-paper/70 backdrop-blur-md">
        <div className="container-app grid min-h-16 grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
          <Link
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-sm font-serif text-2xl font-semibold tracking-tight"
            href="/"
          >
            <svg aria-hidden="true" className="brand-mark" height="20" viewBox="0 0 64 64" width="20">
              <defs>
                <linearGradient gradientUnits="userSpaceOnUse" id="brand-warm" x1="8" x2="56" y1="8" y2="56">
                  <stop stopColor="#EAA99D" />
                  <stop offset="1" stopColor="#9B4F55" />
                </linearGradient>
              </defs>
              <path d="M32 55C23 48 8 38 8 23 8 14 14 9 22 9c5 0 8 2 10 6 2-4 5-6 10-6 8 0 14 5 14 14 0 15-15 25-24 32Z" fill="url(#brand-warm)" />
            </svg>
            Our Days
          </Link>
          <div className="hidden md:block md:justify-self-center">
            <SiteNavigation variant="desktop" />
          </div>
          <div className="justify-self-end">
            <MusicLibraryButton />
          </div>
        </div>
      </header>
      <main className="min-w-0" id="main-content" tabIndex={-1}>
        {children}
      </main>
      <div className="md:hidden">
        <SiteNavigation variant="mobile" />
      </div>
    </div>
  );
}
