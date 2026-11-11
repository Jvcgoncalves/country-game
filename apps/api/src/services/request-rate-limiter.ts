import { createHash } from 'node:crypto';
import type { CountryCacheRepository } from '../types/contracts.js';

export class RequestRateLimiter {
  static readonly WINDOW_SECONDS = 60;
  static readonly MAX_REQUESTS_PER_WINDOW = 120;

  private cache: CountryCacheRepository;
  private now = Date.now;

  constructor(cache: CountryCacheRepository, now: () => number = Date.now) {
    this.cache = cache;
    this.now = now;
  }

  async allows(clientAddress: string) {
    const now = this.now();
    const minute = Math.floor(now / (RequestRateLimiter.WINDOW_SECONDS * 1000));
    const addressHash = createHash('sha256').update(clientAddress).digest('hex');
    const bucket = `game-round:${addressHash}:${minute}`;
    const count = await this.cache.incrementRateLimit(bucket, RequestRateLimiter.WINDOW_SECONDS);
    return count <= RequestRateLimiter.MAX_REQUESTS_PER_WINDOW;
  }
}
