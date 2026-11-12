import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import App from './App';

vi.hoisted(() => {
  Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true,
    value: () => ({ matches: true, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }) });
});

const json = (data: unknown, status = 200) => Response.json(data, { status });
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }));
const fill = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

function mockApi(handler: (pathname: string, init: RequestInit) => Response | Promise<Response>) {
  vi.stubGlobal('fetch', vi.fn((url: string, init: RequestInit) => handler(new URL(url).pathname, init)));
}

beforeEach(() => {
  localStorage.clear();
  history.replaceState({}, '', '/');
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })));
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); localStorage.clear(); });

it('apresenta erro de login, aceita recuperação e encerra a sessão sem deixar credenciais locais', { timeout: 15000 }, async () => {
  let attempts = 0;
  mockApi(path => path.endsWith('/login')
    ? ++attempts === 1 ? json({ error: 'Credenciais inválidas.' }, 401) : json({ token: 'synthetic', name: 'QA' })
    : json([]));
  render(<App />);
  click('Área do Tutor');
  fill('E-mail', 'tutor@example.test'); fill('Senha', 'synthetic-password');
  click('Entrar');
  expect(await screen.findByText('Credenciais inválidas.')).toBeTruthy();
  click('Entrar');
  await screen.findByRole('heading', { name: /Olá, QA/ });
  expect(localStorage.getItem('token')).toBe('synthetic');
  click('Sair');
  expect(localStorage.getItem('token')).toBeNull();
  expect(localStorage.getItem('tutorName')).toBeNull();
  expect(screen.getByRole('button', { name: 'Área do Tutor' })).toBeEnabled();
});

it('mantém o cadastro disponível após erro e cria a sessão ao cadastrar', async () => {
  let attempts = 0;
  mockApi(path => path.endsWith('/register')
    ? ++attempts === 1 ? json({ error: 'E-mail já cadastrado.' }, 409) : json({ token: 'synthetic', name: 'QA' })
    : json([]));
  render(<App />);
  click('Área do Tutor');
  click('Cadastre-se');
  click('Entrar');
  expect(screen.getByRole('heading', { name: 'Área do Tutor' })).toBeTruthy();
  click('Cadastre-se');
  fill('Nome', 'QA'); fill('E-mail', 'tutor@example.test'); fill('Senha', 'synthetic-password');
  click('Cadastrar');
  await screen.findByText('E-mail já cadastrado.');
  click('Cadastrar');
  await screen.findByRole('heading', { name: /Olá, QA/ });
  expect(localStorage.getItem('tutorName')).toBe('QA');
});

it('exige login antes de abrir agendamento e tolera indisponibilidade do catálogo de pets', async () => {
  const open = vi.spyOn(window, 'open').mockReturnValue(null);
  mockApi(path => path.endsWith('/login') ? json({ token: 'synthetic', name: 'QA' }) : json({}, 503));
  render(<App />);
  fireEvent.click(screen.getAllByRole('button', { name: /agendar/i })[0]);
  expect(open).not.toHaveBeenCalled();
  fill('E-mail', 'tutor@example.test'); fill('Senha', 'synthetic-password'); click('Entrar');
  await waitFor(() => expect(open).toHaveBeenCalledOnce());
  expect(decodeURIComponent(String(open.mock.calls[0][0]))).toContain('QA');
});

it('restaura sessão persistida e abre o link da reserva mais recente', async () => {
  localStorage.setItem('token', 'synthetic');
  localStorage.setItem('tutorName', 'QA');
  const open = vi.spyOn(window, 'open').mockReturnValue(null);
  mockApi(path => json(path.endsWith('/pets')
    ? [{ id: 1, name: 'Luna', breed: 'Beagle', age: 4, weight: 12, contactPhone: '85999999999' }]
    : path.endsWith('/appointments') ? [{ id: 2, petId: 1, petName: 'Luna', petBreed: 'Beagle', date: '2030-01-07', slotStart: '08:00', service: 'Banho' }] : []));
  render(<App />);
  await screen.findByRole('button', { name: 'Editar agendamento de Luna' });
  click('Agendar pelo WhatsApp');
  expect(decodeURIComponent(String(open.mock.calls[0][0]))).toContain('Luna');
});

it('abre produtos, monta o link de compra e respeita a navegação por histórico', async () => {
  const open = vi.spyOn(window, 'open').mockReturnValue(null);
  mockApi(() => json([
    { id: 1, name: 'Shampoo QA', description: 'Produto de teste', priceCents: 9359, image: 'shampoo' },
    { id: 2, name: 'Guia QA', description: 'Produto de teste', priceCents: 1000, image: 'unknown' },
  ]));
  render(<App />);
  click('Abrir menu');
  fireEvent.click(screen.getAllByRole('button', { name: 'Produtos' }).at(-1)!);
  expect(location.pathname).toBe('/produtos');
  const product = (await screen.findByRole('heading', { name: 'Shampoo QA' })).closest('article')!;
  fireEvent.click(within(product).getByRole('button', { name: 'Comprar' }));
  expect(decodeURIComponent(String(open.mock.calls[0][0]))).toContain('Shampoo QA');
  click('Voltar');
  expect(location.pathname).toBe('/');
  act(() => { history.pushState({}, '', '/produtos'); dispatchEvent(new PopStateEvent('popstate')); });
  await screen.findByRole('heading', { name: 'Guia QA' });
});

it('exibe erro amigável quando o catálogo fica indisponível', async () => {
  history.replaceState({}, '', '/produtos');
  mockApi(() => new Response('unavailable', { status: 503 }));
  render(<App />);
  expect(await screen.findByText('Não foi possível carregar os produtos.')).toBeTruthy();
});
