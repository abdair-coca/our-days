import { MemoryCard } from "@/components/memory/memory-card";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/status-panel";
import type { Memory } from "@/types/memory";

type MemoryGridProps = {
  memories: readonly Memory[];
};

export function MemoryGrid({ memories }: MemoryGridProps) {
  if (memories.length === 0) {
    return (
      <EmptyState action={<ButtonLink href="/memories/new">Crear recuerdo</ButtonLink>}>
        Prueba otro año o crea el primer recuerdo de esta etapa.
      </EmptyState>
    );
  }

  const groupedMemories = groupMemoriesByYearAndMonth(memories);

  return (
    <div className="grid gap-12">
      {groupedMemories.map((yearGroup) => (
        <section aria-labelledby={`year-${yearGroup.year}`} key={yearGroup.year}>
          <div className="flex items-baseline justify-between gap-4 border-b border-border-soft pb-3">
            <h2 className="font-serif text-3xl font-semibold" id={`year-${yearGroup.year}`}>
              {yearGroup.year}
            </h2>
            <p className="text-sm text-text-soft">
              {yearGroup.memories.length} {yearGroup.memories.length === 1 ? "recuerdo" : "recuerdos"}
            </p>
          </div>

          <div className="mt-8 grid gap-10">
            {yearGroup.months.map((monthGroup) => (
              <section
                aria-labelledby={`month-${yearGroup.year}-${monthGroup.month}`}
                key={monthGroup.month}
              >
                <h3
                  className="text-sm font-bold tracking-[0.16em] text-olive uppercase"
                  id={`month-${yearGroup.year}-${monthGroup.month}`}
                >
                  {monthGroup.label}
                </h3>
                <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {monthGroup.memories.map((memory, index) => (
                    <MemoryCard
                      key={memory.id}
                      memory={memory}
                      priority={yearGroup.year === groupedMemories[0]?.year && index < 2}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

type MemoryMonthGroup = {
  label: string;
  memories: Memory[];
  month: string;
};

type MemoryYearGroup = {
  memories: Memory[];
  months: MemoryMonthGroup[];
  year: string;
};

function groupMemoriesByYearAndMonth(memories: readonly Memory[]): MemoryYearGroup[] {
  const sortedMemories = [...memories].sort((left, right) =>
    right.memoryDate.localeCompare(left.memoryDate),
  );
  const yearMap = new Map<string, Map<string, Memory[]>>();

  for (const memory of sortedMemories) {
    const [year, month] = memory.memoryDate.split("-");
    const monthMap = yearMap.get(year) ?? new Map<string, Memory[]>();

    if (!monthMap.has(month)) {
      monthMap.set(month, []);
    }

    monthMap.get(month)?.push(memory);
    yearMap.set(year, monthMap);
  }

  const monthFormatter = new Intl.DateTimeFormat("es-BO", {
    month: "long",
    timeZone: "UTC",
  });

  return [...yearMap.entries()].map(([year, monthMap]) => {
    const months = [...monthMap.entries()].map(([month, grouped]) => ({
      label: monthFormatter.format(new Date(`${year}-${month}-01T12:00:00Z`)),
      memories: grouped,
      month,
    }));

    return {
      memories: months.flatMap((monthGroup) => monthGroup.memories),
      months,
      year,
    };
  });
}
