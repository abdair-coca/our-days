import Link from "next/link";
import { notFound } from "next/navigation";

import { MemoryGallery } from "@/components/gallery/memory-gallery";
import { SongCard } from "@/components/music/song-card";
import { ButtonLink } from "@/components/ui/button-link";
import { localMemoryCatalog } from "@/features/memories";
import { formatMemoryDate } from "@/lib/utils/format-memory-date";

type MemoryDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MemoryDetailPage({ params }: MemoryDetailPageProps) {
  const { id } = await params;
  const memory = await localMemoryCatalog.getById(id);

  if (!memory) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="mb-8 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <Link
            className="inline-flex min-h-11 items-center rounded-full text-sm font-semibold text-blush-dark hover:underline"
            href="/memories"
          >
            Volver a recuerdos
          </Link>
          <time
            className="mt-3 block text-xs font-bold tracking-[0.16em] text-sage uppercase"
            dateTime={memory.memoryDate}
          >
            {formatMemoryDate(memory.memoryDate)}
          </time>
          <h1 className="mt-2 text-balance font-serif text-4xl leading-tight font-semibold sm:text-6xl">
            {memory.title}
          </h1>
          <p className="mt-3 text-sm text-muted">Guardado por {memory.createdBy}</p>
        </div>
        <ButtonLink href={`/memories/${memory.id}/edit`} variant="secondary">
          Editar recuerdo
        </ButtonLink>
      </header>

      <MemoryGallery photos={memory.photos} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section className="rounded-3xl bg-card p-6 shadow-sm sm:p-8" aria-labelledby="story-title">
          <h2 className="font-serif text-2xl font-semibold" id="story-title">
            La historia
          </h2>
          <p className="mt-4 max-w-3xl whitespace-pre-line text-lg leading-8 text-muted">
            {memory.description}
          </p>
        </section>
        <SongCard song={memory.song} />
      </div>
    </article>
  );
}
