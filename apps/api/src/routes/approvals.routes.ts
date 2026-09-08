import { Router } from 'express';
import { PrismaClient, VoteOption } from '@prisma/client';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticateJWT);

// GET /api/approvals - list approvals
router.get('/', async (req: AuthRequest, res) => {
  try {
    const approvals = await prisma.approvalRequest.findMany({
      include: {
        votes: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: approvals });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/approvals/:id - single approval request
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const approval = await prisma.approvalRequest.findUnique({
      where: { id: req.params.id },
      include: {
        votes: true
      }
    });
    if (!approval) return res.status(404).json({ success: false, error: 'Approval request not found' });
    res.json({ success: true, data: approval });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/approvals - create approval request
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { type, title, description, requiredApprovals, linkedEntityId, linkedEntityType, metadata } = req.body;
    const request = await prisma.approvalRequest.create({
      data: {
        type: type || 'GENERAL',
        title: title || 'Approval Request',
        description,
        requestedBy: req.user!.id,
        requiredApprovals: requiredApprovals || 1,
        linkedEntityId,
        linkedEntityType,
        metadata
      }
    });
    res.status(201).json({ success: true, data: request });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/approvals/:id/vote
router.post('/:id/vote', async (req: AuthRequest, res) => {
  try {
    const { decision, comment } = req.body; // decision: 'APPROVE' or 'REJECT'
    const approval = await prisma.approvalRequest.findUnique({
      where: { id: req.params.id },
      include: { votes: true }
    });
    if (!approval) return res.status(404).json({ success: false, error: 'Approval request not found' });

    const vote = await prisma.approvalVote.create({
      data: {
        approvalRequestId: approval.id,
        voterId: req.user!.id,
        vote: decision === 'REJECT' ? VoteOption.REJECT : VoteOption.APPROVE,
        comment,
        signerDID: req.user?.dids?.[0]?.did || `did:bel:user:${req.user!.id}`
      }
    });

    const allVotes = [...approval.votes, vote];
    const approveCount = allVotes.filter(v => v.vote === VoteOption.APPROVE).length;
    const rejectCount = allVotes.filter(v => v.vote === VoteOption.REJECT).length;

    let newStatus = approval.status;
    if (approveCount >= approval.requiredApprovals) {
      newStatus = 'APPROVED';
    } else if (rejectCount > 0) {
      newStatus = 'REJECTED';
    }

    if (newStatus !== approval.status) {
      await prisma.approvalRequest.update({
        where: { id: approval.id },
        data: { status: newStatus }
      });
    }

    res.json({ success: true, data: vote });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
