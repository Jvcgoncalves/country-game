import { randomInt } from 'node:crypto';
import type {
  CountryCatalogProvider,
  CountryLanguage,
  GameQuestion,
} from '../types/contracts.js';

export class GameRoundService {
  static readonly MAX_ROUND_SIZE = 50;
  static readonly MIN_ROUND_SIZE = 1;

  private catalog: CountryCatalogProvider;

  constructor(catalog: CountryCatalogProvider) {
    this.catalog = catalog;
  }

  async createRound(count: number, language: CountryLanguage) {
    if (
      !Number.isInteger(count) ||
      count < GameRoundService.MIN_ROUND_SIZE ||
      count > GameRoundService.MAX_ROUND_SIZE
    ) {
      throw new Error('Round size is outside the supported range.');
    }

    const countries = await this.catalog.getCountries();
    if (count > countries.length) throw new Error('Not enough countries are available.');

    const remaining = [...countries];
    for (let index = 0; index < count; index += 1) {
      const selectedIndex = index + randomInt(remaining.length - index);
      [remaining[index], remaining[selectedIndex]] = [remaining[selectedIndex], remaining[index]];
    }

    return remaining.slice(0, count).map((country) => {
      const name = country.names[language];
      return {
        code: country.code,
        answer: name.answer,
        aliases: [...name.aliases],
        capital: country.capital,
        currency: country.currency,
        flagUrl: `https://flagcdn.com/w320/${country.code.toLowerCase()}.png`,
      } satisfies GameQuestion;
    });
  }
}
