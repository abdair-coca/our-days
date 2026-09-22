"use client";

import { useState } from "react";

import { MemoryPresentationOverlay } from "@/components/memory/memory-presentation";
import { PlayIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import type { MemoryPresentation } from "@/features/memories/presentation";

type MemoryPresentationLauncherProps = {
  presentation: MemoryPresentation;
};

export function MemoryPresentationLauncher({
  presentation,
}: MemoryPresentationLauncherProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <Button
        className="w-full sm:w-auto"
        onClick={() => setIsOpen(true)}
        variant="secondary"
      >
        <PlayIcon aria-hidden="true" size={17} />
        Repetir historias
      </Button>
      {isOpen ? (
        <MemoryPresentationOverlay
          onClose={() => setIsOpen(false)}
          presentation={presentation}
        />
      ) : null}
    </>
  );
}
