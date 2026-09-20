import { ButtonLink } from "@/components/ui/button-link";

export default function LoginPage() {
  return (
    <section className="rounded-[2rem] border border-ink/8 bg-card p-6 shadow-soft sm:p-8">
      <p className="text-xs font-bold tracking-[0.16em] text-blush-dark uppercase">
        Acceso privado
      </p>
      <h1 className="mt-2 font-serif text-4xl font-semibold">Volver a nuestros días</h1>
      <p className="mt-3 leading-7 text-muted">
        La autenticación llegará en una fase posterior. Por ahora, entra directamente a la demostración local.
      </p>
      <ButtonLink className="mt-7 w-full" href="/">
        Entrar a la demo
      </ButtonLink>
      <p className="mt-5 text-center text-sm text-muted">
        ¿Tienes una invitación?{" "}
        <a className="font-semibold text-blush-dark underline-offset-4 hover:underline" href="/invite">
          Ver invitación
        </a>
      </p>
    </section>
  );
}
