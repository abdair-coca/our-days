import Link from "next/link";

/* Signed Supabase URLs are private and dynamic, so native loading is intentional. */
/* eslint-disable @next/next/no-img-element */

import { MemoryCard } from "@/components/memory/memory-card";
import { MemoryPresentationOverlay } from "@/components/memory/memory-presentation";
import { AnimatedHeadline, CountUp } from "@/components/motion/animated-headline";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/status-panel";
import { getMemoryCatalog } from "@/features/memories";
import { getMemoryPresentation } from "@/features/memories/presentation";
import { formatMemoryDate } from "@/lib/utils/format-memory-date";

export default async function HomePage() {
  const catalog = await getMemoryCatalog();
  const memories = await catalog.list();
  const presentation = await getMemoryPresentation(memories);
  const [featured, ...recent] = memories;
  const todayMemory = recent[0] ?? featured;
  const songCount = memories.reduce((total, memory) => total + memory.songs.length, 0);
  const firstYear = memories.reduce<string | null>(
    (oldest, memory) => {
      const year = memory.memoryDate.slice(0, 4);
      return !oldest || year < oldest ? year : oldest;
    },
    null,
  );

  return (
    <>
      {presentation ? <MemoryPresentationOverlay presentation={presentation} /> : null}
      <div className="container-app py-8 sm:py-12">
      <Reveal>
        <section
          aria-labelledby="home-title"
          className="relative overflow-hidden rounded-[var(--radius-modal)] border border-border-soft bg-surface p-6 shadow-[var(--shadow-card)] sm:p-10 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10"
        >
          <div className="relative z-10">
            <p className="text-xs font-bold tracking-[0.2em] text-accent-hover uppercase">
              Nuestro álbum vivo
            </p>
            <AnimatedHeadline
              className="mt-3 max-w-xl text-balance font-serif text-[2.6rem] leading-[1.04] font-semibold tracking-[-0.015em] sm:text-6xl"
              highlight="quedarse."
              id="home-title"
              text="Los días pequeños también merecen quedarse."
            />
            <p className="mt-5 max-w-lg text-lg leading-8 text-text-soft">
              Un espacio tranquilo para volver a las historias, las fotos y las canciones que son nuestras.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/memories/new">Guardar un recuerdo</ButtonLink>
              <ButtonLink href="/memories" variant="secondary">
                Ver la línea de tiempo
              </ButtonLink>
            </div>
            {memories.length > 0 ? (
              <dl className="mt-8 flex flex-wrap gap-x-7 gap-y-3 border-t border-border-soft pt-5">
                <div>
                  <dt className="text-[11px] font-bold tracking-[0.16em] text-text-soft uppercase">Recuerdos</dt>
                  <dd className="font-serif text-3xl font-semibold"><CountUp value={memories.length} /></dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold tracking-[0.16em] text-text-soft uppercase">Canciones</dt>
                  <dd className="font-serif text-3xl font-semibold"><CountUp value={songCount} /></dd>
                </div>
                {firstYear ? (
                  <div>
                    <dt className="text-[11px] font-bold tracking-[0.16em] text-text-soft uppercase">Desde</dt>
                    <dd className="font-serif text-3xl font-semibold tabular-nums">{firstYear}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
          </div>

          {featured ? (
            <Link
              className="group mt-10 block rounded-[6px] focus-visible:outline-offset-8 lg:mt-0"
              href={`/memories/${featured.id}`}
            >
              <div className="polaroid">
                <span aria-hidden="true" className="tape" />
                <div
                  aria-label={featured.photos[0]?.src ? undefined : featured.photos[0]?.alt}
                  className="aspect-[4/3] overflow-hidden rounded-[3px] bg-cover bg-center"
                  role={featured.photos[0]?.src ? undefined : "img"}
                  style={{
                    backgroundImage: featured.photos[0]?.src
                      ? undefined
                      : featured.photos[0]?.gradient,
                  }}
                >
                  {featured.photos[0]?.src ? (
                    <img
                      alt={featured.photos[0].alt}
                      className="size-full object-cover transition-transform duration-[var(--motion-emotional)] ease-[var(--ease-gentle)] group-hover:scale-[1.02] motion-reduce:transition-none"
                      decoding="async"
                      loading="eager"
                      src={featured.photos[0].src}
                    />
                  ) : null}
                </div>
                <div className="mt-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-1 px-1">
                  <div className="min-w-0">
                    <p className="text-xs font-bold tracking-[0.14em] text-accent-hover uppercase">
                      Recuerdo destacado
                    </p>
                    <h2 className="mt-1 font-serif text-2xl font-semibold">
                      {featured.title}
                    </h2>
                  </div>
                  <time
                    className="text-handwritten shrink-0 -rotate-2 text-2xl leading-none text-accent-hover"
                    dateTime={featured.memoryDate}
                  >
                    {formatMemoryDate(featured.memoryDate)}
                  </time>
                </div>
              </div>
            </Link>
          ) : (
            <EmptyState
              action={<ButtonLink href="/memories/new">Crear el primero</ButtonLink>}
              className="mt-8 lg:mt-0"
              title="El álbum empieza aquí"
            >
              Cuando guarden un recuerdo, aparecerá destacado en este espacio.
            </EmptyState>
          )}
        </section>
      </Reveal>

      <section className="mt-12 sm:mt-16" aria-labelledby="recent-title">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-olive uppercase">
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
        {recent.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recent.slice(0, 3).map((memory, index) => (
              <Reveal delay={index * 0.06} key={memory.id}>
                <MemoryCard memory={memory} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState
            action={<ButtonLink href="/memories/new">Guardar otro recuerdo</ButtonLink>}
            title={featured ? "Este álbum acaba de empezar" : "Todavía no hay recuerdos"}
          >
            {featured
              ? "El siguiente momento que guarden aparecerá aquí."
              : "Cuando quieran guardar uno, este será su lugar."}
          </EmptyState>
        )}
      </section>

      <Reveal delay={0.08}>
        <aside className="mt-12 grid gap-5 rounded-[var(--radius-card)] border border-accent-soft bg-surface-soft p-6 sm:mt-16 sm:grid-cols-[1fr_auto] sm:items-end sm:p-8">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-accent-hover uppercase">
              Una fecha para volver
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold">Hoy hace...</h2>
            <p className="mt-3 max-w-2xl leading-7 text-text-soft">
              Este espacio queda preparado para recuperar un día especial y volver a vivirlo juntos.
            </p>
          </div>
          {todayMemory ? (
            <ButtonLink href={`/memories/${todayMemory.id}`} variant="quiet">
              Volver a un recuerdo
            </ButtonLink>
          ) : (
            <ButtonLink href="/memories/new" variant="quiet">
              Crear una fecha
            </ButtonLink>
          )}
        </aside>
      </Reveal>
      </div>
    </>
  );
}
