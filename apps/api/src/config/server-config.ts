export class ServerConfig {
  static fromEnvironment(environment = process.env) {
    const apiKey = environment.REST_COUNTRIES_API_KEY?.trim();
    if (!apiKey || apiKey === 'replace-with-server-key') {
      throw new Error('REST_COUNTRIES_API_KEY must be set on the API server.');
    }

    const port = Number(environment.PORT ?? environment.API_PORT ?? 3001);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('API_PORT must be a valid TCP port.');
    }

    const cacheUrl = environment.UPSTASH_REDIS_REST_URL?.trim() ?? '';
    const cacheToken = environment.UPSTASH_REDIS_REST_TOKEN?.trim() ?? '';
    if (Boolean(cacheUrl) !== Boolean(cacheToken)) {
      throw new Error('Both Upstash REST cache settings must be set together.');
    }
    if (environment.VERCEL === '1' && (!cacheUrl || !cacheToken)) {
      throw new Error('Upstash REST cache settings are required on Vercel.');
    }

    return Object.freeze({ apiKey, port, cacheUrl, cacheToken });
  }
}
