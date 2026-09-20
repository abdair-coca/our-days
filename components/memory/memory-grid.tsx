import { MemoryCard } from "@/components/memory/memory-card";
import { StatusPanel } from "@/components/ui/status-panel";
import type { Memory } from "@/types/memory";

type MemoryGridProps = {
  memories: readonly Memory[];
};

export function MemoryGrid({ memories }: MemoryGridProps) {
  if (memories.length === 0) {
    return (
      <StatusPanel title="Todavía no hay recuerdos aquí">
        Prueba otro año o crea el primer recuerdo de esta etapa.
      </StatusPanel>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {memories.map((memory, index) => (
        <MemoryCard key={memory.id} memory={memory} priority={index < 2} />
      ))}
    </div>
  );
}
