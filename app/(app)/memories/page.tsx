import Link from "next/link";

import { MemoryGrid } from "@/components/memory/memory-grid";
import { PageShell } from "@/components/layout/page-shell";
import { ButtonLink } from "@/components/ui/button-link";
import { PlusIcon } from "@/components/ui/icons";
import { getMemoryCatalog } from "@/features/memories";
import { classNames } from "@/lib/utils/class-names";

type MemoriesPageProps = {
  searchParams: Promise<{ year?: string }>;
};

export default async function MemoriesPage({ searchParams }: MemoriesPageProps) {
  const catalog = await getMemoryCatalog();
  const [{ year }, memories, years] = await Promise.all([
    searchParams,
    catalog.list(),
    catalog.years(),
  ]);
  const selectedYear = year ? Number(year) : null;
  const visibleMemories = selectedYear
    ? memories.filter(
        (memory) => Number(memory.memoryDate.slice(0, 4)) === selectedYear,
      )
    : memories;

  return (
    <PageShell
      actions={
        <ButtonLink
          aria-label="Nuevo recuerdo"
          className="px-3"
          href="/memories/new"
          title="Nuevo recuerdo"
        >
          <PlusIcon />
          <span className="sr-only">Nuevo recuerdo</span>
        </ButtonLink>
      }
      eyebrow="Línea de tiempo"
      intro="Un recorrido cronológico por lo que hemos ido guardando."
      title="Nuestros recuerdos"
    >
      <nav aria-label="Filtrar recuerdos por año" className="mb-7 overflow-x-auto pb-2">
        <ul className="flex min-w-max gap-2">
          <li>
            <Link
              aria-current={selectedYear === null ? "page" : undefined}
              className={classNames(
                "inline-flex min-h-11 items-center rounded-[var(--radius-button)] border px-4 py-2 text-sm font-semibold transition-[color,background-color,border-color,transform] duration-[var(--motion-fast)]",
                selectedYear === null
                  ? "border-accent bg-accent text-white"
                  : "border-border bg-surface hover:-translate-y-px hover:border-accent-soft hover:bg-surface-soft",
              )}
              href="/memories"
            >
              Todos
            </Link>
          </li>
          {years.map((availableYear) => (
            <li key={availableYear}>
              <Link
                aria-current={selectedYear === availableYear ? "page" : undefined}
                className={classNames(
                    "inline-flex min-h-11 items-center rounded-[var(--radius-button)] border px-4 py-2 text-sm font-semibold transition-[color,background-color,border-color,transform] duration-[var(--motion-fast)]",
                    selectedYear === availableYear
                      ? "border-accent bg-accent text-white"
                      : "border-border bg-surface hover:-translate-y-px hover:border-accent-soft hover:bg-surface-soft",
                  )}
                href={`/memories?year=${availableYear}`}
              >
                {availableYear}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <MemoryGrid memories={visibleMemories} />
    </PageShell>
  );
}
