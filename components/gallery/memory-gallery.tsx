import { StatusPanel } from "@/components/ui/status-panel";
import type { MemoryPhoto } from "@/types/memory";

type MemoryGalleryProps = {
  photos: readonly MemoryPhoto[];
  state?: "loaded" | "loading" | "error";
};

export function MemoryGallery({
  photos,
  state = "loaded",
}: MemoryGalleryProps) {
  if (state === "loading") {
    return (
      <div aria-busy="true" aria-label="Cargando galería" className="grid gap-4 sm:grid-cols-2">
        <div className="aspect-[4/3] animate-pulse rounded-3xl bg-ink/10 sm:col-span-2" />
        <div className="aspect-[4/3] animate-pulse rounded-3xl bg-ink/10" />
      </div>
    );
  }

  if (state === "error") {
    return (
      <StatusPanel title="No pudimos mostrar las imágenes" tone="error">
        Intenta cargar esta página de nuevo.
      </StatusPanel>
    );
  }

  if (photos.length === 0) {
    return (
      <StatusPanel title="Este recuerdo todavía no tiene fotos">
        Puedes añadirlas cuando la carga de imágenes esté conectada.
      </StatusPanel>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {photos.map((photo, index) => (
        <div
          aria-label={photo.alt}
          className={
            index === 0
              ? "aspect-[4/3] rounded-3xl bg-cover bg-center shadow-soft sm:col-span-2 sm:aspect-[16/9]"
              : "aspect-[4/3] rounded-3xl bg-cover bg-center shadow-sm"
          }
          key={photo.id}
          role="img"
          style={{ backgroundImage: photo.gradient }}
        />
      ))}
    </div>
  );
}
