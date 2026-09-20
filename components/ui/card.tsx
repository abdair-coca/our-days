import type { ComponentPropsWithoutRef, ElementType } from "react";

import { classNames } from "@/lib/utils/class-names";

type CardElement = "article" | "div" | "section";
type CardPadding = "none" | "compact" | "default" | "spacious";
type CardTone = "default" | "soft";

const paddings: Record<CardPadding, string> = {
  none: "",
  compact: "p-4",
  default: "p-6",
  spacious: "p-6 sm:p-8",
};

const tones: Record<CardTone, string> = {
  default: "bg-[var(--surface)]",
  soft: "bg-[var(--surface-soft)]",
};

export type CardProps = ComponentPropsWithoutRef<"div"> & {
  as?: CardElement;
  padding?: CardPadding;
  tone?: CardTone;
};

export function Card({
  as = "div",
  className,
  padding = "default",
  tone = "default",
  ...props
}: CardProps) {
  const Element: ElementType = as;

  return (
    <Element
      className={classNames(
        "rounded-[var(--radius-card)] border border-[var(--border)] text-[var(--text)] shadow-[var(--shadow-card)]",
        tones[tone],
        paddings[padding],
        className,
      )}
      {...props}
    />
  );
}
