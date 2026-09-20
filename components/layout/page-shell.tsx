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
    <div className="container-editorial py-8 sm:py-12">
      <header className="mb-8 flex min-w-0 flex-col gap-5 sm:mb-10 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 max-w-3xl">
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
        {actions ? (
          <div className="flex w-full shrink-0 flex-wrap gap-2 md:w-auto md:justify-end">
            {actions}
          </div>
        ) : null}
      </header>
      {children}
    </div>
  );
}
