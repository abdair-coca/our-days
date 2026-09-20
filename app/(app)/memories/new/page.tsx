import { MemoryForm } from "@/components/forms/memory-form";
import { PageShell } from "@/components/layout/page-shell";

export default function NewMemoryPage() {
  return (
    <PageShell
      eyebrow="Nuevo recuerdo"
      intro="Guarda una fecha, una historia y las fotos que quieras volver a mirar."
      title="Guardar un recuerdo"
    >
      <div className="max-w-5xl rounded-[var(--radius-modal)] border border-border-soft bg-surface p-5 shadow-[var(--shadow-card)] sm:p-8">
        <MemoryForm mode="create" />
      </div>
    </PageShell>
  );
}
