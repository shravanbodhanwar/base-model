import { Router } from 'express';
import { PrismaClient, EntityType } from '@prisma/client';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { blockchainService } from '../services/blockchain.service';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticateJWT);

// GET /api/dids - list all DIDs
router.get('/', async (req: AuthRequest, res) => {
  try {
    const dids = await prisma.dID.findMany({
      include: {
        owner: { select: { id: true, name: true, email: true, employeeId: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: dids });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/dids/:did
router.get('/:did', async (req: AuthRequest, res) => {
  try {
    const didRecord = await prisma.dID.findUnique({
      where: { did: req.params.did },
      include: {
        owner: { select: { id: true, name: true, email: true, employeeId: true } }
      }
    });
    if (!didRecord) return res.status(404).json({ success: false, error: 'DID not found' });
    res.json({ success: true, data: didRecord });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/dids - create DID
router.post('/', requirePermission('CREATE_DID'), async (req: AuthRequest, res) => {
  try {
    const { ownerId, entityType, identifier } = req.body;
    
    const typeKey = (entityType || 'EMPLOYEE').toUpperCase() as EntityType;
    const didString = `did:bel:${typeKey.toLowerCase()}:${identifier || Date.now()}`;
    const publicKeyHex = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const publicKeyMultibase = 'z' + Buffer.from(publicKeyHex).toString('base64').substring(0, 44);

    const newDid = await prisma.dID.create({
      data: {
        did: didString,
        entityType: typeKey,
        ownerId: ownerId || req.user!.id,
        publicKeyHex,
        publicKeyMultibase,
        status: 'ACTIVE'
      }
    });

    try {
      const txHash = await blockchainService.anchorDID(didString, publicKeyHex);
      if (txHash) {
        await prisma.dID.update({
          where: { id: newDid.id },
          data: { blockchainTxHash: txHash }
        });
      }
    } catch (err) {
      console.warn('Blockchain DID anchor skipped', err);
    }

    res.status(201).json({ success: true, data: newDid });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/dids/:did/rotate - key rotation
router.post('/:did/rotate', requirePermission('ROTATE_DID_KEY'), async (req: AuthRequest, res) => {
  try {
    const didRecord = await prisma.dID.findUnique({ where: { did: req.params.did } });
    if (!didRecord) return res.status(404).json({ success: false, error: 'DID not found' });

    const newPublicKeyHex = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const newPublicKeyMultibase = 'z' + Buffer.from(newPublicKeyHex).toString('base64').substring(0, 44);

    const updated = await prisma.dID.update({
      where: { did: req.params.did },
      data: {
        publicKeyHex: newPublicKeyHex,
        publicKeyMultibase: newPublicKeyMultibase,
        keyVersion: didRecord.keyVersion + 1,
        updatedAt: new Date()
      }
    });

    try {
      await blockchainService.anchorDID(updated.did, newPublicKeyHex);
    } catch (err) {
      console.warn('Blockchain anchor rotation skipped', err);
    }

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/dids/:did/revoke
router.post('/:did/revoke', requirePermission('REVOKE_DID'), async (req: AuthRequest, res) => {
  try {
    const updated = await prisma.dID.update({
      where: { did: req.params.did },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
        updatedAt: new Date()
      }
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
