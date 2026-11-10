export default function MemoryLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando recuerdo"
      className="container-editorial py-8 sm:py-12"
    >
      <div className="h-11 w-11 skeleton rounded-[var(--radius-button)]" />
      <div className="mt-6 aspect-[4/3] skeleton rounded-[var(--radius-card)] sm:aspect-[16/9]" />
      <div className="mt-8 h-4 w-36 skeleton rounded-full" />
      <div className="mt-3 h-14 w-4/5 max-w-3xl skeleton rounded-2xl" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="h-48 skeleton rounded-[var(--radius-card)]" />
        <div className="h-48 skeleton rounded-[var(--radius-card)]" />
      </div>
    </div>
  );
}
