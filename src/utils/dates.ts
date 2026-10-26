// Converte uma Date para AAAA-MM-DD usando o fuso LOCAL.
// toISOString() retorna UTC, o que troca a data em madrugada no Brasil (UTC-3).
export function toLocalISO(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Próximo dia útil (segunda a sexta) a partir da data informada.
// Se a data já for um dia útil, ela mesma é retornada.
export function nextWeekdayISO(from: Date = new Date()): string {
  const date = new Date(from);
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }
  return toLocalISO(date);
}
