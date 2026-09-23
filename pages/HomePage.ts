import { expect, type Page } from "@playwright/test";

export class HomePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto("/");
  }

  async expectLoaded() {
    await expect(this.page.getByRole("heading", { name: /banho premium/i })).toBeVisible();
  }

  async expectBookingButton() {
    await expect(this.page.getByRole("button", { name: /agende seu horario/i })).toBeVisible();
  }

  async openProducts() {
    await this.page.getByRole("button", { name: "Produtos" }).click();
  }

  async openTutorArea() {
    await this.page.getByRole("button", { name: "Área do Tutor" }).click();
  }
}
