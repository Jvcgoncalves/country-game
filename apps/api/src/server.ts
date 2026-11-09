import Fastify from 'fastify';

const app = Fastify({ logger: true });
const port = Number(process.env.PORT ?? process.env.API_PORT ?? 3001);

await app.listen({ host: '0.0.0.0', port });
