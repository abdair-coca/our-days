"use client";

import { useActionState } from "react";

import { authAction } from "@/features/auth/actions";
import { initialAuthActionState } from "@/features/auth/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LoginFormProps = {
  nextPath: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(
    authAction,
    initialAuthActionState,
  );

  return (
    <form action={formAction} className="mt-7 grid gap-5">
      <input name="next" type="hidden" value={nextPath} />
      <Input
        autoComplete="email"
        id="email"
        label="Correo"
        name="email"
        placeholder="tu@correo.com"
        required
        type="email"
      />
      <Input
        autoComplete="current-password"
        helpText="Usa al menos 8 caracteres al crear tu cuenta."
        id="password"
        label="Contraseña"
        minLength={8}
        name="password"
        required
        type="password"
      />
      <Input
        autoComplete="name"
        helpText="Solo se usa para identificarte dentro del espacio."
        id="displayName"
        label="Tu nombre (opcional)"
        name="displayName"
        placeholder="Alizon"
      />
      {state.error ? (
        <p className="text-sm font-semibold text-error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="text-sm text-success" role="status">
          {state.message}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          disabled={isPending}
          loading={isPending}
          name="intent"
          type="submit"
          value="signin"
        >
          Entrar
        </Button>
        <Button
          disabled={isPending}
          loading={isPending}
          name="intent"
          type="submit"
          value="signup"
          variant="secondary"
        >
          Crear cuenta
        </Button>
      </div>
      <Button
        className="w-full"
        disabled={isPending}
        formNoValidate
        loading={isPending}
        name="intent"
        type="submit"
        value="resend"
        variant="quiet"
      >
        Reenviar correo de confirmación
      </Button>
    </form>
  );
}
