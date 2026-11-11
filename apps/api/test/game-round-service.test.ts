import { describe, expect, it } from 'vitest';
import { GameRoundService } from '../src/services/game-round-service.js';
import type { NormalizedCountry } from '../src/types/contracts.js';

describe('GameRoundService', () => {
  const countries = Array.from({ length: 60 }, (_, index) => {
    const code = `${String.fromCharCode(65 + Math.floor(index / 26))}${String.fromCharCode(65 + index % 26)}`;
    return {
      code,
      names: {
        en: { answer: `Country ${index}`, aliases: [] },
        'pt-BR': { answer: `País ${index}`, aliases: [] },
      },
      capital: `Capital ${index}`,
      currency: `Currency ${index}`,
    } satisfies NormalizedCountry;
  });

  it('samples unique countries and returns only selected-language game fields', async () => {
    const service = new GameRoundService({ getCountries: async () => countries });
    const questions = await service.createRound(50, 'pt-BR');

    expect(questions).toHaveLength(50);
    expect(new Set(questions.map((question) => question.code)).size).toBe(50);
    expect(questions[0]?.answer.startsWith('País ')).toBe(true);
    expect(questions[0]?.flagUrl).toMatch(/^https:\/\/flagcdn\.com\/w320\/[a-z]{2}\.png$/);
    expect(Object.keys(questions[0] ?? {}).sort()).toEqual([
      'aliases', 'answer', 'capital', 'code', 'currency', 'flagUrl',
    ]);
  });

  it('rejects round sizes above bounded API maximum', async () => {
    const service = new GameRoundService({ getCountries: async () => countries });

    await expect(service.createRound(51, 'en')).rejects.toThrow('outside the supported range');
  });
});
