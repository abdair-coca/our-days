export default function MemoriesLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando recuerdos"
      className="container-editorial py-8 sm:py-12"
    >
      <div className="h-4 w-32 skeleton rounded-full" />
      <div className="mt-4 h-12 w-3/4 max-w-xl skeleton rounded-2xl" />
      <div className="mt-10 h-11 w-52 skeleton rounded-[var(--radius-button)]" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            className="aspect-[4/3] skeleton rounded-[var(--radius-card)]"
            key={item}
          />
        ))}
      </div>
    </div>
  );
}
