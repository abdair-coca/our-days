"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { deleteMemoryAction } from "@/features/memories/mutations";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@/components/ui/icons";

type DeleteMemoryButtonProps = {
  memoryId: string;
};

export function DeleteMemoryButton({ memoryId }: DeleteMemoryButtonProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm("¿Eliminar este recuerdo? Esta acción no se puede deshacer.")) {
      return;
    }

    setIsDeleting(true);
    setMessage("");
    const result = await deleteMemoryAction(memoryId);

    if (result.ok && result.mode === "supabase") {
      router.push("/memories");
      router.refresh();
      return;
    }

    setIsDeleting(false);
    setMessage(result.message);
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        aria-label="Eliminar recuerdo"
        className="p-3 text-error"
        disabled={isDeleting}
        loading={isDeleting}
        onClick={handleDelete}
        title="Eliminar recuerdo"
        variant="quiet"
      >
        <TrashIcon />
      </Button>
      {message ? (
        <p aria-live="polite" className="max-w-56 text-right text-xs text-text-soft">
          {message}
        </p>
      ) : null}
    </div>
  );
}
