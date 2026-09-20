"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { statusReveal } from "@/components/motion/variants";
import { classNames } from "@/lib/utils/class-names";

export type StatusKind =
  | "neutral"
  | "loading"
  | "empty"
  | "error"
  | "success"
  | "offline";

export type StatusPanelProps = {
  action?: ReactNode;
  className?: string;
  title: string;
  children: ReactNode;
  tone?: "neutral" | "error";
  status?: StatusKind;
};

const statusStyles: Record<
  StatusKind,
  { className: string; label?: string }
> = {
  neutral: {
    className: "border-[var(--border)] bg-[var(--surface)]",
  },
  loading: {
    className: "border-[var(--border)] bg-[var(--surface)]",
    label: "Cargando",
  },
  empty: {
    className: "border-[var(--border)] bg-[var(--surface-soft)]",
    label: "Sin contenido",
  },
  error: {
    className: "border-[var(--error)]/40 bg-[var(--error)]/10",
    label: "Error",
  },
  success: {
    className: "border-[var(--success)]/40 bg-[var(--success)]/10",
    label: "Completado",
  },
  offline: {
    className: "border-[var(--warning)]/40 bg-[var(--warning)]/10",
    label: "Sin conexión",
  },
};

export function StatusPanel({
  action,
  className,
  title,
  children,
  tone = "neutral",
  status,
}: StatusPanelProps) {
  const shouldReduceMotion = useReducedMotion();
  const resolvedStatus = status ?? tone;
  const style = statusStyles[resolvedStatus];
  const role =
    resolvedStatus === "error" || resolvedStatus === "offline"
      ? "alert"
      : resolvedStatus === "loading" || resolvedStatus === "success"
        ? "status"
        : undefined;

  return (
    <motion.section
      aria-atomic={role ? true : undefined}
      aria-busy={resolvedStatus === "loading" || undefined}
      className={classNames(
        "rounded-[var(--radius-card)] border p-6 text-[var(--text)] shadow-[var(--shadow-card)]",
        style.className,
        className,
      )}
      initial={shouldReduceMotion ? false : "hidden"}
      role={role}
      variants={statusReveal}
      viewport={{ margin: "0px 0px -8% 0px", once: true }}
      whileInView="visible"
    >
      {style.label ? (
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-soft)]">
          {style.label}
        </p>
      ) : null}
      <h2 className="font-serif text-2xl font-semibold leading-tight">{title}</h2>
      <div className="mt-2 text-sm leading-6 text-[var(--text-soft)]">
        {children}
      </div>
      {action ? <div className="mt-5">{action}</div> : null}
    </motion.section>
  );
}

type StateProps = {
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  title?: string;
};

type LoadingStateProps = StateProps & {
  lines?: number;
};

export function LoadingState({
  children = "Estamos preparando este momento.",
  className,
  lines = 3,
  title = "Cargando recuerdos",
}: LoadingStateProps) {
  return (
    <StatusPanel className={className} status="loading" title={title}>
      <span>{children}</span>
      <span aria-hidden="true" className="mt-5 grid gap-3">
        {Array.from({ length: lines }, (_, index) => (
          <span
            className={classNames(
              "h-3 animate-pulse rounded-full bg-[var(--surface-soft)] motion-reduce:animate-none",
              index === lines - 1 ? "w-2/3" : "w-full",
            )}
            key={index}
          />
        ))}
      </span>
    </StatusPanel>
  );
}

export function EmptyState({
  action,
  children = "Cuando quieran guardar uno, este será su lugar.",
  className,
  title = "Todavía no hay recuerdos aquí",
}: StateProps) {
  return (
    <StatusPanel action={action} className={className} status="empty" title={title}>
      {children}
    </StatusPanel>
  );
}

export function ErrorState({
  action,
  children = "Tus cambios siguen aquí. Puedes intentarlo de nuevo.",
  className,
  title = "No pudimos completar esta acción",
}: StateProps) {
  return (
    <StatusPanel action={action} className={className} status="error" title={title}>
      {children}
    </StatusPanel>
  );
}

export function SuccessState({
  action,
  children = "Todo quedó listo.",
  className,
  title = "Guardado",
}: StateProps) {
  return (
    <StatusPanel action={action} className={className} status="success" title={title}>
      {children}
    </StatusPanel>
  );
}

export function OfflineState({
  action,
  children = "Revisa tu conexión. Podrás intentarlo de nuevo sin perder tus cambios.",
  className,
  title = "Estás sin conexión",
}: StateProps) {
  return (
    <StatusPanel action={action} className={className} status="offline" title={title}>
      {children}
    </StatusPanel>
  );
}
