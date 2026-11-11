import Fastify from 'fastify';
import { GameController } from './controllers/game-controller.js';
import { ServerConfig } from './config/server-config.js';
import {
  MemoryCountryCacheRepository,
  UpstashCountryCacheRepository,
} from './repositories/country-cache-repository.js';
import { CountryCatalogService } from './services/country-catalog-service.js';
import { GameRoundService } from './services/game-round-service.js';
import { RequestRateLimiter } from './services/request-rate-limiter.js';
import { RestCountriesClient } from './services/rest-countries-client.js';

const config = ServerConfig.fromEnvironment();
const app = Fastify({ logger: true, trustProxy: true });
const cache = config.cacheUrl
  ? new UpstashCountryCacheRepository(config.cacheUrl, config.cacheToken)
  : new MemoryCountryCacheRepository();
const countrySource = new RestCountriesClient(config.apiKey);
const catalog = new CountryCatalogService(countrySource, cache);
const rounds = new GameRoundService(catalog);
const rateLimiter = new RequestRateLimiter(cache);

new GameController(rounds, rateLimiter).register(app);

await app.listen({ host: '0.0.0.0', port: config.port });
