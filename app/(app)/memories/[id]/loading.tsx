export default function MemoryLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando recuerdo"
      className="container-editorial py-8 sm:py-12"
    >
      <div className="h-11 w-11 animate-pulse rounded-[var(--radius-button)] bg-ink/10 motion-reduce:animate-none" />
      <div className="mt-6 aspect-[4/3] animate-pulse rounded-[var(--radius-card)] bg-ink/10 motion-reduce:animate-none sm:aspect-[16/9]" />
      <div className="mt-8 h-4 w-36 animate-pulse rounded-full bg-ink/10 motion-reduce:animate-none" />
      <div className="mt-3 h-14 w-4/5 max-w-3xl animate-pulse rounded-2xl bg-ink/10 motion-reduce:animate-none" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="h-48 animate-pulse rounded-[var(--radius-card)] bg-ink/10 motion-reduce:animate-none" />
        <div className="h-48 animate-pulse rounded-[var(--radius-card)] bg-ink/10 motion-reduce:animate-none" />
      </div>
    </div>
  );
}
