import { prisma } from '../lib/prisma';
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = Router();
// Using singleton prisma from lib/prisma
router.use(authenticateJWT);

router.get('/', requirePermission('VIEW_AUDIT_LOG'), async (req: AuthRequest, res) => {
  try {
    const { eventType, actorId, dateFrom, dateTo, take, skip } = req.query;
    const filter: any = {};
    if (eventType) filter.eventType = eventType;
    if (actorId) filter.actorId = actorId;
    if (dateFrom || dateTo) {
      filter.timestamp = {};
      if (dateFrom) filter.timestamp.gte = new Date(dateFrom as string);
      if (dateTo) filter.timestamp.lte = new Date(dateTo as string);
    }
    
    const t = take ? parseInt(take as string) : 50;
    const s = skip ? parseInt(skip as string) : 0;

    const events = await prisma.auditEvent.findMany({
      where: filter,
      orderBy: { timestamp: 'desc' },
      take: t,
      skip: s
    });
    const total = await prisma.auditEvent.count({ where: filter });
    res.json({ success: true, data: events, total });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/stats', requirePermission('VIEW_AUDIT_LOG'), async (req: AuthRequest, res) => {
  try {
    const stats = await prisma.auditEvent.groupBy({
      by: ['eventType'],
      _count: { id: true }
    });
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/export', requirePermission('EXPORT_AUDIT_LOG'), async (req: AuthRequest, res) => {
  try {
    const events = await prisma.auditEvent.findMany({
      orderBy: { timestamp: 'desc' }
    });
    res.json({ success: true, data: events }); // Could also map to CSV if requested
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

