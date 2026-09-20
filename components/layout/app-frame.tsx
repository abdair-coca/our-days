import Link from "next/link";
import type { ReactNode } from "react";

import { SiteNavigation } from "@/components/navigation/site-navigation";

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
      <header className="app-header border-b border-border-soft bg-paper/95 backdrop-blur-md">
        <div className="container-app grid min-h-16 grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
          <Link
            className="inline-flex min-h-11 w-fit items-center rounded-sm font-serif text-2xl font-semibold tracking-tight"
            href="/"
          >
            Our Days
          </Link>
          <div className="hidden md:block md:justify-self-center">
            <SiteNavigation variant="desktop" />
          </div>
          <p className="hidden max-w-56 text-right text-sm leading-5 text-muted lg:block lg:justify-self-end">
            Un lugar para lo que vivimos juntos
          </p>
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
