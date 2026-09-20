import { PageShell } from "@/components/layout/page-shell";
import { demoSession } from "@/features/auth/demo-session";

export default function SettingsPage() {
  return (
    <PageShell
      eyebrow="Preferencias"
      intro="Vista base de la configuración futura del espacio compartido."
      title="Ajustes"
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-3xl border border-ink/8 bg-card p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold">Espacio</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4 border-b border-ink/8 pb-4">
              <dt className="text-muted">Nombre</dt>
              <dd className="font-semibold">{demoSession.spaceName}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted">Personas</dt>
              <dd className="text-right font-semibold">
                {demoSession.people.join(" y ")}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-3xl border border-ink/8 bg-card p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold">Conexión</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Datos locales activos. Supabase, autenticación y almacenamiento aún no están conectados.
          </p>
          <span className="mt-5 inline-flex rounded-full bg-sage/15 px-3 py-1.5 text-xs font-bold tracking-wide text-sage uppercase">
            Demo local
          </span>
        </section>
      </div>
    </PageShell>
  );
}
