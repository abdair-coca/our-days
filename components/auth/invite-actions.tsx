"use client";

import { useActionState, useState } from "react";

import {
  acceptInviteAction,
  createInviteAction,
} from "@/features/auth/actions";
import { initialAuthActionState } from "@/features/auth/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InviteAcceptForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(
    acceptInviteAction,
    initialAuthActionState,
  );

  return (
    <form action={formAction} className="mt-7 grid gap-4">
      <input name="token" type="hidden" value={token} />
      {state.error ? (
        <p className="text-sm font-semibold text-error" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button disabled={isPending} loading={isPending} type="submit">
        Unirme al espacio
      </Button>
    </form>
  );
}

export function InviteCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createInviteAction,
    initialAuthActionState,
  );
  const [copied, setCopied] = useState(false);

  async function copyInvite() {
    if (!state.inviteUrl) {
      return;
    }

    await navigator.clipboard.writeText(state.inviteUrl);
    setCopied(true);
  }

  return (
    <div>
      <form action={formAction} className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <Input
          autoComplete="email"
          helpText="Opcional. Si lo completas, solo ese correo podrá aceptar el enlace."
          id="invitedEmail"
          label="Correo de la otra persona"
          name="invitedEmail"
          placeholder="alguien@correo.com"
          type="email"
        />
        <Button disabled={isPending} loading={isPending} type="submit">
          Crear enlace
        </Button>
      </form>
      {state.error ? (
        <p className="mt-4 text-sm font-semibold text-error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.inviteUrl ? (
        <div className="mt-5 rounded-[var(--radius-card)] border border-success/30 bg-success/10 p-4">
          <p className="text-sm font-semibold text-text">{state.message}</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              aria-label="Enlace de invitación"
              className="min-h-11 min-w-0 flex-1 rounded-[var(--radius-input)] border border-border bg-surface px-3 text-sm text-text"
              readOnly
              value={state.inviteUrl}
            />
            <Button onClick={copyInvite} type="button" variant="secondary">
              {copied ? "Copiado" : "Copiar enlace"}
            </Button>
          </div>
          <p className="mt-3 text-xs leading-5 text-text-soft">
            Caduca en 7 días. El enlace no expone tus recuerdos hasta que la persona se una.
          </p>
        </div>
      ) : null}
    </div>
  );
}
