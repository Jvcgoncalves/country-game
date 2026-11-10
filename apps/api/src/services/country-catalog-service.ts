import { randomUUID } from 'node:crypto';
import type {
  CountryCacheRepository,
  CountryCatalogSnapshot,
  CountryCatalogSource,
  NormalizedCountry,
} from '../types/contracts.js';
import { CountryMapper } from './country-mapper.js';

export class CountryCatalogService {
  static readonly MAX_CACHE_AGE_MS = 72 * 60 * 60 * 1000;
  static readonly REFRESH_AFTER_MS = 24 * 60 * 60 * 1000;
  static readonly FAILED_REFRESH_COOLDOWN_MS = 30 * 1000;
  static readonly REFRESH_LOCK_TTL_SECONDS = 60;
  static readonly LOCK_WAIT_ATTEMPTS = 20;
  static readonly LOCK_WAIT_INTERVAL_MS = 250;

  private source: CountryCatalogSource;
  private cache: CountryCacheRepository;
  private now = Date.now;
  private refreshing: Promise<NormalizedCountry[]> | null = null;
  private retryAfter = 0;

  constructor(source: CountryCatalogSource, cache: CountryCacheRepository, now: () => number = Date.now) {
    this.source = source;
    this.cache = cache;
    this.now = now;
  }

  async getCountries() {
    const snapshot = await this.readFreshSnapshot();
    const now = this.now();

    if (snapshot && now - snapshot.fetchedAt < CountryCatalogService.REFRESH_AFTER_MS) {
      return snapshot.countries;
    }

    if (now < this.retryAfter) {
      if (snapshot) return snapshot.countries;
      throw new Error('Country data temporarily unavailable.');
    }

    if (this.refreshing) return this.refreshing;

    this.refreshing = this.refresh(snapshot);
    try {
      return await this.refreshing;
    } finally {
      this.refreshing = null;
    }
  }

  private async refresh(previousSnapshot: CountryCatalogSnapshot | null) {
    const lockToken = randomUUID();
    let lockAvailable = false;
    let lockAcquired = false;
    try {
      lockAcquired = await this.cache.acquireRefreshLock(
        lockToken,
        CountryCatalogService.REFRESH_LOCK_TTL_SECONDS,
      );
      lockAvailable = true;
    } catch {
      // Upstream data can still serve this request if cache coordination is down.
    }

    if (lockAvailable && !lockAcquired) {
      if (previousSnapshot && previousSnapshot.expiresAt > this.now()) {
        return previousSnapshot.countries;
      }
      const refreshedCountries = await this.waitForOtherRefresh();
      if (refreshedCountries) return refreshedCountries;
      throw new Error('Country data temporarily unavailable.');
    }

    let refreshSucceeded = false;
    try {
      const currentSnapshot = await this.readFreshSnapshot();
      if (currentSnapshot && this.now() - currentSnapshot.fetchedAt < CountryCatalogService.REFRESH_AFTER_MS) {
        refreshSucceeded = true;
        return currentSnapshot.countries;
      }

      const result = await this.fetchAndCache(previousSnapshot);
      refreshSucceeded = result.refreshed;
      return result.countries;
    } finally {
      if (lockAcquired && refreshSucceeded) {
        try {
          await this.cache.releaseRefreshLock(lockToken);
        } catch {
          // Lock expires automatically; cache remains safe to serve.
        }
      }
    }
  }

  private async fetchAndCache(previousSnapshot: CountryCatalogSnapshot | null) {
    const fetchedAt = this.now();
    let countries: NormalizedCountry[];
    try {
      countries = await this.source.fetchCountries();
    } catch {
      this.retryAfter = this.now() + CountryCatalogService.FAILED_REFRESH_COOLDOWN_MS;
      const latestSnapshot = await this.readFreshSnapshot();
      if (latestSnapshot) return { countries: latestSnapshot.countries, refreshed: false };
      if (previousSnapshot && previousSnapshot.expiresAt > this.now()) {
        return { countries: previousSnapshot.countries, refreshed: false };
      }
      throw new Error('Country data temporarily unavailable.');
    }

    this.retryAfter = 0;
    const expiresAt = fetchedAt + CountryCatalogService.MAX_CACHE_AGE_MS;
    const snapshot = { fetchedAt, expiresAt, countries } satisfies CountryCatalogSnapshot;
    const ttlSeconds = Math.floor((expiresAt - this.now()) / 1000);
    let cached = false;
    if (ttlSeconds > 0) {
      try {
        await this.cache.write(snapshot, ttlSeconds);
        cached = true;
      } catch {
        // Serve current upstream data; cache outage must not expose its details.
      }
    }
    return { countries, refreshed: cached };
  }

  private async waitForOtherRefresh() {
    for (let attempt = 0; attempt < CountryCatalogService.LOCK_WAIT_ATTEMPTS; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, CountryCatalogService.LOCK_WAIT_INTERVAL_MS));
      const snapshot = await this.readFreshSnapshot();
      if (
        snapshot &&
        this.now() - snapshot.fetchedAt < CountryCatalogService.REFRESH_AFTER_MS
      ) {
        return snapshot.countries;
      }
    }
    return null;
  }

  private async readFreshSnapshot() {
    let value: unknown;
    try {
      value = await this.cache.read();
    } catch {
      return null;
    }

    const snapshot = this.parseSnapshot(value);
    const now = this.now();
    if (
      !snapshot ||
      snapshot.fetchedAt > now ||
      snapshot.expiresAt <= now ||
      snapshot.expiresAt - snapshot.fetchedAt > CountryCatalogService.MAX_CACHE_AGE_MS ||
      now - snapshot.fetchedAt > CountryCatalogService.MAX_CACHE_AGE_MS
    ) {
      return null;
    }
    return snapshot;
  }

  private parseSnapshot(value: unknown) {
    const snapshot = CountryMapper.asObject(value);
    if (
      !snapshot ||
      !Number.isFinite(snapshot.fetchedAt) ||
      !Number.isFinite(snapshot.expiresAt) ||
      !Array.isArray(snapshot.countries) ||
      !snapshot.countries.length ||
      !snapshot.countries.every((country) => CountryMapper.isNormalizedCountry(country))
    ) {
      return null;
    }
    return snapshot as unknown as CountryCatalogSnapshot;
  }
}
