const memoryDateFormatter = new Intl.DateTimeFormat("es-BO", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatMemoryDate(value: string): string {
  return memoryDateFormatter.format(new Date(`${value}T12:00:00Z`));
}
