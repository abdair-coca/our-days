export default function AppLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando contenido"
      className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="h-4 w-32 skeleton rounded-full" />
      <div className="mt-4 h-12 w-3/4 max-w-xl skeleton rounded-2xl" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div className="aspect-[4/3] skeleton rounded-3xl" key={item} />
        ))}
      </div>
    </div>
  );
}
