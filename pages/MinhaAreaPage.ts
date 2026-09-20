import { expect, type Page } from "@playwright/test";

export class MinhaAreaPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async expectLoaded(name: string) {
    await expect(this.page.getByRole("heading", { name: `Olá, ${name}!` })).toBeVisible();
  }

  async logout() {
    await this.page.getByRole("button", { name: "Sair" }).click();
  }
}