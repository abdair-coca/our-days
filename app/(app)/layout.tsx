import type { ReactNode } from "react";

import { AppFrame } from "@/components/layout/app-frame";

export default function PrivateDemoLayout({ children }: { children: ReactNode }) {
  return <AppFrame>{children}</AppFrame>;
}
