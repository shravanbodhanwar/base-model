import { Router } from 'express';
import { PrismaClient, ScopeType } from '@prisma/client';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticateJWT);

router.get('/', requirePermission('MANAGE_ROLES'), async (req: AuthRequest, res) => {
  try {
    const roles = await prisma.role.findMany();
    res.json({ success: true, data: roles });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/assignments', requirePermission('MANAGE_ROLES'), async (req: AuthRequest, res) => {
  try {
    const assignments = await prisma.roleAssignment.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, employeeId: true } },
        role: true
      },
      orderBy: { grantedAt: 'desc' }
    });
    res.json({ success: true, data: assignments });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/assign', requirePermission('MANAGE_ROLES'), async (req: AuthRequest, res) => {
  try {
    const { userId, roleId, scopeType, scopeId } = req.body;
    const assignment = await prisma.roleAssignment.create({
      data: {
        userId,
        roleId,
        scopeType: (scopeType || 'ENTERPRISE') as ScopeType,
        scopeId,
        grantedBy: req.user!.id
      },
      include: {
        user: { select: { name: true, email: true } },
        role: true
      }
    });

    await prisma.auditEvent.create({
      data: {
        eventType: 'SYSTEM_CONFIG',
        actorId: req.user!.id,
        action: `Assigned role ${assignment.role.name} to user ${userId}`,
        targetId: userId,
        targetType: 'User'
      }
    });

    res.status(201).json({ success: true, data: assignment });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/assignments/:id', requirePermission('MANAGE_ROLES'), async (req: AuthRequest, res) => {
  try {
    const assignment = await prisma.roleAssignment.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, data: assignment });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
