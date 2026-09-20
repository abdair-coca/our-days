export default function AppLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando contenido"
      className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="h-4 w-32 animate-pulse rounded-full bg-ink/10" />
      <div className="mt-4 h-12 w-3/4 max-w-xl animate-pulse rounded-2xl bg-ink/10" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div className="aspect-[4/3] animate-pulse rounded-3xl bg-ink/10" key={item} />
        ))}
      </div>
    </div>
  );
}
