"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <p className="text-xs font-bold tracking-[0.16em] text-red-700 uppercase">
        Algo salió mal
      </p>
      <h1 className="mt-3 font-serif text-4xl font-semibold">
        No pudimos abrir este momento.
      </h1>
      <p className="mt-4 text-muted">
        Puedes intentarlo otra vez. Tus datos de demostración siguen intactos.
      </p>
      <button
        className="mt-7 min-h-12 rounded-full bg-blush px-6 py-3 font-semibold text-white hover:bg-blush-dark"
        onClick={reset}
        type="button"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
