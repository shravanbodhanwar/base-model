import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { blockchainService } from '../services/blockchain.service';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticateJWT);

router.get('/transactions', requirePermission('VIEW_TRANSACTION'), async (req: AuthRequest, res) => {
  try {
    const txs = await prisma.transaction.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100
    });
    res.json({ success: true, data: txs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/transactions/:txHash', requirePermission('VIEW_TRANSACTION'), async (req: AuthRequest, res) => {
  try {
    const tx = await prisma.transaction.findUnique({
      where: { txHash: req.params.txHash }
    });
    if (!tx) return res.status(404).json({ success: false, error: 'Transaction not found' });
    res.json({ success: true, data: tx });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/status', async (req: AuthRequest, res) => {
  try {
    const status = await blockchainService.getStatus();
    res.json({ success: true, data: status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/contracts', async (req: AuthRequest, res) => {
  try {
    const contracts = await blockchainService.getContractAddresses();
    res.json({ success: true, data: contracts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
