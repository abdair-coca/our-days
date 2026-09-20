import Link from "next/link";

import { InviteAcceptForm } from "@/components/auth/invite-actions";
import { ButtonLink } from "@/components/ui/button-link";
import { getAuthContext } from "@/features/auth/auth-context";
import { getInvitePreview } from "@/features/auth/invite-query";

type InvitePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function InvitePage({ searchParams }: InvitePageProps) {
  const params = (await searchParams) ?? {};
  const rawToken = params.token;
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;
  const [preview, authContext] = token
    ? await Promise.all([getInvitePreview(token), getAuthContext()])
    : [null, null];

  if (!token || !preview) {
    return (
      <section className="rounded-[2rem] border border-ink/8 bg-card p-6 text-center shadow-soft sm:p-8">
        <div
          aria-hidden="true"
          className="mx-auto grid size-16 place-items-center rounded-full bg-blush/12 font-serif text-3xl text-blush-dark"
        >
          ♥
        </div>
        <p className="mt-5 text-xs font-bold tracking-[0.16em] text-blush-dark uppercase">
          Enlace de invitación
        </p>
        <h1 className="mt-2 font-serif text-4xl font-semibold">Un lugar para dos</h1>
        <p className="mt-3 leading-7 text-muted">
          Necesitas abrir el enlace completo que te compartieron para entrar al espacio.
        </p>
        <ButtonLink className="mt-7 w-full" href="/login">
          Ir al acceso
        </ButtonLink>
      </section>
    );
  }

  const loginHref = `/login?next=${encodeURIComponent(`/invite?token=${token}`)}`;

  return (
    <section className="rounded-[2rem] border border-ink/8 bg-card p-6 text-center shadow-soft sm:p-8">
      <div
        aria-hidden="true"
        className="mx-auto grid size-16 place-items-center rounded-full bg-blush/12 font-serif text-3xl text-blush-dark"
      >
        ♥
      </div>
      <p className="mt-5 text-xs font-bold tracking-[0.16em] text-blush-dark uppercase">
        Invitación privada
      </p>
      <h1 className="mt-2 font-serif text-4xl font-semibold">Te invitaron a {preview.spaceName}</h1>
      <p className="mt-3 leading-7 text-muted">
        Comparte recuerdos, fotos y canciones dentro de un espacio que solo pueden ver sus miembros.
      </p>
      <p className="mt-5 text-sm text-muted">
        {preview.invitedEmail
          ? `Enlace preparado para ${preview.invitedEmail}.`
          : "Este enlace puede aceptarlo la cuenta con la que quieras compartir el espacio."}
      </p>
      {preview.isValid ? (
        authContext ? (
          <InviteAcceptForm token={token} />
        ) : (
          <ButtonLink className="mt-7 w-full" href={loginHref}>
            Entrar para aceptar
          </ButtonLink>
        )
      ) : (
        <p className="mt-7 rounded-[var(--radius-card)] bg-warning/10 p-4 text-sm font-semibold text-warning">
          Esta invitación ya no es válida o ha caducado.
        </p>
      )}
      <Link
        className="mt-3 inline-flex min-h-11 items-center justify-center px-4 text-sm font-semibold text-muted hover:text-ink"
        href="/login"
      >
        Volver al acceso
      </Link>
    </section>
  );
}
