import { prisma } from '../lib/prisma';
import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = Router();
// Using singleton prisma from lib/prisma

router.use(authenticateJWT);

router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany();
    res.json({ success: true, data: projects });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', requirePermission('MANAGE_ORGS'), async (req, res) => {
  try {
    const { name, code, unitId, sbuId, managerId, description, startDate, endDate, did } = req.body || {};
    if (!name || !code || !unitId || !sbuId || !managerId) {
      return res.status(400).json({ success: false, error: 'name, code, unitId, sbuId, and managerId are required' });
    }
    const project = await prisma.project.create({ data: { name, code, unitId, sbuId, managerId, description, startDate: startDate ? new Date(startDate) : null, endDate: endDate ? new Date(endDate) : null, did } });
    res.status(201).json({ success: true, data: project });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/:id', requirePermission('MANAGE_ORGS'), async (req, res) => {
  try {
    const { name, description, status, startDate, endDate, did } = req.body || {};
    const project = await prisma.project.update({ where: { id: req.params.id }, data: { name, description, status, startDate: startDate ? new Date(startDate) : undefined, endDate: endDate ? new Date(endDate) : undefined, did } });
    res.json({ success: true, data: project });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id/members', async (req, res) => {
  try {
    const members = await prisma.roleAssignment.findMany({ where: { scopeType: 'PROJECT', scopeId: req.params.id }, include: { user: true } });
    res.json({ success: true, data: members });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

