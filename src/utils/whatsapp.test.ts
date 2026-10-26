import { describe, expect, it } from "vitest";
import {
  createAppointmentWhatsAppUrl,
  createProductWhatsAppUrl,
  createWhatsAppUrl,
  WHATSAPP_NUMBER,
} from "./whatsapp";

function messageOf(url: string): string {
  return new URL(url).searchParams.get("text") ?? "";
}

describe("createWhatsAppUrl", () => {
  it("inclui o tutor e os pets na mensagem", () => {
    const url = createWhatsAppUrl("João", [{ name: "Luna", breed: "Golden Retriever" }]);
    expect(url).toContain(WHATSAPP_NUMBER);
    const message = messageOf(url);
    expect(message).toContain("Tutor: João");
    expect(message).toContain("Luna (Golden Retriever)");
  });

  it("informa quando o tutor não tem pets", () => {
    expect(messageOf(createWhatsAppUrl("Ana", []))).toContain("nenhum pet cadastrado");
  });
});

describe("createAppointmentWhatsAppUrl", () => {
  it("formata data, hora e serviços da reserva", () => {
    const url = createAppointmentWhatsAppUrl("João", {
      date: "2026-09-25",
      slotStart: "08:00",
      service: "Banho, Tosa completa",
      petName: "Bento",
      petBreed: "Beagle",
    });
    const message = messageOf(url);
    expect(message).toContain("Nome do Tutor: João");
    expect(message).toContain("Nome do Pet: Bento");
    expect(message).toContain("Raça do Pet: Beagle");
    expect(message).toContain("Data e hora do agendamento: 25/09/2026 às 08:00");
    expect(message).toContain("Serviços: Banho, Tosa completa");
  });
});

describe("createProductWhatsAppUrl", () => {
  it("inclui o produto e o preço em reais", () => {
    const message = messageOf(
      createProductWhatsAppUrl({ name: "Shampoo Premium", priceCents: 9359 }),
    );
    expect(message).toContain("Shampoo Premium");
    // O formato pt-BR do Intl usa espaço não separável após "R$".
    expect(message.replace(/[\u00a0\u202f]/g, " ")).toContain("R$ 93,59");
  });
});
