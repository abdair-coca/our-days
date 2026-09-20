import { useId, type ReactNode } from "react";

import { FieldMessage } from "@/components/ui/field-message";
import { classNames } from "@/lib/utils/class-names";

export type FieldPresentationProps = {
  containerClassName?: string;
  error?: string;
  helpText?: ReactNode;
  label: ReactNode;
  loading?: boolean;
  loadingLabel?: string;
};

type FieldFrameProps = FieldPresentationProps & {
  children: ReactNode;
  controlId: string;
  errorId: string;
  helpId: string;
  loadingId: string;
  required?: boolean;
};

type FieldAccessibilityOptions = {
  describedBy?: string;
  error?: string;
  helpText?: ReactNode;
  id?: string;
  loading?: boolean;
  prefix: string;
};

export const fieldControlClassName =
  "min-h-12 w-full rounded-[var(--radius-input)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] shadow-[var(--shadow-card)] transition-[color,background-color,border-color,box-shadow,opacity] duration-[var(--motion-fast)] ease-[var(--ease-standard)] placeholder:text-[var(--text-muted)] hover:border-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-3 focus:ring-[var(--accent-soft)] disabled:cursor-not-allowed disabled:bg-[var(--surface-soft)] disabled:text-[var(--text-muted)] disabled:shadow-none motion-reduce:transition-none";

export function useFieldAccessibility({
  describedBy,
  error,
  helpText,
  id,
  loading,
  prefix,
}: FieldAccessibilityOptions) {
  const generatedId = useId().replaceAll(":", "");
  const controlId = id ?? `${prefix}-${generatedId}`;
  const helpId = `${controlId}-help`;
  const errorId = `${controlId}-error`;
  const loadingId = `${controlId}-loading`;
  const ariaDescribedBy = [
    describedBy,
    helpText ? helpId : undefined,
    error ? errorId : undefined,
    loading ? loadingId : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    ariaDescribedBy: ariaDescribedBy || undefined,
    controlId,
    errorId,
    helpId,
    loadingId,
  };
}

export function FieldFrame({
  children,
  containerClassName,
  controlId,
  error,
  errorId,
  helpId,
  helpText,
  label,
  loading = false,
  loadingId,
  loadingLabel = "Cargando campo…",
  required = false,
}: FieldFrameProps) {
  return (
    <div className={classNames("grid gap-2", containerClassName)}>
      <label className="text-sm font-semibold text-[var(--text)]" htmlFor={controlId}>
        {label}
        {required ? (
          <>
            <span aria-hidden="true"> *</span>
            <span className="sr-only"> (obligatorio)</span>
          </>
        ) : null}
      </label>
      {children}
      {helpText ? (
        <p className="text-sm leading-6 text-[var(--text-soft)]" id={helpId}>
          {helpText}
        </p>
      ) : null}
      <FieldMessage id={errorId} message={error} />
      {loading ? (
        <p
          className="text-sm font-medium text-[var(--text-soft)]"
          id={loadingId}
          role="status"
        >
          {loadingLabel}
        </p>
      ) : null}
    </div>
  );
}
