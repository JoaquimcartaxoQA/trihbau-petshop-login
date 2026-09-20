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

  async expectBookingLink() {
    await expect(this.page.getByRole("link", { name: /agende seu horario/i })).toHaveAttribute(
      "href",
      "https://wa.me/5585997339952?text=Ola%2C%20quero%20agendar%20um%20horario%20na%20TrihbAU",
    );
  }

  async openTutorArea() {
    await this.page.getByRole("button", { name: "Área do Tutor" }).click();
  }
}