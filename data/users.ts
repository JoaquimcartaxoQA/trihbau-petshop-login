import { generateRandomEmail, generateRandomName } from "../útil/random";

export type TestUser = {
  name: string;
  email: string;
  password: string;
};

export function createTestUser(): TestUser {
  return {
    name: generateRandomName(),
    email: generateRandomEmail(),
    password: "Senha123",
  };
}