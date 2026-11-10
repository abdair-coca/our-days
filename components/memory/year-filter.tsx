"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import { classNames } from "@/lib/utils/class-names";

type YearFilterProps = {
  selectedYear: number | null;
  years: readonly number[];
};

/** Year chips share one sliding highlight, like the main navigation. */
export function YearFilter({ selectedYear, years }: YearFilterProps) {
  const reduce = useReducedMotion();
  const options = [
    { href: "/memories", label: "Todos", value: null },
    ...years.map((year) => ({ href: `/memories?year=${year}`, label: String(year), value: year })),
  ];

  return (
    <nav aria-label="Filtrar recuerdos por año" className="-mx-1 mb-7 overflow-x-auto px-1 pb-2">
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
                    className="absolute inset-0 rounded-[var(--radius-button)] bg-accent shadow-[0_8px_20px_rgb(158_75_61/0.25)]"
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
