export function generateRandomEmail(): string {
  return `tutor-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;
}

export function generateRandomName(): string {
  return `Tutor ${Date.now()}`;
}