import { expect, type Page } from "@playwright/test";
import type { TestUser } from "../data/users";

export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async expectLoaded() {
    await expect(this.page.getByRole("heading", { name: "Área do Tutor" })).toBeVisible();
  }

  async login(user: TestUser) {
    await this.page.getByLabel("E-mail").fill(user.email);
    await this.page.getByLabel("Senha").fill(user.password);
    await this.page.getByRole("button", { name: "Entrar" }).click();
  }

  async openRegister() {
    await this.page.getByRole("button", { name: "Cadastre-se" }).click();
  }
}