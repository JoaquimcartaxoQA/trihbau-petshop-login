import { expect, type Page } from "@playwright/test";

export class MinhaAreaPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async expectLoaded(name: string) {
    await expect(this.page.getByRole("heading", { name: `Olá, ${name}!` })).toBeVisible();
  }

  async registerPet() {
    await this.page.getByLabel("Raça").fill("Beagle");
    await this.page.getByLabel("Nome").fill("Bento");
    await this.page.getByLabel("Idade (anos)").fill("4");
    await this.page.getByLabel("Peso (kg)").fill("12.5");
    await this.page.getByLabel("Telefone para contato").fill("85999999999");
    await this.page.getByRole("button", { name: "Cadastrar pet" }).click();
    await expect(this.page.getByText("Bento").first()).toBeVisible();
  }

  async expectWhatsAppBookingButtonDisabled(disabled: boolean) {
    const button = this.page.getByRole("button", { name: "Agendar pelo WhatsApp" });
    if (disabled) {
      await expect(button).toBeDisabled();
    } else {
      await expect(button).toBeEnabled();
    }
  }

  async expectWhatsAppBookingMessage(tutorName: string) {
    const [popup] = await Promise.all([
      this.page.waitForEvent("popup"),
      this.page.getByRole("button", { name: "Agendar pelo WhatsApp" }).click(),
    ]);
    const message = new URL(popup.url()).searchParams.get("text") ?? "";
    expect(message).toContain(`Nome do Tutor: ${tutorName}`);
    expect(message).toContain("Nome do Pet: Bento");
    expect(message).toContain("Raça do Pet: Beagle");
    expect(message).toContain("Data e hora do agendamento:");
    expect(message).toContain("Serviços: Tosa completa, Banho");
  }

  async openServiceSelection(date: string) {
    await this.page
      .getByRole("combobox", { name: "Pet" })
      .selectOption({ label: "Bento - Beagle" });
    await this.page.getByLabel("Data").fill(date);
    await this.page.locator("button.booking-slot:not(:disabled)").first().click();
    await expect(this.page.getByRole("dialog", { name: "Escolha os serviços" })).toBeVisible();
  }

  async expectBookingServices() {
    const dialog = this.page.getByRole("dialog", { name: "Escolha os serviços" });
    for (const service of [
      "Banho",
      "Tosa completa",
      "Tosa higiênica",
      "Limpeza de ouvidos",
      "Corte de unhas",
      "Hidratação premium",
    ]) {
      await expect(dialog.getByText(service, { exact: true })).toBeVisible();
    }
  }

  async selectServices() {
    const dialog = this.page.getByRole("dialog", { name: "Escolha os serviços" });
    await dialog.getByLabel("Tosa completa").check();
    await expect(dialog.getByLabel("Tosa higiênica")).toBeDisabled();
    await dialog.getByLabel("Banho").check();
    await dialog.getByRole("button", { name: "Usar serviços selecionados" }).click();
    await this.page.getByRole("button", { name: "Confirmar agendamento" }).click();
  }

  async expectAppointmentWithServices() {
    const appointment = this.page.locator(".appointment-item").filter({ hasText: "Bento" }).last();
    await expect(appointment).toContainText("Bento - Beagle");
    await expect(appointment).toContainText("Banho");
    await expect(appointment).toContainText("Tosa completa");
  }

  async logout() {
    await this.page.getByRole("button", { name: "Sair" }).click();
  }
}
