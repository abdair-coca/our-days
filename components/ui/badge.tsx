import type { ComponentPropsWithoutRef } from "react";

import { classNames } from "@/lib/utils/class-names";

type BadgeTone = "neutral" | "accent" | "success" | "warning" | "error";

const tones: Record<BadgeTone, string> = {
  neutral:
    "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-soft)]",
  accent:
    "border-[var(--accent-soft)] bg-[var(--accent-soft)] text-[var(--accent)]",
  success:
    "border-[var(--success)]/30 bg-[var(--success)]/10 text-[var(--success)]",
  warning:
    "border-[var(--warning)]/30 bg-[var(--warning)]/10 text-[var(--warning)]",
  error: "border-[var(--error)]/30 bg-[var(--error)]/10 text-[var(--error)]",
};

export type BadgeProps = ComponentPropsWithoutRef<"span"> & {
  tone?: BadgeTone;
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold leading-none",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
