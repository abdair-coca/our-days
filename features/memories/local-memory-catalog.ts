import type { MemoryCatalog } from "@/features/memories/catalog";
import { demoGradients } from "@/lib/images/demo-art";
import type { Memory } from "@/types/memory";

const memories = [
  {
    id: "sunset-train",
    title: "El tren de vuelta",
    description:
      "Volvimos sin prisa, viendo cómo el cielo cambiaba de color detrás de la ventana. Guardamos este día por la conversación, las risas y esa calma que solo aparece cuando estamos juntos.",
    memoryDate: "2026-08-16",
    createdBy: "Alizon",
    photos: [
      {
        id: "train-window",
        alt: "Ilustración abstracta de un atardecer visto desde un tren",
        gradient: demoGradients.train,
      },
      {
        id: "train-sunset",
        alt: "Ilustración abstracta de un cielo cálido al atardecer",
        gradient: demoGradients.sunset,
      },
    ],
    song: {
      title: "Nuestra canción de regreso",
      artist: "Lista compartida",
      url: "https://music.youtube.com/",
    },
  },
  {
    id: "quiet-lake",
    title: "Una mañana junto al lago",
    description:
      "Café caliente, aire frío y agua quieta. No hacía falta llenar el silencio: el paseo ya decía todo.",
    memoryDate: "2026-05-03",
    createdBy: "Abdair",
    photos: [
      {
        id: "lake-morning",
        alt: "Ilustración abstracta de un lago verde azulado",
        gradient: demoGradients.lake,
      },
      {
        id: "lake-coast",
        alt: "Ilustración abstracta de una orilla clara y agua azul",
        gradient: demoGradients.coast,
      },
    ],
    song: null,
  },
  {
    id: "market-flowers",
    title: "Flores del mercado",
    description:
      "Elegimos las más imperfectas. Terminaron alegrando la mesa toda la semana y ahora también viven aquí.",
    memoryDate: "2025-11-22",
    createdBy: "Alizon",
    photos: [
      {
        id: "market-bouquet",
        alt: "Ilustración abstracta de flores claras sobre hojas verdes",
        gradient: demoGradients.flowers,
      },
    ],
    song: {
      title: "Domingo lento",
      artist: "Lista compartida",
      url: "https://open.spotify.com/",
    },
  },
  {
    id: "first-stargazing",
    title: "La noche de las estrellas",
    description:
      "Nos quedamos despiertos mucho más de lo planeado. Una noche pequeña que todavía se siente inmensa.",
    memoryDate: "2024-07-14",
    createdBy: "Abdair",
    photos: [
      {
        id: "starry-night",
        alt: "Ilustración abstracta de una luna sobre un cielo nocturno",
        gradient: demoGradients.night,
      },
    ],
    song: null,
  },
] satisfies readonly Memory[];

export const localMemoryCatalog: MemoryCatalog = {
  async list() {
    return memories;
  },
  async getById(id) {
    return memories.find((memory) => memory.id === id) ?? null;
  },
  async years() {
    return [...new Set(memories.map((memory) => Number(memory.memoryDate.slice(0, 4))))].sort(
      (left, right) => right - left,
    );
  },
};
