import { LoginForm } from "@/components/auth/login-form";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const rawNext = params.next;
  const nextPath = Array.isArray(rawNext) ? rawNext[0] : rawNext;
  const safeNextPath =
    nextPath?.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/";

  return (
    <section className="rounded-[2rem] border border-ink/8 bg-card p-6 shadow-soft sm:p-8">
      <p className="text-xs font-bold tracking-[0.16em] text-blush-dark uppercase">
        Acceso privado
      </p>
      <h1 className="mt-2 font-serif text-4xl font-semibold">Volver a nuestros días</h1>
      <p className="mt-3 leading-7 text-muted">
        Entra para ver el espacio compartido y guardar nuevos recuerdos.
      </p>
      <LoginForm nextPath={safeNextPath} />
      <p className="mt-5 text-center text-sm text-muted">
        ¿Tienes una invitación?{" "}
        <a className="font-semibold text-blush-dark underline-offset-4 hover:underline" href="/invite">
          Abre tu enlace
        </a>
      </p>
    </section>
  );
}
