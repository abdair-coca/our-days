import { MemoryForm } from "@/components/forms/memory-form";
import { PageShell } from "@/components/layout/page-shell";

export default function NewMemoryPage() {
  return (
    <PageShell
      eyebrow="Modo demostración"
      intro="Prueba la estructura y validación del formulario. Las fotos y los datos permanecen solo en este navegador durante la interacción."
      title="Guardar un recuerdo"
    >
      <div className="max-w-3xl rounded-[2rem] border border-ink/8 bg-card p-5 shadow-soft sm:p-8">
        <MemoryForm mode="create" />
      </div>
    </PageShell>
  );
}
