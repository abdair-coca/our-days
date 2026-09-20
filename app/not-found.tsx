import { ButtonLink } from "@/components/ui/button-link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-12 text-center">
      <div className="max-w-lg">
        <p className="text-xs font-bold tracking-[0.18em] text-blush-dark uppercase">404</p>
        <h1 className="mt-3 font-serif text-5xl font-semibold">Este recuerdo no está aquí.</h1>
        <p className="mt-4 text-lg leading-7 text-muted">
          Puede que el enlace esté incompleto o que este momento todavía no exista en el catálogo local.
        </p>
        <ButtonLink className="mt-7" href="/memories">
          Volver a recuerdos
        </ButtonLink>
      </div>
    </main>
  );
}
