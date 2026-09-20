"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { classNames } from "@/lib/utils/class-names";
import { primaryNavigation } from "@/lib/constants/navigation";

function isCurrentPath(href: string, pathname: string): boolean {
  if (href === "/") {
    return pathname === href;
  }

  if (href === "/memories/new") {
    return pathname === href;
  }

  if (href === "/memories") {
    return pathname === href || (pathname.startsWith("/memories/") && pathname !== "/memories/new");
  }

  return pathname.startsWith(href);
}

export function SiteNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-ink/10 bg-card/95 p-1.5 shadow-soft backdrop-blur-md md:static md:border-0 md:bg-transparent md:p-0 md:shadow-none"
    >
      <ul className="grid grid-cols-4 gap-1 md:flex md:items-center md:gap-1">
        {primaryNavigation.map((item) => {
          const isCurrent = isCurrentPath(item.href, pathname);

          return (
            <li key={item.href}>
              <Link
                aria-current={isCurrent ? "page" : undefined}
                className={classNames(
                  "flex min-h-11 items-center justify-center rounded-xl px-2 py-2 text-center text-xs font-semibold transition sm:text-sm md:min-h-10 md:px-3",
                  isCurrent
                    ? "bg-blush text-white"
                    : "text-muted hover:bg-blush/10 hover:text-ink",
                )}
                href={item.href}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
