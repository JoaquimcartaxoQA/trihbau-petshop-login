import { afterEach, expect, it, vi } from 'vitest';
import { apiGet, apiSend } from './api';

afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); });

it('injeta token persistido e trata uma resposta vazia como sucesso sem corpo', async () => {
  localStorage.setItem('token', 'synthetic-token');
  const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
  vi.stubGlobal('fetch', fetch);
  await expect(apiSend('DELETE', '/api/auth/pets/5', undefined, 'delete failed')).resolves.toBeNull();
  expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/api\/auth\/pets\/5$/),
    { method: 'DELETE', headers: { Authorization: 'Bearer synthetic-token' }, body: undefined });
});

it('permite chamada pública sem expor o token armazenado', async () => {
  localStorage.setItem('token', 'synthetic-token');
  const fetch = vi.fn().mockResolvedValue(Response.json({ name: 'QA' }));
  vi.stubGlobal('fetch', fetch);
  await expect(apiSend('POST', '/api/auth/login', { email: 'qa@example.test' }, 'login failed', null)).resolves.toEqual({ name: 'QA' });
  expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/api\/auth\/login$/),
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"email":"qa@example.test"}' });
});

it.each([
  ['', 'fallback'],
  ['null', 'fallback'],
  ['{"error":123}', 'fallback'],
  ['not JSON', 'fallback'],
  ['{"error":"Não autorizado"}', 'Não autorizado'],
])('preserva status e interpreta a resposta de erro %s', async (body, message) => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(body, { status: 401 })));
  await expect(apiGet('/api/auth/pets', 'fallback')).rejects.toMatchObject({ status: 401, message });
});

it('transforma falha de transporte em erro de conexão consistente', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
  await expect(apiGet('/api/auth/pets', 'fallback')).rejects.toMatchObject({ status: 0, message: 'Não foi possível conectar ao servidor.' });
});
