import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Our Days",
    template: "%s · Our Days",
  },
  description: "Un álbum privado para guardar nuestros días juntos.",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#fffaf4",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
