import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticateJWT);

// GET / - list all proposals
router.get('/', async (_req: AuthRequest, res) => {
  try {
    const proposals = await prisma.governanceProposal.findMany({
      include: {
        approvals: {
          include: { signer: { select: { name: true, email: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: proposals });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /:id - single proposal
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const proposal = await prisma.governanceProposal.findUnique({
      where: { id: req.params.id },
      include: {
        approvals: {
          include: { signer: { select: { name: true, email: true } } }
        }
      }
    });
    if (!proposal) return res.status(404).json({ success: false, error: 'Proposal not found' });
    res.json({ success: true, data: proposal });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST / - create proposal
router.post('/', requirePermission('MANAGE_GOVERNANCE'), async (req: AuthRequest, res) => {
  try {
    const { title, description, actionType, targetContract, callDataHash, expiresInHours } = req.body;
    if (!title || !description || !actionType) {
      return res.status(400).json({ success: false, error: 'title, description, actionType required' });
    }
    const userDIDs = await prisma.dID.findFirst({ where: { ownerId: req.user!.id } });
    const expiresAt = new Date(Date.now() + (expiresInHours || 48) * 3600 * 1000);

    const proposal = await prisma.governanceProposal.create({
      data: {
        title,
        description,
        actionType,
        proposedById: req.user!.id,
        proposedByDID: userDIDs?.did,
        status: 'PENDING',
        requiredApprovals: parseInt(process.env.MULTISIG_THRESHOLD || '2'),
        expiresAt,
        targetContract: targetContract || null,
        callDataHash: callDataHash || null,
      }
    });
    res.status(201).json({ success: true, data: proposal });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /:id/approve - add approval
router.post('/:id/approve', requirePermission('MANAGE_GOVERNANCE'), async (req: AuthRequest, res) => {
  try {
    const proposal = await prisma.governanceProposal.findUnique({
      where: { id: req.params.id },
      include: { approvals: true }
    });
    if (!proposal) return res.status(404).json({ success: false, error: 'Proposal not found' });
    if (proposal.status !== 'PENDING') {
      return res.status(400).json({ success: false, error: 'Proposal is not pending' });
    }
    if (proposal.expiresAt && proposal.expiresAt < new Date()) {
      return res.status(400).json({ success: false, error: 'Proposal has expired' });
    }
    // Prevent double approval
    const alreadyApproved = proposal.approvals.some(a => a.signerUserId === req.user!.id);
    if (alreadyApproved) {
      return res.status(409).json({ success: false, error: 'Already approved by this user' });
    }

    const userDIDs = await prisma.dID.findFirst({ where: { ownerId: req.user!.id } });
    await prisma.governanceApproval.create({
      data: {
        proposalId: proposal.id,
        signerUserId: req.user!.id,
        signerDID: userDIDs?.did,
        signature: `sig:${req.user!.id}:${Date.now()}` // simulated signature
      }
    });

    // Check if threshold met
    const currentApprovals = proposal.approvals.length + 1;
    if (currentApprovals >= proposal.requiredApprovals) {
      await prisma.governanceProposal.update({
        where: { id: proposal.id },
        data: { status: 'APPROVED' }
      });
    }

    const updated = await prisma.governanceProposal.findUnique({
      where: { id: proposal.id },
      include: { approvals: { include: { signer: { select: { name: true } } } } }
    });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /:id/execute - execute approved proposal
router.post('/:id/execute', requirePermission('MANAGE_GOVERNANCE'), async (req: AuthRequest, res) => {
  try {
    const proposal = await prisma.governanceProposal.findUnique({ where: { id: req.params.id } });
    if (!proposal) return res.status(404).json({ success: false, error: 'Not found' });
    if (proposal.status !== 'APPROVED') {
      return res.status(400).json({ success: false, error: 'Proposal not approved' });
    }
    const executed = await prisma.governanceProposal.update({
      where: { id: req.params.id },
      data: { status: 'EXECUTED', executedAt: new Date() }
    });
    res.json({ success: true, data: executed });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /:id/cancel
router.post('/:id/cancel', requirePermission('MANAGE_GOVERNANCE'), async (req: AuthRequest, res) => {
  try {
    const proposal = await prisma.governanceProposal.findUnique({ where: { id: req.params.id } });
    if (!proposal) return res.status(404).json({ success: false, error: 'Not found' });
    if (proposal.status !== 'PENDING') {
      return res.status(400).json({ success: false, error: 'Can only cancel pending proposals' });
    }
    const cancelled = await prisma.governanceProposal.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' }
    });
    res.json({ success: true, data: cancelled });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
