import { test } from "../fixtures/test";

test("exibe a página inicial da TrihbAU", async ({ homePage }) => {
  await homePage.goto();
  await homePage.expectLoaded();
});

test("exibe o botão de agendamento", async ({ homePage }) => {
  await homePage.goto();
  await homePage.expectBookingButton();
});
