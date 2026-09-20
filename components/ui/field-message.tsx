type FieldMessageProps = {
  id: string;
  message?: string;
};

export function FieldMessage({ id, message }: FieldMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-2 text-sm font-medium text-red-700" id={id} role="alert">
      {message}
    </p>
  );
}
