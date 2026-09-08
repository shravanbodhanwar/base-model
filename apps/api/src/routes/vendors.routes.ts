import { prisma } from '../lib/prisma';
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = Router();
// Using singleton prisma from lib/prisma
router.use(authenticateJWT);

router.get('/', requirePermission('MANAGE_VENDORS'), async (req: AuthRequest, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        creator: { select: { name: true, email: true } },
        linkedUser: { select: { name: true, email: true, dids: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: vendors });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', requirePermission('MANAGE_VENDORS'), async (req: AuthRequest, res) => {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: req.params.id },
      include: {
        creator: { select: { name: true, email: true } },
        linkedUser: { select: { name: true, email: true, dids: true } }
      }
    });
    if (!vendor) return res.status(404).json({ success: false, error: 'Vendor not found' });
    res.json({ success: true, data: vendor });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', requirePermission('MANAGE_VENDORS'), async (req: AuthRequest, res) => {
  try {
    const { name, registrationNumber, contactEmail, contactPhone, address, qualificationStatus, userId } = req.body;
    const did = `did:bel:vendor:${registrationNumber || Date.now()}`;
    const vendor = await prisma.vendor.create({
      data: {
        name,
        registrationNumber,
        contactEmail,
        contactPhone,
        address,
        qualificationStatus: qualificationStatus || 'PENDING',
        createdById: req.user!.id,
        userId,
        did
      }
    });
    res.status(201).json({ success: true, data: vendor });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/:id', requirePermission('MANAGE_VENDORS'), async (req: AuthRequest, res) => {
  try {
    const { name, contactEmail, contactPhone, address, qualificationStatus, status } = req.body;
    const vendor = await prisma.vendor.update({
      where: { id: req.params.id },
      data: { name, contactEmail, contactPhone, address, qualificationStatus, status }
    });
    res.json({ success: true, data: vendor });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/:id/verify', requirePermission('MANAGE_VENDORS'), async (req: AuthRequest, res) => {
  try {
    const vendor = await prisma.vendor.update({
      where: { id: req.params.id },
      data: { qualificationStatus: 'QUALIFIED', status: 'ACTIVE' }
    });
    res.json({ success: true, data: vendor });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

