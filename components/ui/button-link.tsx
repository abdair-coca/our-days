import Link from "next/link";
import type { ComponentProps } from "react";

import { classNames } from "@/lib/utils/class-names";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "quiet";
};

const variants = {
  primary:
    "bg-blush text-white shadow-sm hover:bg-blush-dark active:translate-y-px",
  secondary:
    "border border-ink/15 bg-white/75 text-ink hover:border-blush/40 hover:bg-white",
  quiet: "text-blush-dark hover:bg-blush/10",
} as const;

export function ButtonLink({
  className,
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={classNames(
        "inline-flex min-h-12 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-3",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
