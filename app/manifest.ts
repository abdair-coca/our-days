import type { MetadataRoute } from "next";

const paper = "#f7f1e8";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: paper,
    description: "Un álbum privado para guardar nuestros días juntos.",
    display: "standalone",
    icons: [
      {
        purpose: "any",
        sizes: "any",
        src: "/icon.svg",
        type: "image/svg+xml",
      },
      {
        purpose: "maskable",
        sizes: "any",
        src: "/icon.svg",
        type: "image/svg+xml",
      },
      {
        purpose: "any",
        sizes: "180x180",
        src: "/apple-icon",
        type: "image/png",
      },
    ],
    name: "Our Days — álbum privado",
    orientation: "portrait",
    short_name: "Our Days",
    start_url: "/",
    theme_color: paper,
  };
}
