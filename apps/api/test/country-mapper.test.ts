import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CountryMapper } from '../src/services/country-mapper.js';
import type { V5CountryObject } from '../src/types/contracts.js';

describe('CountryMapper', () => {
  it('maps English and Portuguese names, official aliases, and optional hints', () => {
    const payload: unknown = JSON.parse(readFileSync(
      new URL('./fixtures/rest-countries-v5-page.json', import.meta.url),
      'utf8',
    ));
    const data = CountryMapper.asObject(CountryMapper.asObject(payload)?.data);
    const countries = CountryMapper.map(data?.objects as V5CountryObject[]);

    expect(countries[0]).toEqual({
      code: 'BR',
      names: {
        en: { answer: 'Brazil', aliases: ['Federative Republic of Brazil'] },
        'pt-BR': { answer: 'Brasil', aliases: ['República Federativa do Brasil'] },
      },
      capital: 'Brasília',
      currency: 'Brazilian real',
    });
    expect(countries[1]?.capital).toBeNull();
    expect(countries[1]?.currency).toBeNull();
  });

  it('falls back to English names when Portuguese translation is missing', () => {
    const countries = CountryMapper.map([{
      names: { common: 'Example Island', official: 'Republic of Example Island' },
      codes: { alpha_2: 'XY' },
      capitals: [],
      currencies: [],
    }]);

    expect(countries[0]?.names['pt-BR']).toEqual({
      answer: 'Example Island',
      aliases: ['Republic of Example Island'],
    });
  });

  it('excludes invalid flag codes and deduplicates valid alpha-2 codes', () => {
    const countries = CountryMapper.map([
      { names: { common: 'No Flag' }, codes: { alpha_2: '' } },
      { names: { common: 'Brazil' }, codes: { alpha_2: 'BR' } },
      { names: { common: 'Duplicate Brazil' }, codes: { alpha_2: 'BR' } },
    ]);

    expect(countries).toHaveLength(1);
    expect(countries[0]?.names.en.answer).toBe('Brazil');
  });
});
