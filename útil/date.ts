export function formatDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("pt-BR").format(date);
}