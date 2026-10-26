// Mensagens e URLs de WhatsApp da TrihbAU em um único lugar.
export const WHATSAPP_NUMBER = "5585997339952";
export const WHATSAPP_MESSAGE = "Ola, quero agendar um horario na TrihbAU";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export interface BookingPet {
  name: string;
  breed: string;
}

export interface BookingAppointment {
  date: string;
  slotStart: string;
  service: string;
  petName: string;
  petBreed: string;
}

function buildUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function createWhatsAppUrl(tutorName: string, pets: BookingPet[]): string {
  const petsMessage =
    pets.length > 0
      ? pets.map((pet) => `${pet.name} (${pet.breed})`).join(", ")
      : "nenhum pet cadastrado";
  return buildUrl(`${WHATSAPP_MESSAGE}. Tutor: ${tutorName}. Pets: ${petsMessage}.`);
}

export function createAppointmentWhatsAppUrl(
  tutorName: string,
  appointment: BookingAppointment,
): string {
  const message = [
    `Nome do Tutor: ${tutorName}`,
    `Nome do Pet: ${appointment.petName}`,
    `Raça do Pet: ${appointment.petBreed}`,
    `Data e hora do agendamento: ${appointment.date.split("-").reverse().join("/")} às ${appointment.slotStart}`,
    `Serviços: ${appointment.service}`,
  ].join("\n");
  return buildUrl(message);
}

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function createProductWhatsAppUrl(product: { name: string; priceCents: number }): string {
  const price = money.format(product.priceCents / 100);
  return buildUrl(`Ola, quero comprar ${product.name} (${price}) na TrihbAU.`);
}
