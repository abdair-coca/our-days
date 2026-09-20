import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { classNames } from "@/lib/utils/class-names";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "quiet";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "border border-transparent bg-[var(--accent)] text-white shadow-[var(--shadow-card)] hover:bg-[var(--accent-hover)] active:scale-[0.98]",
  secondary:
    "border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--accent-soft)] hover:bg-[var(--surface-soft)] active:scale-[0.98]",
  ghost:
    "border border-transparent bg-transparent text-[var(--accent)] hover:bg-[var(--accent-soft)] active:scale-[0.98]",
  quiet:
    "border border-transparent bg-transparent text-[var(--accent)] hover:bg-[var(--accent-soft)] active:scale-[0.98]",
};

type ButtonStyleOptions = {
  className?: string;
  disabled?: boolean;
  variant?: ButtonVariant;
};

export function getButtonClassName({
  className,
  disabled = false,
  variant = "primary",
}: ButtonStyleOptions = {}) {
  return classNames(
    "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-[var(--radius-button)] px-5 py-2.5 text-sm font-semibold transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-[var(--motion-fast)] ease-[var(--ease-standard)] hover:-translate-y-px focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--accent)] motion-reduce:transition-none motion-reduce:hover:transform-none",
    buttonVariants[variant],
    disabled && "cursor-not-allowed opacity-55",
    className,
  );
}

export type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "disabled"
> & {
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: ReactNode;
  variant?: ButtonVariant;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  children,
  className,
  disabled = false,
  loading = false,
  loadingLabel = "Cargando…",
  type = "button",
  variant = "primary",
  ...props
}, ref) {
  const isDisabled = disabled || loading;

  return (
    <button
      aria-busy={loading || undefined}
      className={getButtonClassName({ className, disabled: isDisabled, variant })}
      data-loading={loading || undefined}
      disabled={isDisabled}
      ref={ref}
      type={type}
      {...props}
    >
      {loading ? loadingLabel : children}
    </button>
  );
});
