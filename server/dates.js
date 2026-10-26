// Converte uma Date para AAAA-MM-DD usando o fuso LOCAL.
// toISOString() retorna UTC, o que troca a data em madrugada no Brasil (UTC-3).
export function toLocalISO(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
