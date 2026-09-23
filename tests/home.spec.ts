import { expect, test } from "../fixtures/test";

test("exibe a página inicial da TrihbAU", async ({ homePage }) => {
  await homePage.goto();
  await homePage.expectLoaded();
});

test("exibe o botão de agendamento", async ({ homePage }) => {
  await homePage.goto();
  await homePage.expectBookingButton();
});

test("redireciona para a página de produtos ao clicar em Produtos", async ({ homePage, page }) => {
  await homePage.goto();
  await homePage.openProducts();
  await expect(page).toHaveURL("http://localhost:5173/produtos");
  await expect(page.getByRole("heading", { name: "Cuidados para o seu pet." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Shampoo Premium" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Saco de Ração 20kg" })).toBeVisible();
  await expect(page.getByText("R$ 93,59")).toBeVisible();
  await expect(page.getByText("R$ 389,99")).toBeVisible();
});
