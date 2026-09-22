import { MemoryPresentationLauncher } from "@/components/memory/memory-presentation-launcher";
import { PageShell } from "@/components/layout/page-shell";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/status-panel";
import { getMemoryCatalog } from "@/features/memories";
import { getReplayPresentation } from "@/features/memories/presentation";

export default async function PresentationsPage() {
  const catalog = await getMemoryCatalog();
  const memories = await catalog.list();
  const presentation = await getReplayPresentation(memories);

  return (
    <PageShell
      actions={
        presentation ? (
          <MemoryPresentationLauncher presentation={presentation} />
        ) : undefined
      }
      eyebrow="Historias"
      intro="Vuelvan a recorrer sus recuerdos, sin cambiar el estado de lo que ya vieron."
      title="Un paseo por sus días."
    >
      {presentation ? (
        <section className="rounded-[var(--radius-card)] border border-border-soft bg-surface-soft p-6 sm:p-8">
          <p className="text-xs font-bold tracking-[0.16em] text-accent-hover uppercase">
            Presentación guardada
          </p>
          <h2 className="mt-2 font-serif text-3xl font-semibold">
            {memories.length} {memories.length === 1 ? "recuerdo" : "recuerdos"} para volver a mirar.
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-text-soft">
            Esta historia queda disponible desde aquí cada vez que quieran repetirla.
          </p>
        </section>
      ) : (
        <EmptyState
          action={<ButtonLink href="/memories/new">Guardar un recuerdo</ButtonLink>}
          title="Todavía no hay una historia para repetir"
        >
          Cuando guarden su primer recuerdo, podrán volver a recorrerlo desde aquí.
        </EmptyState>
      )}
    </PageShell>
  );
}
