import { prisma } from '../lib/prisma';
import { Router } from 'express';
import { PrismaClient, OrgType } from '@prisma/client';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = Router();
// Using singleton prisma from lib/prisma
router.use(authenticateJWT);

// GET / - org tree
router.get('/', async (req: AuthRequest, res) => {
  try {
    const orgs = await prisma.organization.findMany({
      include: {
        units: {
          include: {
            sbus: true
          }
        }
      }
    });
    res.json({ success: true, data: orgs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /:id - single org
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: req.params.id },
      include: { units: true }
    });
    if (!org) return res.status(404).json({ success: false, error: 'Org not found' });
    res.json({ success: true, data: org });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /:id/units
router.get('/:id/units', async (req: AuthRequest, res) => {
  try {
    const units = await prisma.unit.findMany({
      where: { organizationId: req.params.id },
      include: { sbus: true }
    });
    res.json({ success: true, data: units });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /units/:unitId/sbus
router.get('/units/:unitId/sbus', async (req: AuthRequest, res) => {
  try {
    const sbus = await prisma.sBU.findMany({
      where: { unitId: req.params.unitId }
    });
    res.json({ success: true, data: sbus });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /
router.post('/', requirePermission('MANAGE_ORGS'), async (req: AuthRequest, res) => {
  try {
    const { name, shortName, orgType } = req.body;
    const org = await prisma.organization.create({
      data: {
        name,
        shortName: shortName || name.substring(0, 5).toUpperCase(),
        orgType: (orgType || 'ORGANIZATION') as OrgType,
        did: `did:bel:org:${Date.now()}`
      }
    });
    res.status(201).json({ success: true, data: org });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

