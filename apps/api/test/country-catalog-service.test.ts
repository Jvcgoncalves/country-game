import { describe, expect, it } from 'vitest';
import { MemoryCountryCacheRepository } from '../src/repositories/country-cache-repository.js';
import { CountryCatalogService } from '../src/services/country-catalog-service.js';
import { CountryMapper } from '../src/services/country-mapper.js';
import type {
  CountryCatalogSource,
  NormalizedCountry,
} from '../src/types/contracts.js';

class StubCountrySource implements CountryCatalogSource {
  #countries: NormalizedCountry[];
  #fails: boolean;
  #delayMs: number;
  calls = 0;

  constructor(countries: NormalizedCountry[], fails = false, delayMs = 0) {
    this.#countries = countries;
    this.#fails = fails;
    this.#delayMs = delayMs;
  }

  async fetchCountries() {
    this.calls += 1;
    if (this.#delayMs) await new Promise((resolve) => setTimeout(resolve, this.#delayMs));
    if (this.#fails) throw new Error('sensitive upstream detail');
    return this.#countries;
  }
}

describe('CountryCatalogService', () => {
  const countries = CountryMapper.map([{
    names: { common: 'Brazil', official: 'Federative Republic of Brazil' },
    codes: { alpha_2: 'BR' },
    capitals: [{ attributes: { primary: true }, name: 'Brasília' }],
    currencies: [{ code: 'BRL', name: 'Brazilian real' }],
  }]);

  it('caches normalized data and deduplicates concurrent refreshes', async () => {
    const cache = new MemoryCountryCacheRepository();
    const source = new StubCountrySource(countries, false, 10);
    const service = new CountryCatalogService(source, cache);

    const [first, second] = await Promise.all([
      service.getCountries(),
      service.getCountries(),
    ]);
    const cached = await new CountryCatalogService(source, cache).getCountries();

    expect(source.calls).toBe(1);
    expect(first).toEqual(countries);
    expect(second).toEqual(countries);
    expect(cached).toEqual(countries);
  });

  it('deduplicates refreshes across service instances sharing durable cache', async () => {
    const cache = new MemoryCountryCacheRepository();
    const source = new StubCountrySource(countries, false, 20);
    const firstService = new CountryCatalogService(source, cache);
    const secondService = new CountryCatalogService(source, cache);

    const results = await Promise.all([
      firstService.getCountries(),
      secondService.getCountries(),
    ]);

    expect(source.calls).toBe(1);
    expect(results).toEqual([countries, countries]);
  });

  it('serves still-valid cache after refresh failure, then refuses expired data', async () => {
    const cache = new MemoryCountryCacheRepository();
    let now = Date.now();
    const fetchedAt = now - 48 * 60 * 60 * 1000;
    const expiresAt = fetchedAt + CountryCatalogService.MAX_CACHE_AGE_MS;
    await cache.write({ fetchedAt, expiresAt, countries }, Math.floor((expiresAt - now) / 1000));
    const source = new StubCountrySource([], true);
    const service = new CountryCatalogService(source, cache, () => now);

    expect(await service.getCountries()).toEqual(countries);
    expect(source.calls).toBe(1);

    now = expiresAt + 1;
    await expect(service.getCountries()).rejects.toThrow('Country data temporarily unavailable.');
  });

  it('returns safe unavailable error when no valid cache exists', async () => {
    const source = new StubCountrySource([], true);
    const service = new CountryCatalogService(source, new MemoryCountryCacheRepository());

    await expect(service.getCountries()).rejects.toThrow('Country data temporarily unavailable.');
  });
});
