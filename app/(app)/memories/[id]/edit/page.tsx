import { notFound } from "next/navigation";

import { MemoryForm } from "@/components/forms/memory-form";
import { PageShell } from "@/components/layout/page-shell";
import { localMemoryCatalog } from "@/features/memories";

type EditMemoryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditMemoryPage({ params }: EditMemoryPageProps) {
  const { id } = await params;
  const memory = await localMemoryCatalog.getById(id);

  if (!memory) {
    notFound();
  }

  return (
    <PageShell
      eyebrow="Modo demostración"
      intro="Los campos parten de los datos locales. Validar cambios no modifica el catálogo."
      title={`Editar “${memory.title}”`}
    >
      <div className="max-w-3xl rounded-[2rem] border border-ink/8 bg-card p-5 shadow-soft sm:p-8">
        <MemoryForm
          defaultValues={{
            title: memory.title,
            memoryDate: memory.memoryDate,
            description: memory.description,
            songTitle: memory.song?.title ?? "",
            songArtist: memory.song?.artist ?? "",
            songUrl: memory.song?.url ?? "",
          }}
          mode="edit"
        />
      </div>
    </PageShell>
  );
}
