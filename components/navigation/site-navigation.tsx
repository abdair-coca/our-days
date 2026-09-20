"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

import {
  HomeIcon,
  ImagesIcon,
  PlusIcon,
  SettingsIcon,
  type IconProps,
} from "@/components/ui/icons";
import { classNames } from "@/lib/utils/class-names";
import { primaryNavigation } from "@/lib/constants/navigation";

const navigationIcons: Record<
  (typeof primaryNavigation)[number]["href"],
  ComponentType<IconProps>
> = {
  "/": HomeIcon,
  "/memories": ImagesIcon,
  "/memories/new": PlusIcon,
  "/settings": SettingsIcon,
};

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

type SiteNavigationProps = {
  variant: "desktop" | "mobile";
};

export function SiteNavigation({ variant }: SiteNavigationProps) {
  const pathname = usePathname();
  const isMobile = variant === "mobile";

  return (
    <nav
      aria-label={isMobile ? "Navegación principal móvil" : "Navegación principal"}
      className={isMobile ? "site-navigation-mobile" : "site-navigation-desktop"}
    >
      <ul
        className={classNames(
          "gap-1",
          isMobile ? "grid grid-cols-4" : "flex items-center",
        )}
      >
          {primaryNavigation.map((item) => {
            const isCurrent = isCurrentPath(item.href, pathname);
            const isCreate = item.href === "/memories/new";
            const Icon = navigationIcons[item.href];

          return (
            <li className="min-w-0" key={item.href}>
              <Link
                aria-current={isCurrent ? "page" : undefined}
                aria-label={item.label}
                className={classNames(
                  "relative flex min-h-11 min-w-11 items-center justify-center overflow-hidden rounded-button px-2 py-2 text-center text-xs font-semibold transition sm:text-sm",
                  !isMobile && "px-3",
                  isCurrent
                    ? "text-white"
                    : isCreate && isMobile
                      ? "bg-accent-soft/55 text-accent-hover"
                      : "text-muted hover:bg-accent-soft/35 hover:text-ink",
                )}
                href={item.href}
                title={item.label}
              >
                {isCurrent ? (
                  <motion.span
                    className="absolute inset-0 rounded-button bg-blush"
                    layoutId={`active-navigation-pill-${variant}`}
                    transition={{ type: "spring", stiffness: 430, damping: 34, mass: 0.72 }}
                  />
                ) : null}
                <span className="relative z-10">
                  <Icon aria-hidden="true" size={isMobile ? 22 : 20} />
                </span>
                <span className="sr-only">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
