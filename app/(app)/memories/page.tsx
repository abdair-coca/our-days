import Link from "next/link";

import { MemoryGrid } from "@/components/memory/memory-grid";
import { PageShell } from "@/components/layout/page-shell";
import { ButtonLink } from "@/components/ui/button-link";
import { localMemoryCatalog } from "@/features/memories";
import { classNames } from "@/lib/utils/class-names";

type MemoriesPageProps = {
  searchParams: Promise<{ year?: string }>;
};

export default async function MemoriesPage({ searchParams }: MemoriesPageProps) {
  const [{ year }, memories, years] = await Promise.all([
    searchParams,
    localMemoryCatalog.list(),
    localMemoryCatalog.years(),
  ]);
  const selectedYear = year ? Number(year) : null;
  const visibleMemories = selectedYear
    ? memories.filter(
        (memory) => Number(memory.memoryDate.slice(0, 4)) === selectedYear,
      )
    : memories;

  return (
    <PageShell
      actions={<ButtonLink href="/memories/new">Nuevo recuerdo</ButtonLink>}
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
                "inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-semibold transition",
                selectedYear === null
                  ? "border-blush bg-blush text-white"
                  : "border-ink/15 bg-white/70 hover:border-blush/50",
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
                  "inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-semibold transition",
                  selectedYear === availableYear
                    ? "border-blush bg-blush text-white"
                    : "border-ink/15 bg-white/70 hover:border-blush/50",
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
