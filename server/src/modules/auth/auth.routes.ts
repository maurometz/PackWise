import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { loginSchema, registerSchema } from './auth.schemas.js';

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request, reply) => {
    const input = registerSchema.parse(request.body);
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) return reply.conflict('Este e-mail já está cadastrado.');

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: { name: input.name, email: input.email, passwordHash }
    });
    const token = app.jwt.sign({ sub: user.id, email: user.email });
    return reply.code(201).send({ token, user: { id: user.id, name: user.name, email: user.email } });
  });

  app.post('/login', async (request, reply) => {
    const input = loginSchema.parse(request.body);
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    const valid = user && await bcrypt.compare(input.password, user.passwordHash);
    if (!valid || !user) return reply.unauthorized('E-mail ou senha inválidos.');

    const token = app.jwt.sign({ sub: user.id, email: user.email });
    return reply.send({ token, user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl } });
  });

  app.get('/me', { onRequest: [app.authenticate] }, async (request) => {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: request.user.sub } });
    return { user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl } };
  });
}
