import { expect, test } from '@playwright/test';

const password = 'senha-segura-123';

test.describe('Login do tutor', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'Área do Tutor' }).click();
    });

    test('abre o formulário de login', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Área do Tutor' })).toBeVisible();
        await expect(page.getByLabel('E-mail')).toBeVisible();
        await expect(page.getByLabel('Senha')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
    });

    test('exibe erro ao informar credenciais inválidas', async ({ page }) => {
        await page.getByLabel('E-mail').fill('nao-existe@example.com');
        await page.getByLabel('Senha').fill(password);
        await page.getByRole('button', { name: 'Entrar' }).click();

        await expect(page.getByText('Credenciais inválidas.')).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Área do Tutor' })).toBeVisible();
    });

    test('permite entrar com credenciais válidas', async ({ page, request }) => {
        const name = 'Tutor Playwright';
        const email = `tutor-${Date.now()}@example.com`;
        const registerResponse = await request.post('http://localhost:3001/api/auth/register', {
            data: { name, email, password },
        });

        expect(registerResponse.ok()).toBeTruthy();

        await page.getByLabel('E-mail').fill(email);
        await page.getByLabel('Senha').fill(password);
        await page.getByRole('button', { name: 'Entrar' }).click();

        await expect(page.getByRole('heading', { name: `Olá, ${name}!` })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Sair' })).toBeVisible();
        await expect(page).toHaveURL('/');
    });
});