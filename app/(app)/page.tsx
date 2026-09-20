import { MemoryCard } from "@/components/memory/memory-card";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { localMemoryCatalog } from "@/features/memories";
import { formatMemoryDate } from "@/lib/utils/format-memory-date";

export default async function HomePage() {
  const memories = await localMemoryCatalog.list();
  const [featured, ...recent] = memories;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Reveal>
        <section className="relative overflow-hidden rounded-[2rem] border border-ink/8 bg-card p-6 shadow-soft sm:p-10 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
          <div className="relative z-10">
            <p className="text-xs font-bold tracking-[0.2em] text-blush-dark uppercase">
              Nuestro álbum vivo
            </p>
            <h1 className="mt-3 max-w-xl text-balance font-serif text-5xl leading-[1.02] font-semibold sm:text-6xl">
              Los días pequeños también merecen quedarse.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-muted">
              Un espacio tranquilo para volver a las historias, las fotos y las canciones que son nuestras.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/memories/new">Guardar un recuerdo</ButtonLink>
              <ButtonLink href="/memories" variant="secondary">
                Ver la línea de tiempo
              </ButtonLink>
            </div>
          </div>

          {featured ? (
            <a
              className="group mt-8 block overflow-hidden rounded-3xl focus-visible:outline-offset-4 lg:mt-0"
              href={`/memories/${featured.id}`}
            >
              <div
                aria-label={featured.photos[0]?.alt}
                className="aspect-[4/3] rounded-3xl bg-cover bg-center transition duration-300 group-hover:scale-[1.015]"
                role="img"
                style={{ backgroundImage: featured.photos[0]?.gradient }}
              />
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-[0.14em] text-blush-dark uppercase">
                    Recuerdo destacado
                  </p>
                  <h2 className="mt-1 font-serif text-2xl font-semibold">
                    {featured.title}
                  </h2>
                </div>
                <time className="shrink-0 text-sm text-muted" dateTime={featured.memoryDate}>
                  {formatMemoryDate(featured.memoryDate)}
                </time>
              </div>
            </a>
          ) : null}
        </section>
      </Reveal>

      <section className="mt-12 sm:mt-16" aria-labelledby="recent-title">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-sage uppercase">
              Cerca en el tiempo
            </p>
            <h2 className="mt-1 font-serif text-3xl font-semibold" id="recent-title">
              Recuerdos recientes
            </h2>
          </div>
          <ButtonLink href="/memories" variant="quiet">
            Ver todos
          </ButtonLink>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recent.slice(0, 3).map((memory, index) => (
            <Reveal delay={index * 0.06} key={memory.id}>
              <MemoryCard memory={memory} />
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
