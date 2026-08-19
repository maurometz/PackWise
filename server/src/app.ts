import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import sensible from '@fastify/sensible';
import { ZodError } from 'zod';
import { authRoutes } from './modules/auth/auth.routes.js';
import { tripRoutes } from './modules/trips/trip.routes.js';
import { searchOpenMeteoLocations } from './modules/weather/openMeteo.js';

export function buildApp() {
  const app = Fastify({ logger: true });

  const allowedOrigins = (process.env.CLIENT_URL ?? 'http://localhost:5173').split(',').map((origin) => origin.trim()).filter(Boolean);
  app.register(cors, {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      try {
        const hostname = new URL(origin).hostname;
        if (hostname.endsWith('.vercel.app')) return callback(null, true);
      } catch { /* origin inválida será recusada abaixo */ }
      return callback(null, false);
    }
  });
  app.register(sensible);
  app.register(jwt, { secret: process.env.JWT_SECRET ?? 'development-secret' });

  app.decorate('authenticate', async function (request, reply) {
    try { await request.jwtVerify(); } catch { return reply.unauthorized('Sessão inválida ou expirada.'); }
  });

  app.get('/health', async () => ({ status: 'ok', service: 'packwise-api' }));
  app.register(authRoutes, { prefix: '/auth' });
  app.register(tripRoutes, { prefix: '/trips' });
  app.get('/weather/search', { onRequest: [app.authenticate] }, async (request) => {
    const { q } = request.query as { q?: string };
    return { results: await searchOpenMeteoLocations(q ?? '') };
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) return reply.badRequest(error.issues[0]?.message ?? 'Dados inválidos.');
    app.log.error(error);
    return reply.internalServerError('Não foi possível concluir a solicitação.');
  });

  return app;
}
