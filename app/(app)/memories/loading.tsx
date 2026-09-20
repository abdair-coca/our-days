export default function MemoriesLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando recuerdos"
      className="container-editorial py-8 sm:py-12"
    >
      <div className="h-4 w-32 animate-pulse rounded-full bg-ink/10 motion-reduce:animate-none" />
      <div className="mt-4 h-12 w-3/4 max-w-xl animate-pulse rounded-2xl bg-ink/10 motion-reduce:animate-none" />
      <div className="mt-10 h-11 w-52 animate-pulse rounded-[var(--radius-button)] bg-ink/10 motion-reduce:animate-none" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            className="aspect-[4/3] animate-pulse rounded-[var(--radius-card)] bg-ink/10 motion-reduce:animate-none"
            key={item}
          />
        ))}
      </div>
    </div>
  );
}
