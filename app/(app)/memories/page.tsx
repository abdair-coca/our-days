import { MemoryGrid } from "@/components/memory/memory-grid";
import { ClearMemorySearchLink, MemorySearch } from "@/components/memory/memory-search";
import { YearFilter } from "@/components/memory/year-filter";
import { PageShell } from "@/components/layout/page-shell";
import { ButtonLink } from "@/components/ui/button-link";
import { PlusIcon } from "@/components/ui/icons";
import { EmptyState } from "@/components/ui/status-panel";
import { getMemoryCatalog } from "@/features/memories";
import { readSearchQuery, searchMemories } from "@/features/memories/search";

type MemoriesPageProps = {
  searchParams: Promise<{ q?: string | string[]; year?: string }>;
};

export default async function MemoriesPage({ searchParams }: MemoriesPageProps) {
  const catalog = await getMemoryCatalog();
  const [{ q, year }, memories, years] = await Promise.all([
    searchParams,
    catalog.list(),
    catalog.years(),
  ]);
  const selectedYear = year ? Number(year) : null;
  const query = readSearchQuery(q);
  const visibleMemories = searchMemories(
    selectedYear
      ? memories.filter(
          (memory) => Number(memory.memoryDate.slice(0, 4)) === selectedYear,
        )
      : memories,
    query,
  );
  const clearSearchHref = selectedYear ? `/memories?year=${selectedYear}` : "/memories";

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
      <MemorySearch initialQuery={query} />
      <YearFilter query={query} selectedYear={selectedYear} years={years} />

      {query ? (
        <p aria-live="polite" className="-mt-3 mb-7 text-sm text-text-soft">
          {visibleMemories.length === 0
            ? "Sin resultados"
            : `${visibleMemories.length} ${visibleMemories.length === 1 ? "recuerdo" : "recuerdos"}`}{" "}
          para «<span className="font-semibold text-text">{query}</span>»
          {selectedYear ? ` en ${selectedYear}` : ""}
        </p>
      ) : null}

      {query && visibleMemories.length === 0 ? (
        <EmptyState
          action={<ClearMemorySearchLink href={clearSearchHref} />}
          title={`Nada coincide con «${query}»`}
        >
          Prueba con otra palabra: un lugar, una canción, un mes o quién lo guardó.
        </EmptyState>
      ) : (
        <MemoryGrid memories={visibleMemories} />
      )}
    </PageShell>
  );
}
