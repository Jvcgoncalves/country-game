import type { CountryLanguage } from '../types/contracts.js';
import type { FastifyInstance } from 'fastify';
import { GameRoundService } from '../services/game-round-service.js';
import { RequestRateLimiter } from '../services/request-rate-limiter.js';

export class GameController {
  private rounds: GameRoundService;
  private rateLimiter: RequestRateLimiter;

  constructor(rounds: GameRoundService, rateLimiter: RequestRateLimiter) {
    this.rounds = rounds;
    this.rateLimiter = rateLimiter;
  }

  register(app: FastifyInstance) {
    app.get('/api/health', async () => ({ status: 'ok' }));

    app.get('/api/round', async (request, reply) => {
      const query = request.query as Record<string, unknown>;
      const rawCount = query.count;
      const rawLanguage = query.language;
      const count = rawCount === undefined
        ? 5
        : typeof rawCount === 'string' && /^\d+$/.test(rawCount)
          ? Number(rawCount)
          : Number.NaN;
      const language = rawLanguage === undefined ? 'en' : rawLanguage;

      if (
        !Number.isInteger(count) ||
        count < GameRoundService.MIN_ROUND_SIZE ||
        count > GameRoundService.MAX_ROUND_SIZE ||
        (language !== 'en' && language !== 'pt-BR')
      ) {
        return reply.code(400).send({
          error: 'invalid_request',
          message: `Use count 1–${GameRoundService.MAX_ROUND_SIZE} and language en or pt-BR.`,
        });
      }

      try {
        if (!await this.rateLimiter.allows(request.ip)) {
          return reply
            .header('Retry-After', String(RequestRateLimiter.WINDOW_SECONDS))
            .code(429)
            .send({ error: 'rate_limited', message: 'Too many requests. Please retry shortly.' });
        }

        const questions = await this.rounds.createRound(count, language as CountryLanguage);
        return { questions };
      } catch {
        request.log.error('Game round request failed.');
        return reply.code(503).send({
          error: 'service_unavailable',
          message: 'Country data is temporarily unavailable. Please retry.',
        });
      }
    });
  }
}
