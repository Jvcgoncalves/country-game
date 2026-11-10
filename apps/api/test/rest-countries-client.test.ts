import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { RestCountriesClient } from '../src/services/rest-countries-client.js';

describe('RestCountriesClient', () => {
  it('requests the needed fields and follows v5 pagination without putting the key in the URL', async () => {
    const firstPage: unknown = JSON.parse(readFileSync(
      new URL('./fixtures/rest-countries-v5-page.json', import.meta.url),
      'utf8',
    ));
    const secondPage = {
      data: {
        objects: [{
          names: {
            common: 'Canada',
            official: 'Canada',
            translations: { por: { common: 'Canadá', official: 'Canadá' } },
          },
          codes: { alpha_2: 'CA' },
          capitals: [{ attributes: { primary: true }, name: 'Ottawa' }],
          currencies: [{ code: 'CAD', name: 'Canadian dollar' }],
        }],
        meta: { total: 3, count: 1, limit: 2, offset: 2, more: false },
      },
    };
    const pages = [firstPage, secondPage];
    const urls: string[] = [];
    const authHeaders: string[] = [];
    let pageIndex = 0;
    const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      urls.push(String(input));
      authHeaders.push(new Headers(init?.headers).get('Authorization') ?? '');
      return new Response(JSON.stringify(pages[pageIndex++]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const countries = await new RestCountriesClient('test-server-key', fetcher).fetchCountries();

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(new URL(urls[0]!).searchParams.get('response_fields'))
      .toBe(RestCountriesClient.RESPONSE_FIELDS);
    expect(new URL(urls[0]!).searchParams.get('offset')).toBe('0');
    expect(new URL(urls[1]!).searchParams.get('offset')).toBe('2');
    expect(urls.every((url) => !url.includes('test-server-key'))).toBe(true);
    expect(authHeaders).toEqual(['Bearer test-server-key', 'Bearer test-server-key']);
    expect(countries.map((country) => country.code)).toEqual(['BR', 'AQ', 'CA']);
  });

  it('rejects inconsistent pagination and hides upstream error details', async () => {
    const fetcher = vi.fn(async () => new Response(
      JSON.stringify({ errors: [{ message: 'private upstream detail' }] }),
      { status: 502 },
    ));

    await expect(new RestCountriesClient('test-key', fetcher).fetchCountries())
      .rejects.toThrow('REST Countries request failed.');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('rejects malformed pagination metadata', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({
      data: {
        objects: [],
        meta: { total: 0, count: 0, limit: 100, offset: 1, more: false },
      },
    }), { status: 200 }));

    await expect(new RestCountriesClient('test-key', fetcher).fetchCountries())
      .rejects.toThrow('inconsistent pagination');
  });
});
