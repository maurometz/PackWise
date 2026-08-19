import type { FastifyInstance } from 'fastify';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { smartPackingEngine } from '../packing/smartPackingEngine.js';
import { getOpenMeteoForecast } from '../weather/openMeteo.js';

const createTripSchema = z.object({
  title: z.string().trim().min(2).max(100),
  destination: z.string().trim().min(2).max(120),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  tripType: z.enum(['SOLO', 'GROUP']),
  weatherType: z.enum(['EXTREME_COLD', 'BEACH_HOT', 'RAINY', 'MODERATE_MIXED']),
  transportType: z.enum(['PLANE', 'CAR', 'BUS', 'TRAIN'])
}).refine((data) => data.endDate >= data.startDate, { message: 'A data final deve ser posterior à data inicial.' });

const createItemSchema = z.object({
  title: z.string().trim().min(1).max(120),
  quantity: z.coerce.number().int().min(1).max(99).default(1),
  visibility: z.enum(['SHARED', 'PRIVATE', 'SECRET']).default('SHARED'),
  categoryId: z.string().optional()
});

export async function tripRoutes(app: FastifyInstance) {
  app.get('/', { onRequest: [app.authenticate] }, async (request) => {
    return prisma.trip.findMany({
      where: { members: { some: { userId: request.user.sub } } },
      orderBy: { startDate: 'asc' },
      include: { _count: { select: { items: true } } }
    });
  });

  app.post('/', { onRequest: [app.authenticate] }, async (request, reply) => {
    const input = createTripSchema.parse(request.body);
    const days = Math.max(1, Math.ceil((input.endDate.getTime() - input.startDate.getTime()) / 86_400_000) + 1);
    const generatedCategories = smartPackingEngine({ days, weatherType: input.weatherType, tripType: input.tripType, transportType: input.transportType });
    const trip = await prisma.$transaction(async (tx) => {
      const createdTrip = await tx.trip.create({ data: { ...input, inviteCode: randomBytes(12).toString('hex'), ownerId: request.user.sub, members: { create: { userId: request.user.sub, role: 'ADMIN' } } } });
      for (const category of generatedCategories) {
        const createdCategory = await tx.category.create({ data: { tripId: createdTrip.id, key: category.key, name: category.name, icon: category.icon } });
        await tx.checklistItem.createMany({ data: category.items.map((item) => ({ tripId: createdTrip.id, categoryId: createdCategory.id, title: item.title, quantity: item.quantity, createdByUserId: request.user.sub })) });
      }
      return createdTrip;
    });
    return reply.code(201).send(trip);
  });

  app.get('/:id', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const trip = await prisma.trip.findFirst({ where: { id, members: { some: { userId: request.user.sub } } }, include: { categories: { include: { items: { orderBy: { createdAt: 'asc' } } } }, members: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } } } });
    if (!trip) return reply.notFound('Viagem não encontrada.');
    const weather = await getOpenMeteoForecast(trip.destination, trip.startDate, trip.endDate);
    const filteredCategories = trip.categories.map((category) => ({ ...category, items: category.items.flatMap((item) => {
      if (item.visibility === 'PRIVATE' && item.createdByUserId !== request.user.sub) return [];
      if (item.visibility === 'SECRET' && item.createdByUserId !== request.user.sub) return [{ ...item, title: 'Item secreto', quantity: 1, assignedToUserId: null }];
      return [item];
    }) }));
    return { ...trip, categories: filteredCategories, weather };
  });

  app.get('/:tripId/members', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { tripId } = request.params as { tripId: string };
    const membership = await prisma.tripMember.findUnique({ where: { tripId_userId: { tripId, userId: request.user.sub } } });
    if (!membership) return reply.forbidden('Você não participa desta viagem.');
    return prisma.tripMember.findMany({ where: { tripId }, orderBy: { joinedAt: 'asc' }, include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } });
  });

  app.post('/join/:inviteCode', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { inviteCode } = request.params as { inviteCode: string };
    const trip = await prisma.trip.findUnique({ where: { inviteCode } });
    if (!trip || trip.tripType !== 'GROUP') return reply.notFound('Convite inválido ou viagem não encontrada.');
    const membership = await prisma.tripMember.upsert({ where: { tripId_userId: { tripId: trip.id, userId: request.user.sub } }, update: {}, create: { tripId: trip.id, userId: request.user.sub, role: 'MEMBER' }, include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } });
    return { trip: { id: trip.id, title: trip.title, destination: trip.destination }, membership };
  });

  app.post('/:tripId/invite/regenerate', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { tripId } = request.params as { tripId: string };
    const membership = await prisma.tripMember.findUnique({ where: { tripId_userId: { tripId, userId: request.user.sub } } });
    if (!membership || membership.role !== 'ADMIN') return reply.forbidden('Somente administradores podem renovar o convite.');
    const trip = await prisma.trip.update({ where: { id: tripId }, data: { inviteCode: randomBytes(12).toString('hex') }, select: { inviteCode: true } });
    return trip;
  });

  app.delete('/:tripId/members/:userId', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { tripId, userId } = request.params as { tripId: string; userId: string };
    const membership = await prisma.tripMember.findUnique({ where: { tripId_userId: { tripId, userId: request.user.sub } } });
    if (!membership || membership.role !== 'ADMIN') return reply.forbidden('Somente administradores podem remover membros.');
    if (userId === request.user.sub) return reply.badRequest('O administrador não pode remover a própria conta.');
    await prisma.tripMember.deleteMany({ where: { tripId, userId } });
    return reply.code(204).send();
  });

  app.post('/:tripId/items', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { tripId } = request.params as { tripId: string };
    const input = createItemSchema.parse(request.body);
    const membership = await prisma.tripMember.findUnique({ where: { tripId_userId: { tripId, userId: request.user.sub } } });
    if (!membership) return reply.forbidden('Você não participa desta viagem.');
    const category = input.categoryId
      ? await prisma.category.findFirst({ where: { id: input.categoryId, tripId } })
      : await prisma.category.findFirst({ where: { tripId }, orderBy: { name: 'asc' } });
    const targetCategory = category ?? await prisma.category.create({ data: { tripId, key: 'LEISURE_SPECIFIC', name: 'Itens personalizados', icon: '📌' } });
    const item = await prisma.checklistItem.create({ data: { tripId, categoryId: targetCategory.id, title: input.title, quantity: input.quantity, visibility: input.visibility, createdByUserId: request.user.sub } });
    return reply.code(201).send(item);
  });

  app.patch('/:tripId/items/:itemId', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { tripId, itemId } = request.params as { tripId: string; itemId: string };
    const membership = await prisma.tripMember.findUnique({ where: { tripId_userId: { tripId, userId: request.user.sub } } });
    if (!membership) return reply.forbidden('Você não participa desta viagem.');
    const item = await prisma.checklistItem.findFirst({ where: { id: itemId, tripId } });
    if (!item) return reply.notFound('Item não encontrado.');
    return prisma.checklistItem.update({ where: { id: itemId }, data: { isPacked: !item.isPacked, checkedByUserId: !item.isPacked ? request.user.sub : null, checkedAt: !item.isPacked ? new Date() : null } });
  });

  app.put('/:tripId/items/:itemId', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { tripId, itemId } = request.params as { tripId: string; itemId: string };
    const input = createItemSchema.parse(request.body);
    const membership = await prisma.tripMember.findUnique({ where: { tripId_userId: { tripId, userId: request.user.sub } } });
    if (!membership) return reply.forbidden('Você não participa desta viagem.');
    const item = await prisma.checklistItem.findFirst({ where: { id: itemId, tripId } });
    if (!item) return reply.notFound('Item não encontrado.');
    const category = input.categoryId ? await prisma.category.findFirst({ where: { id: input.categoryId, tripId } }) : null;
    return prisma.checklistItem.update({ where: { id: itemId }, data: { title: input.title, quantity: input.quantity, visibility: input.visibility, ...(category ? { categoryId: category.id } : {}) } });
  });

  app.delete('/:tripId/items/:itemId', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { tripId, itemId } = request.params as { tripId: string; itemId: string };
    const membership = await prisma.tripMember.findUnique({ where: { tripId_userId: { tripId, userId: request.user.sub } } });
    if (!membership) return reply.forbidden('Você não participa desta viagem.');
    const item = await prisma.checklistItem.findFirst({ where: { id: itemId, tripId } });
    if (!item) return reply.notFound('Item não encontrado.');
    await prisma.checklistItem.delete({ where: { id: itemId } });
    return reply.code(204).send();
  });
}
