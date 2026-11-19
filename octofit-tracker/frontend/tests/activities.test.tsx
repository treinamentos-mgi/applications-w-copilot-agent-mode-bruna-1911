import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Activities from '../src/components/Activities.js';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Atividades', () => {
  it('traduz os tipos conhecidos e preserva tipos personalizados', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      activities: ['run', 'cycle', 'walk', 'strength', 'Yoga'].map((type) => ({ type, minutes: 10, points: 10 })),
    }), { status: 200 })));

    render(<Activities />);
    for (const name of ['Corrida', 'Ciclismo', 'Caminhada', 'Força', 'Yoga']) {
      expect(await screen.findByText(new RegExp(name))).toBeInTheDocument();
    }
  });

  it.each([
    ['resposta inválida', () => Promise.resolve(new Response('{}', { status: 200 }))],
    ['falha de conexão', () => Promise.reject(new Error('Falha de conexão'))],
  ])('anuncia %s como erro', async (_description, response) => {
    vi.stubGlobal('fetch', vi.fn(response));
    render(<Activities />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/não foi possível/i);
  });
});
