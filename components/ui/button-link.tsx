"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import {
  getButtonClassName,
  type ButtonVariant,
} from "@/components/ui/button";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: ReactNode;
  variant?: ButtonVariant;
};

export function ButtonLink({
  children,
  className,
  disabled = false,
  loading = false,
  loadingLabel = "Cargando…",
  onClick,
  tabIndex,
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  const isDisabled = disabled || loading;

  return (
    <Link
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      className={getButtonClassName({ className, disabled: isDisabled, variant })}
      data-loading={loading || undefined}
      onClick={(event) => {
        if (isDisabled) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }

        onClick?.(event);
      }}
      tabIndex={isDisabled ? -1 : tabIndex}
      {...props}
    >
      {loading ? loadingLabel : children}
    </Link>
  );
}
