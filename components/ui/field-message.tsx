type FieldMessageProps = {
  id: string;
  message?: string;
};

export function FieldMessage({ id, message }: FieldMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      className="text-sm font-semibold text-[var(--error)]"
      id={id}
      role="alert"
    >
      <span aria-hidden="true">Error: </span>
      <span className="sr-only">Error: </span>
      {message}
    </p>
  );
}
