import type { CSSProperties, ReactNode } from "react";

import { Reveal } from "@/components/motion/reveal";
import { SongCard } from "@/components/music/song-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  OfflineState,
  SuccessState,
} from "@/components/ui/status-panel";
import { Textarea } from "@/components/ui/textarea";
import { demoGradients } from "@/lib/images/demo-art";

import { DesignSystemDialog } from "./design-system-dialog";

export const metadata = {
  title: "Design System",
  description: "Referencia interna del sistema visual de Our Days.",
};

const colors = [
  ["bg", "#F7F1E8"],
  ["surface", "#FFFDF9"],
  ["surface-soft", "#F2E8DD"],
  ["text", "#2B211D"],
  ["text-soft", "#6F625C"],
  ["text-muted", "#9A8C84"],
  ["accent", "#9E4B3D"],
  ["accent-hover", "#873F34"],
  ["accent-soft", "#E7C8BE"],
  ["rose-paper", "#D9AAA0"],
  ["terracotta", "#B86552"],
  ["sand", "#D8C5AE"],
  ["olive", "#798069"],
  ["border", "#DFD4C9"],
  ["border-soft", "#EAE2DA"],
  ["success", "#64735D"],
  ["warning", "#B48248"],
  ["error", "#A8463D"],
] as const;

function Section({
  children,
  description,
  id,
  title,
}: {
  children: ReactNode;
  description?: string;
  id: string;
  title: string;
}) {
  return (
    <section aria-labelledby={id} className="border-t border-[var(--border)] py-12 sm:py-16">
      <div className="mb-8 max-w-2xl">
        <p className="text-xs font-bold tracking-[0.16em] text-[var(--accent)] uppercase">Referencia</p>
        <h2 className="mt-2 font-serif text-3xl leading-tight font-semibold sm:text-4xl" id={id}>
          {title}
        </h2>
        {description ? <p className="mt-3 text-base leading-7 text-[var(--text-soft)]">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function PhotoCard({ compact = false }: { compact?: boolean }) {
  return (
    <article className="group overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
      <div
        aria-label="Atardecer junto al mar, muestra visual temporal"
        className={compact ? "aspect-[4/5] bg-cover bg-center" : "aspect-[4/5] bg-cover bg-center sm:aspect-[3/4]"}
        role="img"
        style={{ backgroundImage: demoGradients.sunset }}
      />
      <div className={compact ? "p-4" : "p-5"}>
        <time className="text-xs font-bold tracking-[0.14em] text-[var(--accent)] uppercase" dateTime="2026-08-17">
          17 de agosto
        </time>
        <h3 className="mt-2 font-serif text-2xl leading-tight font-semibold">La tarde que se quedó</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">Una canción, luz tibia y tiempo sin prisa.</p>
      </div>
    </article>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="container-app pb-24 pt-10 sm:pt-16">
      <Reveal>
        <header className="grid gap-8 pb-12 sm:pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.7fr)] lg:items-end">
          <div className="max-w-3xl">
            <Badge tone="accent">Fase 1 · referencia interna</Badge>
            <h1 className="mt-5 text-balance font-serif text-5xl leading-[1.05] font-semibold sm:text-6xl lg:text-7xl">
              Editorial Living Scrapbook
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text-soft)]">
              Sistema cálido, íntimo y silencioso. Fotografía primero; interfaz al servicio del recuerdo.
            </p>
          </div>
          <blockquote className="border-l-2 border-[var(--rose-paper)] pl-5 text-handwritten text-3xl leading-tight text-[var(--accent)] sm:text-4xl">
            Un lugar que vale la pena conservar.
          </blockquote>
        </header>
      </Reveal>

      <Section description="Paleta exacta, superficies cálidas y profundidad sutil. Accent reservado para acciones y selección." id="tokens" title="Tokens visuales">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {colors.map(([name, value]) => (
            <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" key={name}>
              <div className="h-24 border-b border-[var(--border-soft)]" style={{ backgroundColor: `var(--${name})` }} />
              <div className="p-3">
                <p className="text-sm font-semibold">{name}</p>
                <p className="mt-1 font-mono text-xs text-[var(--text-soft)]">{value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card><p className="text-xs font-bold tracking-[0.12em] text-[var(--text-soft)] uppercase">Radio card · 18px</p><div className="mt-5 h-20 rounded-[var(--radius-card)] bg-[var(--surface-soft)]" /></Card>
          <Card><p className="text-xs font-bold tracking-[0.12em] text-[var(--text-soft)] uppercase">Sombra card</p><div className="mt-5 h-20 rounded-[var(--radius-card)] bg-[var(--surface)] shadow-[var(--shadow-card)]" /></Card>
          <Card><p className="text-xs font-bold tracking-[0.12em] text-[var(--text-soft)] uppercase">Spacing · base 4px</p><div className="mt-5 flex items-end gap-2">{[4, 8, 16, 24, 32].map((size) => <span className="block w-6 bg-[var(--sand)]" key={size} style={{ height: size }} title={`${size}px`} />)}</div></Card>
        </div>
      </Section>

      <Section description="Editorial para emoción, UI para claridad, manuscrita solo como detalle humano." id="type" title="Tipografía">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <Card padding="spacious">
            <p className="text-xs font-bold tracking-[0.14em] text-[var(--accent)] uppercase">Editorial</p>
            <p className="mt-3 font-serif text-5xl leading-[1.08] font-semibold sm:text-6xl">Los días pequeños también cuentan.</p>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--text-soft)]">Inter, Manrope o fallback local sostienen lectura, navegación y formularios con ritmo sereno.</p>
          </Card>
          <Card padding="spacious" tone="soft">
            <p className="text-handwritten text-4xl leading-tight text-[var(--accent)]">Hoy hizo luz de verano.</p>
            <div className="mt-8 space-y-3 text-[var(--text-soft)]">
              <p className="text-lg">Body Large · 18px</p><p>Body · 16px</p><p className="text-sm">Body Small · 14px</p><p className="text-xs uppercase tracking-widest">Caption · 12px</p>
            </div>
          </Card>
        </div>
      </Section>

      <Section description="Una acción principal por contexto. Todos los targets mantienen al menos 44px." id="actions" title="Botones y badges">
        <Card padding="spacious">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Guardar recuerdo</Button><Button variant="secondary">Añadir fotos</Button><Button variant="ghost">Editar</Button><Button loading>Guardando…</Button><Button disabled>Desactivado</Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            <Badge>Privado</Badge><Badge tone="accent">Destacado</Badge><Badge tone="success">Guardado</Badge><Badge tone="warning">Sin conexión</Badge><Badge tone="error">Revisar</Badge>
          </div>
        </Card>
      </Section>

      <Section description="Label siempre visible; ayuda, error y carga comunicados con texto además de color." id="forms" title="Inputs y textarea">
        <Card className="max-w-3xl" padding="spacious">
          <div className="grid gap-6 sm:grid-cols-2">
            <Input helpText="Algo breve que los lleve de vuelta." label="Título" placeholder="Una tarde tranquila" />
            <Input defaultValue="17/08/2026" label="Fecha elegida" />
            <Input error="Escribe un título antes de guardar." label="Con error" />
            <Input disabled label="Desactivado" value="No se puede editar" readOnly />
            <Input label="Preparando opciones" loading value="Buscando…" readOnly />
            <Textarea className="sm:col-span-2" containerClassName="sm:col-span-2" helpText="Máximo visual cómodo: texto largo en columna estrecha." label="La historia" placeholder="¿Qué quieren recordar de este día?" />
          </div>
        </Card>
      </Section>

      <Section description="Fotografía amplia, metadata mínima y música secundaria al recuerdo." id="cards" title="Cards y fotografía">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[1fr_1fr_0.85fr] lg:items-start">
          <PhotoCard />
          <Card padding="none" className="overflow-hidden">
            <div aria-label="Paisaje costero, muestra visual temporal" className="aspect-[16/10] bg-cover bg-center" role="img" style={{ backgroundImage: demoGradients.coast }} />
            <div className="p-6"><Badge tone="accent">Recuerdo destacado</Badge><h3 className="mt-4 font-serif text-3xl leading-tight font-semibold">Kilómetros de costa</h3><p className="mt-3 leading-7 text-[var(--text-soft)]">Composición horizontal para desktop, con contenido breve y aire editorial.</p></div>
          </Card>
          <SongCard song={{ artist: "Silvana Estrada", title: "Te guardo", url: "https://example.com" }} />
        </div>
      </Section>

      <Section description="Bottom navigation compacta en móvil; rail editorial en desktop. Demostración, no shell de producto." id="navigation" title="Navegación responsive">
        <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
          <Card padding="compact">
            <p className="mb-4 text-xs font-bold tracking-[0.14em] text-[var(--text-soft)] uppercase">Mobile · 390px</p>
            <nav aria-label="Ejemplo de navegación móvil" className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[var(--shadow-floating)]">
              <ul className="grid grid-cols-4 gap-1 text-center text-xs font-semibold"><li><a className="flex min-h-11 items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] px-2 text-white" href="#navigation">Inicio</a></li><li><a className="flex min-h-11 items-center justify-center rounded-[var(--radius-button)] px-2" href="#cards">Recuerdos</a></li><li><a className="flex min-h-11 items-center justify-center rounded-[var(--radius-button)] px-2" href="#forms">Crear</a></li><li><a className="flex min-h-11 items-center justify-center rounded-[var(--radius-button)] px-2" href="#states">Perfil</a></li></ul>
            </nav>
          </Card>
          <Card padding="compact">
            <p className="mb-4 text-xs font-bold tracking-[0.14em] text-[var(--text-soft)] uppercase">Desktop · rail</p>
            <nav aria-label="Ejemplo de navegación desktop" className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4"><span className="font-serif text-2xl font-semibold">Our Days</span><ul className="flex flex-wrap gap-2 text-sm font-semibold"><li><a className="flex min-h-11 items-center rounded-[var(--radius-button)] bg-[var(--accent-soft)] px-4 text-[var(--accent)]" href="#navigation">Inicio</a></li><li><a className="flex min-h-11 items-center rounded-[var(--radius-button)] px-4" href="#cards">Recuerdos</a></li><li><a className="flex min-h-11 items-center rounded-[var(--radius-button)] px-4" href="#forms">Crear</a></li></ul></nav>
          </Card>
        </div>
      </Section>

      <Section description="Bottom sheet en móvil, modal centrado desde tablet. Escape cierra; foco vuelve al trigger." id="modal" title="Modal y sheet accesible">
        <Card className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between" padding="spacious">
          <div><h3 className="font-serif text-2xl font-semibold">Confirmación breve</h3><p className="mt-1 text-[var(--text-soft)]">Backdrop cálido, sin blur fuerte, dos acciones.</p></div><DesignSystemDialog />
        </Card>
      </Section>

      <Section description="Cada resultado explica qué pasó y ofrece salida útil. Skeleton conserva geometría." id="states" title="Estados del sistema">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <LoadingState />
          <EmptyState action={<Button variant="secondary">Crear recuerdo</Button>} />
          <ErrorState action={<Button variant="secondary">Intentar de nuevo</Button>} />
          <SuccessState />
          <OfflineState action={<Button variant="secondary">Reintentar</Button>} />
          <Card aria-busy="true" padding="none" className="overflow-hidden"><div className="aspect-[4/3] animate-pulse bg-[var(--surface-soft)] motion-reduce:animate-none" /><div className="space-y-3 p-5"><div className="h-3 w-24 animate-pulse rounded-full bg-[var(--border)] motion-reduce:animate-none" /><div className="h-6 w-3/4 animate-pulse rounded-full bg-[var(--border)] motion-reduce:animate-none" /></div><span className="sr-only">Cargando tarjeta de recuerdo</span></Card>
        </div>
      </Section>

      <Section description="Mismo lenguaje, distinta composición: prioridad táctil en móvil; aire y relación imagen-texto en desktop." id="responsive" title="Mobile y desktop">
        <div className="grid gap-8 lg:grid-cols-[20rem_1fr] lg:items-start">
          <div className="mx-auto w-full max-w-[390px] rounded-[2rem] border-8 border-[var(--text)] bg-[var(--bg)] p-3 shadow-[var(--shadow-overlay)]"><div className="mb-3 flex items-center justify-between px-1 text-xs font-semibold"><span>9:41</span><span>Our Days</span></div><PhotoCard compact /></div>
          <Card padding="spacious" className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"><div aria-label="Lago al atardecer, muestra visual temporal" className="aspect-[4/5] rounded-[var(--radius-card)] bg-cover bg-center lg:aspect-[4/3]" role="img" style={{ backgroundImage: demoGradients.lake } as CSSProperties} /><div><Badge tone="accent">Desktop editorial</Badge><h3 className="mt-4 font-serif text-4xl leading-tight font-semibold sm:text-5xl">Más aire. La misma cercanía.</h3><p className="mt-4 max-w-md text-lg leading-8 text-[var(--text-soft)]">La fotografía crece; el texto conserva ancho legible. La acción permanece clara sin dominar.</p><Button className="mt-6">Abrir recuerdo</Button></div></Card>
        </div>
      </Section>
    </main>
  );
}
