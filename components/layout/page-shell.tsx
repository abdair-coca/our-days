import type { ReactNode } from "react";

type PageShellProps = {
  eyebrow?: string;
  title: string;
  intro?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function PageShell({
  eyebrow,
  title,
  intro,
  actions,
  children,
}: PageShellProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="mb-2 text-xs font-bold tracking-[0.18em] text-blush-dark uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-balance font-serif text-4xl leading-tight font-semibold sm:text-5xl">
            {title}
          </h1>
          {intro ? (
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              {intro}
            </p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </header>
      {children}
    </div>
  );
}
