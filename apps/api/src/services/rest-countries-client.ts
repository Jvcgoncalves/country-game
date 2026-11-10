import type { CountryCatalogSource, V5CountryObject, V5CountryPage } from '../types/contracts.js';
import { CountryMapper } from './country-mapper.js';

class V5ResponseValidator {
  static parse(value: unknown): V5CountryPage {
    const payload = CountryMapper.asObject(value);
    const data = CountryMapper.asObject(payload?.data);
    const metadata = CountryMapper.asObject(data?.meta);
    const objects = data?.objects;

    if (!payload || !data || !metadata || !Array.isArray(objects)) {
      throw new Error('REST Countries returned an invalid response.');
    }

    const total = metadata.total;
    const count = metadata.count;
    const limit = metadata.limit;
    const offset = metadata.offset;
    const more = metadata.more;
    if (
      !Number.isInteger(total) || (total as number) < 0 ||
      !Number.isInteger(count) || (count as number) < 0 ||
      !Number.isInteger(limit) || (limit as number) < 1 || (limit as number) > 100 ||
      !Number.isInteger(offset) || (offset as number) < 0 ||
      typeof more !== 'boolean' || count !== objects.length ||
      !objects.every((record) => CountryMapper.asObject(record))
    ) {
      throw new Error('REST Countries returned invalid pagination data.');
    }

    for (const recordValue of objects) {
      const record = CountryMapper.asObject(recordValue);
      if (!record) throw new Error('REST Countries returned an invalid country record.');

      for (const field of ['names', 'codes', 'translations']) {
        const candidate = field === 'translations'
          ? CountryMapper.asObject(record.names)?.translations
          : record[field];
        if (candidate !== undefined && candidate !== null && !CountryMapper.asObject(candidate)) {
          throw new Error('REST Countries returned invalid country fields.');
        }
      }

      for (const field of ['capitals', 'currencies']) {
        const candidate = record[field];
        if (candidate !== undefined && candidate !== null && !Array.isArray(candidate)) {
          throw new Error('REST Countries returned invalid country fields.');
        }
      }
    }

    return {
      objects: objects as V5CountryObject[],
      meta: {
        total: total as number,
        count: count as number,
        limit: limit as number,
        offset: offset as number,
        more,
      },
    };
  }
}

export class RestCountriesClient implements CountryCatalogSource {
  static readonly PAGE_SIZE = 50;
  static readonly MAX_PAGES = 20;
  static readonly REQUEST_TIMEOUT_MS = 10_000;
  static readonly RESPONSE_FIELDS = [
    'names.common',
    'names.official',
    'names.translations.por',
    'codes.alpha_2',
    'capitals',
    'currencies',
  ].join(',');

  private apiKey = '';
  private fetcher = fetch;

  constructor(apiKey: string, fetcher: typeof fetch = fetch) {
    this.apiKey = apiKey;
    this.fetcher = fetcher;
  }

  async fetchCountries() {
    const records: V5CountryObject[] = [];
    let offset = 0;
    let complete = false;

    for (let pageNumber = 0; pageNumber < RestCountriesClient.MAX_PAGES; pageNumber += 1) {
      const url = new URL('https://api.restcountries.com/countries/v5');
      url.searchParams.set('limit', String(RestCountriesClient.PAGE_SIZE));
      url.searchParams.set('offset', String(offset));
      url.searchParams.set('response_fields', RestCountriesClient.RESPONSE_FIELDS);

      let response: Response;
      try {
        response = await this.fetcher(url, {
          headers: { Authorization: `Bearer ${this.apiKey}` },
          signal: AbortSignal.timeout(RestCountriesClient.REQUEST_TIMEOUT_MS),
        });
      } catch {
        throw new Error('REST Countries request failed.');
      }

      if (!response.ok) throw new Error('REST Countries request failed.');

      let payload: unknown;
      try {
        payload = await response.json() as unknown;
      } catch {
        throw new Error('REST Countries returned invalid JSON.');
      }

      const page = V5ResponseValidator.parse(payload);
      if (
        page.meta.offset !== offset ||
        page.meta.total < offset + page.meta.count ||
        (page.meta.more && offset + page.meta.count >= page.meta.total) ||
        (!page.meta.more && offset + page.meta.count < page.meta.total)
      ) {
        throw new Error('REST Countries returned inconsistent pagination data.');
      }

      records.push(...page.objects);
      offset += page.meta.count;
      if (!page.meta.more) {
        complete = true;
        break;
      }
    }

    if (!complete) throw new Error('REST Countries pagination exceeded the safety limit.');

    const countries = CountryMapper.map(records);
    if (!countries.length) throw new Error('REST Countries returned no playable countries.');
    return countries;
  }
}
