import { MemoryGrid } from "@/components/memory/memory-grid";
import { YearFilter } from "@/components/memory/year-filter";
import { PageShell } from "@/components/layout/page-shell";
import { ButtonLink } from "@/components/ui/button-link";
import { PlusIcon } from "@/components/ui/icons";
import { getMemoryCatalog } from "@/features/memories";

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
      <YearFilter selectedYear={selectedYear} years={years} />

      <MemoryGrid memories={visibleMemories} />
    </PageShell>
  );
}
