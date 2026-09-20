import { notFound } from "next/navigation";

import { MemoryForm } from "@/components/forms/memory-form";
import { PageShell } from "@/components/layout/page-shell";
import { getMemoryCatalog } from "@/features/memories";

type EditMemoryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditMemoryPage({ params }: EditMemoryPageProps) {
  const { id } = await params;
  const catalog = await getMemoryCatalog();
  const memory = await catalog.getById(id);

  if (!memory) {
    notFound();
  }

  return (
    <PageShell
      eyebrow="Editar recuerdo"
      intro="Ajusta la historia, la fecha, las fotos o la canción cuando quieras."
      title={`Editar “${memory.title}”`}
    >
      <div className="max-w-5xl rounded-[var(--radius-modal)] border border-border-soft bg-surface p-5 shadow-[var(--shadow-card)] sm:p-8">
        <MemoryForm
          defaultValues={{
            title: memory.title,
            memoryDate: memory.memoryDate,
            description: memory.description,
            songTitle: memory.song?.title ?? "",
            songArtist: memory.song?.artist ?? "",
            songUrl: memory.song?.url ?? "",
          }}
          initialPhotos={memory.photos}
          memoryId={memory.id}
          mode="edit"
        />
      </div>
    </PageShell>
  );
}
