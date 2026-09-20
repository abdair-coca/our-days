import { ButtonLink } from "@/components/ui/button-link";

export default function InvitePage() {
  return (
    <section className="rounded-[2rem] border border-ink/8 bg-card p-6 text-center shadow-soft sm:p-8">
      <div
        aria-hidden="true"
        className="mx-auto grid size-16 place-items-center rounded-full bg-blush/12 font-serif text-3xl text-blush-dark"
      >
        ♥
      </div>
      <p className="mt-5 text-xs font-bold tracking-[0.16em] text-blush-dark uppercase">
        Invitación de demostración
      </p>
      <h1 className="mt-2 font-serif text-4xl font-semibold">Un lugar para dos</h1>
      <p className="mt-3 leading-7 text-muted">
        El flujo real de invitaciones aún no está conectado. Esta pantalla deja lista la ruta y el tono de la experiencia.
      </p>
      <ButtonLink className="mt-7 w-full" href="/">
        Explorar la demo
      </ButtonLink>
      <a
        className="mt-3 inline-flex min-h-11 items-center justify-center px-4 text-sm font-semibold text-muted hover:text-ink"
        href="/login"
      >
        Volver al acceso
      </a>
    </section>
  );
}
