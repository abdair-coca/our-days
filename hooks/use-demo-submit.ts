"use client";

import { useState } from "react";

export type DemoSubmitResult = {
  message: string;
  memoryId?: string;
  mode?: "demo" | "supabase";
  ok: boolean;
};

type DemoSubmitState = "idle" | "submitting" | "success" | "error";
type SubmitTask = () => Promise<DemoSubmitResult>;

export function useDemoSubmit() {
  const [state, setState] = useState<DemoSubmitState>("idle");
  const [message, setMessage] = useState("");

  async function submit(task?: SubmitTask): Promise<DemoSubmitResult> {
    setState("submitting");

    try {
      const result = task
        ? await task()
        : await new Promise<DemoSubmitResult>((resolve) =>
            window.setTimeout(
              () => resolve({ message: "Validación completa.", ok: true }),
              450,
            ),
          );

      setMessage(result.message);
      setState(result.ok ? "success" : "error");
      return result;
    } catch {
      const result = {
        message: "No pudimos completar la acción. Inténtalo de nuevo.",
        ok: false,
      };
      setMessage(result.message);
      setState("error");
      return result;
    }
  }

  function reset() {
    setState("idle");
    setMessage("");
  }

  return { message, reset, state, submit };
}
