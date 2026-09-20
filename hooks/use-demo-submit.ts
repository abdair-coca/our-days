"use client";

import { useState } from "react";

type DemoSubmitState = "idle" | "submitting" | "success";

export function useDemoSubmit() {
  const [state, setState] = useState<DemoSubmitState>("idle");

  async function submit() {
    setState("submitting");
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    setState("success");
  }

  function reset() {
    setState("idle");
  }

  return { state, submit, reset };
}
