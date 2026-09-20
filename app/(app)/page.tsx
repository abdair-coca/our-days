import Link from "next/link";

import { MemoryCard } from "@/components/memory/memory-card";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/status-panel";
import { localMemoryCatalog } from "@/features/memories";
import { formatMemoryDate } from "@/lib/utils/format-memory-date";

export default async function HomePage() {
  const memories = await localMemoryCatalog.list();
  const [featured, ...recent] = memories;
  const todayMemory = recent[0] ?? featured;

  return (
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
            <h1
              className="mt-3 max-w-xl text-balance font-serif text-5xl leading-[1.02] font-semibold sm:text-6xl"
              id="home-title"
            >
              Los días pequeños también merecen quedarse.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-text-soft">
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
            <Link
              className="group mt-8 block overflow-hidden rounded-[var(--radius-card)] focus-visible:outline-offset-4 lg:mt-0"
              href={`/memories/${featured.id}`}
            >
              <div
                aria-label={featured.photos[0]?.alt}
                className="aspect-[4/3] rounded-[var(--radius-card)] bg-cover bg-center transition duration-[var(--motion-normal)] group-hover:scale-[1.015]"
                role="img"
                style={{ backgroundImage: featured.photos[0]?.gradient }}
              />
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-[0.14em] text-accent-hover uppercase">
                    Recuerdo destacado
                  </p>
                  <h2 className="mt-1 font-serif text-2xl font-semibold">
                    {featured.title}
                  </h2>
                </div>
                <time className="shrink-0 text-sm text-text-soft" dateTime={featured.memoryDate}>
                  {formatMemoryDate(featured.memoryDate)}
                </time>
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
  );
}
