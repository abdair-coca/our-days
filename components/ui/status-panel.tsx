import type { ReactNode } from "react";

type StatusPanelProps = {
  title: string;
  children: ReactNode;
  tone?: "neutral" | "error";
};

export function StatusPanel({
  title,
  children,
  tone = "neutral",
}: StatusPanelProps) {
  return (
    <section
      className={
        tone === "error"
          ? "rounded-3xl border border-red-200 bg-red-50 p-6 text-red-950"
          : "rounded-3xl border border-ink/10 bg-white/70 p-6"
      }
    >
      <h2 className="font-serif text-2xl font-semibold">{title}</h2>
      <div className="mt-2 text-sm leading-6 opacity-80">{children}</div>
    </section>
  );
}
