import type {
  CountryAnswer,
  CountryLanguage,
  NormalizedCountry,
  V5CountryObject,
} from '../types/contracts.js';

export class CountryMapper {
  static map(records: V5CountryObject[]) {
    const countries = new Map<string, NormalizedCountry>();
    for (const record of records) {
      const country = this.mapRecord(record);
      if (country && !countries.has(country.code)) {
        countries.set(country.code, country);
      }
    }
    return [...countries.values()];
  }

  static isNormalizedCountry(value: unknown) {
    const country = this.asObject(value);
    if (!country || typeof country.code !== 'string' || !/^[A-Z]{2}$/.test(country.code)) {
      return false;
    }

    const names = this.asObject(country.names);
    if (!names) return false;

    for (const language of ['en', 'pt-BR'] as CountryLanguage[]) {
      const name = this.asObject(names[language]);
      if (
        !name ||
        typeof name.answer !== 'string' ||
        !name.answer.trim() ||
        !Array.isArray(name.aliases) ||
        !name.aliases.every((alias) => typeof alias === 'string')
      ) {
        return false;
      }
    }

    return (country.capital === null || typeof country.capital === 'string') &&
      (country.currency === null || typeof country.currency === 'string');
  }

  static asObject(value: unknown) {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, unknown>
      : null;
  }

  private static mapRecord(record: V5CountryObject) {
    const names = this.asObject(record.names);
    const englishCommon = this.asText(names?.common);
    const codes = this.asObject(record.codes);
    const code = this.asText(codes?.alpha_2)?.toUpperCase();

    if (!englishCommon || !code || !/^[A-Z]{2}$/.test(code)) return null;

    const englishOfficial = this.asText(names?.official) ?? englishCommon;
    const translations = this.asObject(names?.translations);
    const portuguese = this.asObject(translations?.por);
    const portugueseCommon = this.asText(portuguese?.common);
    const portugueseOfficial = this.asText(portuguese?.official);
    const portugueseAnswer = portugueseCommon ?? portugueseOfficial ?? englishCommon;
    const portugueseAlias = portugueseAnswer === englishCommon
      ? englishOfficial
      : portugueseOfficial;

    return {
      code,
      names: {
        en: this.makeAnswer(englishCommon, englishOfficial),
        'pt-BR': this.makeAnswer(portugueseAnswer, portugueseAlias),
      },
      capital: this.pickCapital(record.capitals),
      currency: this.pickCurrency(record.currencies),
    } satisfies NormalizedCountry;
  }

  private static makeAnswer(answer: string, alias: string | null): CountryAnswer {
    return {
      answer,
      aliases: alias && alias !== answer ? [alias] : [],
    };
  }

  private static asText(value: unknown) {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }

  private static pickCapital(value: unknown) {
    if (!Array.isArray(value)) return null;

    let firstName: string | null = null;
    for (const entry of value) {
      const capital = this.asObject(entry);
      const name = this.asText(capital?.name);
      if (!name) continue;
      const attributes = this.asObject(capital?.attributes);
      if (attributes?.primary === true) return name;
      firstName ??= name;
    }
    return firstName;
  }

  private static pickCurrency(value: unknown) {
    if (!Array.isArray(value)) return null;

    const names: string[] = [];
    for (const entry of value) {
      const currency = this.asObject(entry);
      const name = this.asText(currency?.name) ?? this.asText(currency?.code);
      if (name && !names.includes(name)) names.push(name);
    }
    return names.length ? names.join(', ') : null;
  }
}
