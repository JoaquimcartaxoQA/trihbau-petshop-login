import { expect, type Page } from "@playwright/test";
import type { TestUser } from "../data/users";

export class RegisterPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async expectLoaded() {
    await expect(this.page.getByRole("heading", { name: "Criar conta" })).toBeVisible();
  }

  async register(user: TestUser) {
    await this.page.getByLabel("Nome").fill(user.name);
    await this.page.getByLabel("E-mail").fill(user.email);
    await this.page.getByLabel("Senha").fill(user.password);
    await this.page.getByRole("button", { name: "Cadastrar" }).click();
  }

  async openLogin() {
    await this.page.getByRole("button", { name: "Entrar" }).click();
  }
}