import Link from "next/link";
import type { ReactNode } from "react";

import { SiteNavigation } from "@/components/navigation/site-navigation";

type AppFrameProps = {
  children: ReactNode;
};

export function AppFrame({ children }: AppFrameProps) {
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <a
        className="fixed top-3 left-3 z-50 -translate-y-20 rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white transition focus:translate-y-0"
        href="#main-content"
      >
        Saltar al contenido
      </a>
      <header className="border-b border-ink/8 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            className="rounded-sm font-serif text-2xl font-semibold tracking-tight"
            href="/"
          >
            Our Days
          </Link>
          <p className="hidden text-sm text-muted sm:block">
            Un lugar para lo que vivimos juntos
          </p>
          <div className="hidden md:block">
            <SiteNavigation />
          </div>
        </div>
      </header>
      <main id="main-content">{children}</main>
      <div className="md:hidden">
        <SiteNavigation />
      </div>
    </div>
  );
}
