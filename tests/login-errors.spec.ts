import { expect, test } from '../fixtures/test';

test('mantém o formulário aberto ao rejeitar credenciais inválidas', async ({ page, homePage, loginPage }) => {
  await homePage.goto();
  await homePage.openTutorArea();
  await loginPage.expectLoaded();
  await page.getByLabel('E-mail').fill('unknown-tutor@example.test');
  await page.getByLabel('Senha').fill('invalid-password');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByText('Credenciais inválidas.', { exact: true })).toBeVisible();
  await loginPage.expectLoaded();
});
