import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { MusicPlayerProvider } from "@/components/music/music-player";
import "@/styles/globals.css";

export const metadata: Metadata = {
  applicationName: "Our Days",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Our Days",
  },
  title: {
    default: "Our Days",
    template: "%s · Our Days",
  },
  description: "Un álbum privado para guardar nuestros días juntos.",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f7f1e8",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <MusicPlayerProvider>{children}</MusicPlayerProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
