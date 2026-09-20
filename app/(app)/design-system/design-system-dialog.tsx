"use client";

import { useRef } from "react";

import { Button } from "@/components/ui/button";

export function DesignSystemDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function closeDialog() {
    dialogRef.current?.close();
  }

  return (
    <>
      <Button ref={triggerRef} onClick={() => dialogRef.current?.showModal()}>
        Abrir modal
      </Button>
      <dialog
        aria-describedby="dialog-description"
        aria-labelledby="dialog-title"
        className="inset-0 m-0 mt-auto max-h-[85dvh] w-full max-w-none overflow-y-auto rounded-t-[var(--radius-modal)] border border-[var(--border)] bg-[var(--surface)] p-0 text-[var(--text)] shadow-[var(--shadow-overlay)] backdrop:bg-[rgb(30_22_18_/_0.3)] md:m-auto md:max-w-lg md:rounded-[var(--radius-modal)]"
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            closeDialog();
          }
        }}
        onClose={() => triggerRef.current?.focus()}
        ref={dialogRef}
      >
        <div className="p-6 sm:p-8">
          <p className="text-xs font-bold tracking-[0.14em] text-[var(--accent)] uppercase">
            Un momento antes
          </p>
          <h3 className="mt-2 font-serif text-3xl leading-tight font-semibold" id="dialog-title">
            ¿Guardar este recuerdo?
          </h3>
          <p className="mt-3 text-base leading-7 text-[var(--text-soft)]" id="dialog-description">
            Las fotos y la historia quedarán juntas. Podrás editar todo después.
          </p>
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button onClick={closeDialog} variant="ghost">
              Seguir editando
            </Button>
            <Button onClick={closeDialog}>Guardar recuerdo</Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
