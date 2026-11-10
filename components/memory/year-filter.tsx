"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import { classNames } from "@/lib/utils/class-names";

type YearFilterProps = {
  /** Active search, preserved when switching years. */
  query?: string;
  selectedYear: number | null;
  years: readonly number[];
};

function filterHref(year: number | null, query: string) {
  const params = new URLSearchParams();
  if (year !== null) params.set("year", String(year));
  if (query) params.set("q", query);
  const search = params.toString();
  return search ? `/memories?${search}` : "/memories";
}

/** Year chips share one sliding highlight, like the main navigation. */
export function YearFilter({ query = "", selectedYear, years }: YearFilterProps) {
  const reduce = useReducedMotion();
  const options = [
    { href: filterHref(null, query), label: "Todos", value: null },
    ...years.map((year) => ({ href: filterHref(year, query), label: String(year), value: year })),
  ];

  return (
    <nav aria-label="Filtrar recuerdos por año" className="-mx-3 mb-6 overflow-x-auto px-3 pt-1 pb-3">
      <ul className="flex min-w-max gap-2">
        {options.map((option) => {
          const current = option.value === selectedYear;
          return (
            <li key={option.label}>
              <Link
                aria-current={current ? "page" : undefined}
                className={classNames(
                  "relative inline-flex min-h-11 items-center rounded-[var(--radius-button)] border px-4 py-2 text-sm font-semibold transition-[color,border-color,transform] duration-[var(--motion-fast)] ease-[var(--ease-standard)] active:scale-[0.97]",
                  current
                    ? "border-transparent text-white"
                    : "border-border bg-surface hover:-translate-y-px hover:border-accent-soft",
                )}
                href={option.href}
                scroll={false}
              >
                {current ? (
                  <motion.span
                    className="absolute inset-0 rounded-[var(--radius-button)] bg-accent shadow-[0_4px_12px_rgb(158_75_61/0.22)]"
                    layoutId="year-filter-pill"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 430, damping: 34, mass: 0.72 }}
                  />
                ) : null}
                <span className="relative z-10 tabular-nums">{option.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
