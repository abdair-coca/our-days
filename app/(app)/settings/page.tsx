import { InviteCreateForm } from "@/components/auth/invite-actions";
import { SpaceMembersPanel } from "@/components/auth/space-members-panel";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { getAuthContext } from "@/features/auth/auth-context";
import { signOutAction } from "@/features/auth/actions";
import { getSpaceMembers } from "@/features/auth/space-members";
import { demoSession } from "@/features/auth/demo-session";
import type { SpaceMember } from "@/features/auth/space-members";

export default async function SettingsPage() {
  const authContext = await getAuthContext();

  if (!authContext) {
    return (
      <PageShell
        eyebrow="Preferencias"
        intro="La conexión privada aparecerá aquí cuando Supabase esté configurado."
        title="Ajustes"
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-3xl border border-ink/8 bg-card p-6 shadow-sm">
            <h2 className="font-serif text-2xl font-semibold">Espacio de demostración</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4 border-b border-ink/8 pb-4">
                <dt className="text-muted">Nombre</dt>
                <dd className="font-semibold">{demoSession.spaceName}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Personas</dt>
                <dd className="text-right font-semibold">{demoSession.people.join(" y ")}</dd>
              </div>
            </dl>
          </section>
          <section className="rounded-3xl border border-ink/8 bg-card p-6 shadow-sm">
            <h2 className="font-serif text-2xl font-semibold">Conexión</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Este entorno todavía está usando datos locales.
            </p>
            <span className="mt-5 inline-flex rounded-full bg-sage/15 px-3 py-1.5 text-xs font-bold tracking-wide text-sage uppercase">
              Demo local
            </span>
          </section>
        </div>
      </PageShell>
    );
  }

  let members: SpaceMember[] = [];
  let membersError = "";

  try {
    members = await getSpaceMembers();
  } catch {
    membersError = "No pudimos cargar las personas del espacio. Inténtalo de nuevo.";
  }

  return (
    <PageShell
      eyebrow="Preferencias"
      intro="Administra el espacio y decide quién puede entrar."
      title="Ajustes"
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-3xl border border-ink/8 bg-card p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold">Espacio</h2>
          <dl className="mt-5 space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4 border-b border-ink/8 pb-4">
                <dt className="text-muted">Nombre</dt>
                <dd className="font-semibold">{authContext.space.name}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Tu cuenta</dt>
                <dd className="text-right font-semibold">{authContext.profileName}</dd>
              </div>
            </dl>
        </section>

        <section className="rounded-3xl border border-ink/8 bg-card p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold">Invitar</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Crea un enlace privado para que la otra persona se una a este espacio.
          </p>
          <div className="mt-5">
            <InviteCreateForm />
          </div>
        </section>

        <SpaceMembersPanel
          canManage={authContext.role === "owner"}
          currentUserId={authContext.user.id}
          initialError={membersError}
          initialMembers={members}
        />

        <section className="rounded-3xl border border-ink/8 bg-card p-6 shadow-sm lg:col-span-2">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-serif text-2xl font-semibold">Sesión</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Cuenta activa: {authContext.user.email ?? authContext.profileName}
              </p>
            </div>
            <form action={signOutAction}>
              <Button type="submit" variant="secondary">
                Cerrar sesión
              </Button>
            </form>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
