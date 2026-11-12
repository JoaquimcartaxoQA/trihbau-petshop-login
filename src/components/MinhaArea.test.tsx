import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, expect, it, vi } from 'vitest';
import MinhaArea from './MinhaArea';

const pet = { id: 1, name: 'Luna', breed: 'Beagle', age: 4, weight: 12, contactPhone: '85999999999' };
const second = { ...pet, id: 2, name: 'Bento' };
const appointment = { id: 10, petId: 1, petName: 'Luna', petBreed: 'Beagle', date: '2030-01-07', slotStart: '08:00', service: 'Banho' };
const slots = [{ start: '08:00', capacity: 2, booked: 1, available: 1 }, { start: '09:30', capacity: 2, booked: 2, available: 0 }];
const json = (body: unknown, status = 200) => Response.json(body, { status });
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }));
const fill = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label, { exact: true }), { target: { value } });

function mount(reply: (path: string, method: string, body: unknown) => Response) {
  const fetch = vi.fn(async (url: string, init: RequestInit) => {
    const parsed = new URL(url);
    expect(new Headers(init.headers).get('Authorization')).toBe('Bearer synthetic');
    return reply(parsed.pathname + parsed.search, init.method ?? 'GET', init.body ? JSON.parse(String(init.body)) : undefined);
  });
  vi.stubGlobal('fetch', fetch);
  const onSchedule = vi.fn();
  const onLogout = vi.fn();
  render(<MinhaArea name="QA" token="synthetic" onSchedule={onSchedule} onLogout={onLogout} />);
  return { fetch, onSchedule, onLogout };
}

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it('exibe estados vazios, desabilita WhatsApp e elimina horários no fim de semana', async () => {
  mount(path => json(path.includes('availability') ? slots : []));
  await screen.findByText('Nenhum pet cadastrado ainda.');
  expect(screen.getByText('Nenhum agendamento encontrado.')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Agendar pelo WhatsApp' })).toBeDisabled();
  await screen.findByRole('button', { name: /08:00/ });
  fill('Data', '2030-01-05');
  expect(await screen.findByText('Escolha um dia útil para ver as vagas.')).toBeTruthy();
});

it('cadastra, edita e exclui pets, respeitando o cancelamento da confirmação', { timeout: 15000 }, async () => {
  const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValue(true);
  const { fetch, onLogout } = mount((path, method, body) => {
    if (path.includes('availability')) return json(slots);
    if (method === 'POST') { expect(body).toEqual({ breed: 'Beagle', name: 'Bento', age: 4, weight: 12, contactPhone: '85999999999' }); return json(second, 201); }
    if (method === 'PUT') { expect(path).toBe('/api/auth/pets/1'); return json({ ...pet, name: 'Lua' }); }
    if (method === 'DELETE') return new Response(null, { status: 204 });
    return json(path.endsWith('/pets') ? [pet] : []);
  });
  await screen.findByRole('button', { name: 'Editar Luna' });
  fill('Raça', 'Beagle'); fill('Nome', 'Bento'); fill('Idade (anos)', '4');
  fill('Peso (kg)', '12'); fill('Telefone para contato', '85999999999');
  click('Cadastrar pet');
  await screen.findByRole('button', { name: 'Editar Bento' });
  click('Editar Luna');
  expect(screen.getByLabelText('Nome')).toHaveValue('Luna');
  click('Cancelar edição');
  expect(screen.getByLabelText('Nome')).toHaveValue('');
  click('Editar Luna'); fill('Nome', 'Lua'); click('Salvar alterações');
  await screen.findByRole('button', { name: 'Editar Lua' });
  const calls = fetch.mock.calls.length;
  click('Excluir Lua');
  expect(fetch).toHaveBeenCalledTimes(calls);
  click('Editar Lua'); click('Excluir Lua');
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Editar Lua' })).toBeNull());
  expect(screen.getByRole('button', { name: 'Cadastrar pet' })).toBeEnabled();
  expect(confirm).toHaveBeenCalledTimes(2);
  click('Sair');
  expect(onLogout).toHaveBeenCalledOnce();
});

it('reserva, edita os serviços, envia a reserva ao WhatsApp e libera a vaga ao excluir', { timeout: 15000 }, async () => {
  vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValue(true);
  let booked = false;
  const { onSchedule } = mount((path, method, body) => {
    if (path.endsWith('/pets')) return json([pet]);
    if (path.includes('availability')) return json(booked ? [{ ...slots[0], available: 0 }, slots[1]] : slots);
    if (method === 'POST') {
      expect(body).toMatchObject({ petId: 1, slotStart: '08:00', services: ['Banho', 'Tosa completa'] });
      booked = true;
      return json(appointment, 201);
    }
    if (method === 'PUT') { expect(body).toEqual({ services: ['Banho', 'Corte de unhas'] }); return json({ service: 'Banho, Corte de unhas' }); }
    if (method === 'DELETE') { booked = false; return new Response(null, { status: 204 }); }
    return json([]);
  });
  await screen.findByRole('option', { name: /Luna/ });
  expect(await screen.findByRole('button', { name: /09:30/ })).toBeDisabled();
  fill('Pet', '1');
  fireEvent.click(screen.getByRole('button', { name: /08:00/ }));
  click('Fechar seleção de serviços');
  fireEvent.click(screen.getByRole('button', { name: /08:00/ }));
  fireEvent.click(screen.getByLabelText('Tosa higiênica'));
  fireEvent.click(screen.getByLabelText('Banho'));
  fireEvent.click(screen.getByLabelText('Tosa completa'));
  expect(screen.getByLabelText('Tosa higiênica')).toBeDisabled();
  expect(screen.getByLabelText('Tosa higiênica')).not.toBeChecked();
  click('Usar serviços selecionados'); click('Confirmar agendamento');
  await screen.findByRole('button', { name: 'Editar agendamento de Luna' });
  await waitFor(() => expect(screen.getByRole('button', { name: /08:00/ })).toBeDisabled());
  click('Editar agendamento de Luna');
  const dialog = within(screen.getByRole('dialog'));
  fireEvent.click(dialog.getByLabelText('Corte de unhas'));
  fireEvent.click(dialog.getByRole('button', { name: 'Salvar alterações' }));
  await screen.findByText('Banho, Corte de unhas');
  click('Agendar pelo WhatsApp');
  expect(onSchedule).toHaveBeenCalledWith(expect.objectContaining({ petName: 'Luna', service: 'Banho, Corte de unhas' }));
  click('Excluir agendamento de Luna');
  expect(screen.getByText('Banho, Corte de unhas')).toBeTruthy();
  click('Excluir agendamento de Luna');
  await screen.findByText('Nenhum agendamento encontrado.');
  await waitFor(() => expect(screen.getByRole('button', { name: /08:00/ })).toBeEnabled());
});

it.each(['pets', 'appointments', 'availability'])('exibe falha de carregamento de %s', async resource => {
  mount(path => path.split('?')[0].endsWith('/' + resource) ? json({ error: 'Falha sintética de ' + resource }, 503) : json([]));
  expect(await screen.findByText('Falha sintética de ' + resource)).toBeTruthy();
});

it('preserva dados visíveis quando a API rejeita edição ou exclusão', { timeout: 15000 }, async () => {
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  mount((path, method) => method !== 'GET' ? json({ error: 'Operação rejeitada' }, 409)
    : json(path.includes('availability') ? slots : path.endsWith('/pets') ? [pet] : [appointment]));
  await screen.findByRole('button', { name: 'Editar Luna' });
  click('Editar Luna'); click('Salvar alterações');
  await screen.findByText('Operação rejeitada');
  expect(screen.getByLabelText('Nome')).toHaveValue('Luna');
  click('Excluir Luna');
  await screen.findByText('Operação rejeitada');
  expect(screen.getByRole('button', { name: 'Editar Luna' })).toBeTruthy();
  click('Editar agendamento de Luna');
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Salvar alterações' }));
  await screen.findByText('Operação rejeitada');
  expect(screen.getByRole('dialog')).toBeTruthy();
  click('Fechar seleção de serviços');
  click('Excluir agendamento de Luna');
  await screen.findByText('Operação rejeitada');
  expect(screen.getByRole('button', { name: 'Editar agendamento de Luna' })).toBeTruthy();
});
