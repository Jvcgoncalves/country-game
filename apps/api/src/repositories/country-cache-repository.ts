import type {
  CountryCacheRepository as CountryCacheRepositoryContract,
  CountryCatalogSnapshot,
  RateLimitEntry,
} from '../types/contracts.js';

const CATALOG_CACHE_KEY = 'guess-flags:country-catalog:v1';
const REFRESH_LOCK_KEY = 'guess-flags:country-catalog:refresh-lock:v1';
const RELEASE_LOCK_SCRIPT = [
  'if redis.call("GET", KEYS[1]) == ARGV[1] then',
  '  return redis.call("DEL", KEYS[1])',
  'end',
  'return 0',
].join('\n');
const RATE_LIMIT_SCRIPT = [
  'local count = redis.call("INCR", KEYS[1])',
  'if count == 1 then redis.call("EXPIRE", KEYS[1], ARGV[1]) end',
  'return count',
].join('\n');

class UpstashResponseValidator {
  static result(value: unknown) {
    const response = value !== null && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, unknown>
      : null;
    if (!response || 'error' in response || !('result' in response)) {
      throw new Error('Durable cache request failed.');
    }
    return response.result;
  }
}

export class MemoryCountryCacheRepository implements CountryCacheRepositoryContract {
  private snapshot: CountryCatalogSnapshot | null = null;
  private cacheExpiresAt = 0;
  private refreshLockToken: string | null = null;
  private refreshLockExpiresAt = 0;
  private rateLimits = new Map<string, RateLimitEntry>();

  async read() {
    if (Date.now() >= this.cacheExpiresAt) return null;
    return this.snapshot;
  }

  async write(snapshot: CountryCatalogSnapshot, ttlSeconds: number) {
    if (ttlSeconds <= 0) return;
    this.snapshot = snapshot;
    this.cacheExpiresAt = Math.min(snapshot.expiresAt, Date.now() + ttlSeconds * 1000);
  }

  async acquireRefreshLock(token: string, ttlSeconds: number) {
    if (this.refreshLockToken && this.refreshLockExpiresAt > Date.now()) return false;
    this.refreshLockToken = token;
    this.refreshLockExpiresAt = Date.now() + ttlSeconds * 1000;
    return true;
  }

  async releaseRefreshLock(token: string) {
    if (this.refreshLockToken !== token) return;
    this.refreshLockToken = null;
    this.refreshLockExpiresAt = 0;
  }

  async incrementRateLimit(bucketKey: string, ttlSeconds: number) {
    const now = Date.now();
    for (const [key, entry] of this.rateLimits) {
      if (entry.expiresAt <= now) this.rateLimits.delete(key);
    }

    const current = this.rateLimits.get(bucketKey);
    if (current && current.expiresAt > now) {
      current.count += 1;
      return current.count;
    }

    this.rateLimits.set(bucketKey, { count: 1, expiresAt: now + ttlSeconds * 1000 });
    return 1;
  }
}

export class UpstashCountryCacheRepository implements CountryCacheRepositoryContract {
  private url = new URL('https://invalid.local');
  private token = '';
  private fetcher = fetch;

  constructor(url: string, token: string, fetcher: typeof fetch = fetch) {
    this.url = new URL(url);
    this.token = token;
    this.fetcher = fetcher;
  }

  async read() {
    const value = await this.command(['GET', CATALOG_CACHE_KEY]);
    if (typeof value !== 'string') return null;
    try {
      return JSON.parse(value) as unknown;
    } catch {
      return null;
    }
  }

  async write(snapshot: CountryCatalogSnapshot, ttlSeconds: number) {
    if (ttlSeconds <= 0) return;
    const result = await this.command([
      'SET',
      CATALOG_CACHE_KEY,
      JSON.stringify(snapshot),
      'EX',
      ttlSeconds,
    ]);
    if (result !== 'OK') throw new Error('Durable cache write failed.');
  }

  async acquireRefreshLock(token: string, ttlSeconds: number) {
    const result = await this.command([
      'SET',
      REFRESH_LOCK_KEY,
      token,
      'EX',
      ttlSeconds,
      'NX',
    ]);
    return result === 'OK';
  }

  async releaseRefreshLock(token: string) {
    await this.command(['EVAL', RELEASE_LOCK_SCRIPT, 1, REFRESH_LOCK_KEY, token]);
  }

  async incrementRateLimit(bucketKey: string, ttlSeconds: number) {
    const result = await this.command([
      'EVAL',
      RATE_LIMIT_SCRIPT,
      1,
      `guess-flags:rate-limit:${bucketKey}`,
      ttlSeconds,
    ]);
    if (!Number.isInteger(result)) throw new Error('Durable rate limit request failed.');
    return result as number;
  }

  private async command(command: unknown[]) {
    let response: Response;
    try {
      response = await this.fetcher(this.url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      throw new Error('Durable cache request failed.');
    }

    if (!response.ok) throw new Error('Durable cache request failed.');

    let payload: unknown;
    try {
      payload = await response.json() as unknown;
    } catch {
      throw new Error('Durable cache returned invalid JSON.');
    }
    return UpstashResponseValidator.result(payload);
  }
}
