export type CountryLanguage = 'en' | 'pt-BR';

export interface CountryAnswer {
  answer: string;
  aliases: string[];
}

export interface NormalizedCountry {
  code: string;
  names: Record<CountryLanguage, CountryAnswer>;
  capital: string | null;
  currency: string | null;
}

export interface GameQuestion {
  code: string;
  answer: string;
  aliases: string[];
  capital: string | null;
  currency: string | null;
  flagUrl: string;
}

export interface CountryCatalogSnapshot {
  fetchedAt: number;
  expiresAt: number;
  countries: NormalizedCountry[];
}

export interface RateLimitEntry {
  count: number;
  expiresAt: number;
}

export interface CountryCacheRepository {
  read(): Promise<unknown>;
  write(snapshot: CountryCatalogSnapshot, ttlSeconds: number): Promise<void>;
  acquireRefreshLock(token: string, ttlSeconds: number): Promise<boolean>;
  releaseRefreshLock(token: string): Promise<void>;
  incrementRateLimit(bucketKey: string, ttlSeconds: number): Promise<number>;
}

export interface CountryCatalogSource {
  fetchCountries(): Promise<NormalizedCountry[]>;
}

export interface CountryCatalogProvider {
  getCountries(): Promise<NormalizedCountry[]>;
}

export interface V5CountryObject {
  [key: string]: unknown;
}

export interface V5CountryPage {
  objects: V5CountryObject[];
  meta: {
    total: number;
    count: number;
    limit: number;
    offset: number;
    more: boolean;
  };
}
