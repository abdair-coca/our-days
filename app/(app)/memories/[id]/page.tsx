import Link from "next/link";
import { notFound } from "next/navigation";

import { MemoryGallery } from "@/components/gallery/memory-gallery";
import { DeleteMemoryButton } from "@/components/memory/delete-memory-button";
import { Reveal } from "@/components/motion/reveal";
import { SongCard } from "@/components/music/song-card";
import { ButtonLink } from "@/components/ui/button-link";
import { ArrowLeftIcon, EditIcon } from "@/components/ui/icons";
import { getMemoryCatalog } from "@/features/memories";
import { formatMemoryDate } from "@/lib/utils/format-memory-date";

type MemoryDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MemoryDetailPage({ params }: MemoryDetailPageProps) {
  const { id } = await params;
  const catalog = await getMemoryCatalog();
  const memory = await catalog.getById(id);

  if (!memory) {
    notFound();
  }

  const [cover, ...galleryPhotos] = memory.photos;

  return (
    <article className="container-editorial py-8 sm:py-12">
      <Link
        aria-label="Volver a recuerdos"
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-button)] px-3 text-accent-hover transition-[color,background-color,transform] duration-[var(--motion-fast)] hover:-translate-x-1 hover:bg-accent-soft/45"
        href="/memories"
        title="Volver a recuerdos"
      >
        <ArrowLeftIcon />
      </Link>

      {cover ? (
        <div className="-mx-4 mt-4 sm:mx-0 sm:mt-6">
          <MemoryGallery photos={[cover]} />
        </div>
      ) : (
        <div className="mt-6">
          <MemoryGallery
            emptyAction={
              <ButtonLink href={`/memories/${memory.id}/edit`} variant="secondary">
                <EditIcon />
                Añadir fotos
              </ButtonLink>
            }
            photos={[]}
          />
        </div>
      )}

      <Reveal>
        <header className="mt-8 grid gap-6 border-b border-border-soft pb-8 sm:mt-10 sm:pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <time
              className="text-xs font-bold tracking-[0.16em] text-olive uppercase"
              dateTime={memory.memoryDate}
            >
              {formatMemoryDate(memory.memoryDate)}
            </time>
            <h1 className="mt-2 max-w-4xl text-balance font-serif text-4xl leading-tight font-semibold sm:text-6xl">
              {memory.title}
            </h1>
            <p className="mt-3 text-sm text-text-soft">Guardado por {memory.createdBy}</p>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <ButtonLink href={`/memories/${memory.id}/edit`} variant="secondary">
              <EditIcon />
              <span className="sr-only">Editar recuerdo</span>
            </ButtonLink>
            <DeleteMemoryButton memoryId={memory.id} />
          </div>
        </header>
      </Reveal>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <section
          aria-labelledby="story-title"
          className="rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8"
        >
          <h2 className="font-serif text-2xl font-semibold" id="story-title">
            La historia
          </h2>
          <p className="mt-4 max-w-3xl whitespace-pre-line text-lg leading-8 text-text-soft">
            {memory.description}
          </p>
        </section>
        <SongCard song={memory.song} />
      </div>

      {galleryPhotos.length > 0 ? (
        <section aria-labelledby="gallery-title" className="mt-12 sm:mt-16">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-olive uppercase">
                Más momentos
              </p>
              <h2 className="mt-2 font-serif text-3xl font-semibold" id="gallery-title">
                La galería
              </h2>
            </div>
            <p className="text-sm text-text-soft">{galleryPhotos.length} fotos</p>
          </div>
          <MemoryGallery featured={false} photos={galleryPhotos} />
        </section>
      ) : null}
    </article>
  );
}
