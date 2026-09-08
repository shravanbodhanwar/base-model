import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticateJWT);

// GET /api/users - list all users (scoped)
router.get('/', async (req: AuthRequest, res) => {
  try {
    const isAdmin = req.user?.roleAssignments?.some((r: any) =>
      r.role.permissions.includes('ALL') || r.role.permissions.includes('MANAGE_USERS'));
    
    const users = await prisma.user.findMany({
      where: isAdmin ? {} : { id: req.user!.id },
      select: {
        id: true, email: true, name: true, employeeId: true,
        status: true, department: true, position: true, phone: true, createdAt: true,
        dids: { select: { did: true, status: true } },
        roleAssignments: { include: { role: { select: { name: true, displayName: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: users, total: users.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/users/:id
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const canViewOthers = req.user?.roleAssignments?.some((r: any) =>
      r.role.permissions.includes('ALL') || r.role.permissions.includes('MANAGE_USERS'));
    if (req.user!.id !== req.params.id && !canViewOthers) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        dids: true, wallets: { select: { id: true, address: true, type: true, status: true } },
        roleAssignments: { include: { role: true } },
        issuedCredentials: { take: 5, orderBy: { issuedAt: 'desc' } },
        subjectCredentials: { take: 10, orderBy: { issuedAt: 'desc' } },
        ownedAssets: { take: 10 }
      }
    });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/users - create user
router.post('/', requirePermission('MANAGE_USERS'), async (req: AuthRequest, res) => {
  try {
    const { email, name, password, employeeId, department, position, phone } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ success: false, error: 'email, name, password required' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ success: false, error: 'Email already exists' });
    
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, passwordHash, employeeId, department, position, phone }
    });
    res.status(201).json({ success: true, data: user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/users/:id
router.put('/:id', requirePermission('MANAGE_USERS'), async (req: AuthRequest, res) => {
  try {
    const { name, department, position, phone, avatarUrl } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, department, position, phone, avatarUrl }
    });
    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/users/:id/suspend
router.patch('/:id/suspend', requirePermission('MANAGE_USERS'), async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { status: 'SUSPENDED' } });
    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/users/:id/activate
router.patch('/:id/activate', requirePermission('MANAGE_USERS'), async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { status: 'ACTIVE' } });
    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/users/:id/credentials
router.get('/:id/credentials', async (req: AuthRequest, res) => {
  try {
    const credentials = await prisma.credential.findMany({ where: { subjectId: req.params.id }, orderBy: { issuedAt: 'desc' } });
    res.json({ success: true, data: credentials });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/users/:id/assets
router.get('/:id/assets', async (req: AuthRequest, res) => {
  try {
    const assets = await prisma.asset.findMany({ where: { ownerId: req.params.id } });
    res.json({ success: true, data: assets });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/users/:id/activity
router.get('/:id/activity', async (req: AuthRequest, res) => {
  try {
    const events = await prisma.auditEvent.findMany({ where: { actorId: req.params.id }, take: 50, orderBy: { timestamp: 'desc' } });
    res.json({ success: true, data: events });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
