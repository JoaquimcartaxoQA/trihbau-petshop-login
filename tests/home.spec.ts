import { test } from "../fixtures/test";

test("exibe a página inicial da TrihbAU", async ({ homePage }) => {
  await homePage.goto();
  await homePage.expectLoaded();
});

test("permite agendar um horario pelo WhatsApp", async ({ homePage }) => {
  await homePage.goto();
  await homePage.expectBookingLink();
});