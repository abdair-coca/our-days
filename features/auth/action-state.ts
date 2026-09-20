export type AuthActionState = {
  error: string;
  inviteUrl?: string;
  message: string;
  ok: boolean;
};

export const initialAuthActionState: AuthActionState = {
  error: "",
  message: "",
  ok: false,
};
