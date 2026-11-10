import type { Metadata, Viewport } from "next";
import { Caveat, Fraunces, Inter } from "next/font/google";
import type { ReactNode } from "react";

import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { MusicPlayerProvider } from "@/components/music/music-player";
import "@/styles/globals.css";

/* Self-hosted at build time: no request reaches Google from the browser. */
const fraunces = Fraunces({
  axes: ["opsz", "SOFT"],
  display: "swap",
  subsets: ["latin"],
  variable: "--font-fraunces",
});
const inter = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-inter",
});
const caveat = Caveat({
  display: "swap",
  preload: false,
  subsets: ["latin"],
  variable: "--font-caveat",
});

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
    <html className={`${fraunces.variable} ${inter.variable} ${caveat.variable}`} lang="es">
      <body>
        <MusicPlayerProvider>{children}</MusicPlayerProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
