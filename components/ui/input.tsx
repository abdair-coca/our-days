"use client";

import {
  forwardRef,
  type ComponentPropsWithoutRef,
} from "react";

import {
  FieldFrame,
  fieldControlClassName,
  type FieldPresentationProps,
  useFieldAccessibility,
} from "@/components/ui/_field";
import { classNames } from "@/lib/utils/class-names";

export type InputProps = Omit<ComponentPropsWithoutRef<"input">, "id"> &
  FieldPresentationProps & {
    id?: string;
  };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    "aria-describedby": describedBy,
    "aria-invalid": ariaInvalid,
    className,
    containerClassName,
    disabled = false,
    error,
    helpText,
    id,
    label,
    loading = false,
    loadingLabel,
    required = false,
    ...props
  },
  ref,
) {
  const field = useFieldAccessibility({
    describedBy,
    error,
    helpText,
    id,
    loading,
    prefix: "input",
  });

  return (
    <FieldFrame
      containerClassName={containerClassName}
      controlId={field.controlId}
      error={error}
      errorId={field.errorId}
      helpId={field.helpId}
      helpText={helpText}
      label={label}
      loading={loading}
      loadingId={field.loadingId}
      loadingLabel={loadingLabel}
      required={required}
    >
      <input
        aria-busy={loading || undefined}
        aria-describedby={field.ariaDescribedBy}
        aria-invalid={error ? true : ariaInvalid}
        className={classNames(
          fieldControlClassName,
          error && "border-[var(--error)] ring-1 ring-[var(--error)]",
          className,
        )}
        disabled={disabled || loading}
        id={field.controlId}
        ref={ref}
        required={required}
        {...props}
      />
    </FieldFrame>
  );
});
