import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <a
        className="fixed top-3 left-3 -translate-y-20 rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white transition focus:translate-y-0"
        href="#main-content"
      >
        Saltar al contenido
      </a>
      <main className="w-full max-w-md" id="main-content">
        <Link className="mb-7 block text-center font-serif text-3xl font-semibold" href="/">
          Our Days
        </Link>
        {children}
      </main>
    </div>
  );
}
