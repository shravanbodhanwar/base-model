import { prisma } from '../lib/prisma';
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { blockchainService } from '../services/blockchain.service';

const router = Router();
// Using singleton prisma from lib/prisma
router.use(authenticateJWT);

// GET / - list assets with optional filters
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { category, status, unitId, sbuId, search } = req.query;
    const where: any = {};
    if (category) where.category = String(category);
    if (status) where.status = String(status);
    if (unitId) where.unitId = String(unitId);
    if (sbuId) where.sbuId = String(sbuId);
    if (search) where.name = { contains: String(search), mode: 'insensitive' };

    const assets = await prisma.asset.findMany({
      where,
      include: {
        owner: { select: { name: true, employeeId: true } },
        custodian: { select: { name: true } },
        unit: { select: { name: true } },
        sbu: { select: { name: true } },
        creator: { select: { name: true } }
      },
      orderBy: { mintedAt: 'desc' }
    });
    res.json({ success: true, data: assets, total: assets.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /:id - single asset
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const asset = await prisma.asset.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { name: true, employeeId: true } },
        custodian: { select: { name: true } },
        unit: { select: { name: true } },
        sbu: { select: { name: true } },
        creator: { select: { name: true } },
        transfers: {
          include: {
            initiator: { select: { name: true } },
            approver: { select: { name: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    if (!asset) return res.status(404).json({ success: false, error: 'Asset not found' });
    res.json({ success: true, data: asset });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /mint - mint a new asset
router.post('/mint', requirePermission('MINT_ASSET'), async (req: AuthRequest, res) => {
  try {
    const { name, description, category, transferability, ownerId, unitId, sbuId, metadataJson, requiresApproval } = req.body;
    if (!name || !category) {
      return res.status(400).json({ success: false, error: 'name and category are required' });
    }

    const metadataStr = JSON.stringify(metadataJson || {});
    const metadataHash = crypto.createHash('sha256').update(metadataStr).digest('hex');
    const tokenId = `BELA-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const asset = await prisma.asset.create({
      data: {
        name,
        description,
        tokenId,
        category: category as any,
        transferability: (transferability || 'TRANSFERABLE') as any,
        ownerId: ownerId || req.user!.id,
        custodianId: ownerId || req.user!.id,
        createdById: req.user!.id,
        unitId: unitId || null,
        sbuId: sbuId || null,
        metadataHash,
        metadataJson: metadataJson || {},
        mintedAt: new Date(),
        requiresApproval: requiresApproval || false,
      }
    });

    // Attempt blockchain mint (graceful degradation)
    try {
      const ownerWallet = await prisma.wallet.findFirst({ where: { userId: ownerId || req.user!.id } });
      const txHash = await blockchainService.mintAsset(
        tokenId,
        ownerWallet?.address || '0x0000000000000000000000000000000000000000',
        metadataHash
      );
      if (txHash) {
        await prisma.asset.update({ where: { id: asset.id }, data: { blockchainTxHash: txHash } });
        await prisma.transaction.create({
          data: {
            txHash,
            contract: 'AssetNFT',
            eventName: 'AssetMinted',
            eventData: { tokenId, assetId: asset.id },
            actorAddress: ownerWallet?.address,
            status: 'CONFIRMED',
            linkedEntityId: asset.id,
            linkedEntityType: 'Asset'
          }
        });
      }
    } catch (blockchainErr) {
      console.warn('[Blockchain] Asset mint anchor failed (graceful):', blockchainErr);
    }

    // Audit event
    await prisma.auditEvent.create({
      data: {
        eventType: 'ASSET_TRANSFER' as any,
        actorId: req.user!.id,
        action: `Minted asset: ${name} (tokenId: ${tokenId})`,
        targetId: asset.id,
        targetType: 'Asset'
      }
    });

    res.status(201).json({ success: true, data: asset });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /:id/transfer - initiate transfer
router.post('/:id/transfer', requirePermission('TRANSFER_ASSET'), async (req: AuthRequest, res) => {
  try {
    const { toUserId, notes } = req.body;
    if (!toUserId) return res.status(400).json({ success: false, error: 'toUserId required' });

    const asset = await prisma.asset.findUnique({ where: { id: req.params.id } });
    if (!asset) return res.status(404).json({ success: false, error: 'Asset not found' });
    if (asset.transferability === 'SOULBOUND') {
      return res.status(400).json({ success: false, error: 'Soulbound assets cannot be transferred' });
    }

    const transfer = await prisma.assetTransfer.create({
      data: {
        assetId: asset.id,
        fromUserId: asset.ownerId,
        toUserId,
        initiatedById: req.user!.id,
        status: 'PENDING',
        notes
      }
    });

    // If no approval required, auto-complete
    if (!asset.requiresApproval) {
      await prisma.assetTransfer.update({ where: { id: transfer.id }, data: { status: 'COMPLETED', completedAt: new Date(), approvedById: req.user!.id } });
      await prisma.asset.update({ where: { id: asset.id }, data: { ownerId: toUserId, custodianId: toUserId, status: 'TRANSFERRED' } });
    }

    res.status(201).json({ success: true, data: transfer });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /:id/approve-transfer - approve pending transfer
router.post('/:id/approve-transfer', requirePermission('APPROVE_TRANSACTION'), async (req: AuthRequest, res) => {
  try {
    const { transferId, approved } = req.body;
    const transfer = await prisma.assetTransfer.findUnique({ where: { id: transferId } });
    if (!transfer) return res.status(404).json({ success: false, error: 'Transfer not found' });

    if (!approved) {
      const rejected = await prisma.assetTransfer.update({ where: { id: transferId }, data: { status: 'REJECTED' } });
      return res.json({ success: true, data: rejected });
    }

    const completed = await prisma.assetTransfer.update({
      where: { id: transferId },
      data: { status: 'COMPLETED', completedAt: new Date(), approvedById: req.user!.id }
    });

    await prisma.asset.update({
      where: { id: transfer.assetId },
      data: { ownerId: transfer.toUserId, custodianId: transfer.toUserId, status: 'ACTIVE' }
    });

    res.json({ success: true, data: completed });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /:id/burn - burn/decommission asset
router.post('/:id/burn', requirePermission('BURN_ASSET'), async (req: AuthRequest, res) => {
  try {
    const asset = await prisma.asset.update({
      where: { id: req.params.id },
      data: { status: 'BURNED', burnedAt: new Date() }
    });

    await prisma.auditEvent.create({
      data: {
        eventType: 'ASSET_TRANSFER' as any,
        actorId: req.user!.id,
        action: `Burned/decommissioned asset: ${asset.name}`,
        targetId: asset.id,
        targetType: 'Asset'
      }
    });

    res.json({ success: true, data: asset });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /:id/custody-history
router.get('/:id/custody-history', async (req: AuthRequest, res) => {
  try {
    const transfers = await prisma.assetTransfer.findMany({
      where: { assetId: req.params.id },
      include: {
        initiator: { select: { name: true, employeeId: true } },
        approver: { select: { name: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json({ success: true, data: transfers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /:id/qr - generate QR code data
router.get('/:id/qr', async (req: AuthRequest, res) => {
  try {
    const verifierUrl = process.env.PUBLIC_VERIFIER_URL || 'http://localhost:3000';
    const qrCodeData = `${verifierUrl}/verify/asset/${req.params.id}`;
    res.json({ success: true, data: { qrCodeData, url: qrCodeData } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

