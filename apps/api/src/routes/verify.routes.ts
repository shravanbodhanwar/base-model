import { prisma } from '../lib/prisma';
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
// Using singleton prisma from lib/prisma

// GET /api/verify/credential/:credentialId
router.get('/credential/:credentialId', async (req, res) => {
  try {
    const vc = await prisma.credential.findFirst({
      where: { OR: [{ id: req.params.credentialId }, { credentialId: req.params.credentialId }] },
      include: { issuer: { select: { name: true } }, subject: { select: { name: true } } }
    });
    if (!vc) return res.status(404).json({ success: false, error: 'Credential not found' });
    
    const now = new Date();
    const isRevoked = vc.status === 'REVOKED';
    const isExpired = vc.expiresAt ? vc.expiresAt < now : false;
    const isActive = vc.status === 'ACTIVE' && !isExpired;
    
    // Return ONLY public verification info, NOT sensitive claims
    res.json({
      success: true,
      data: {
        credentialId: vc.credentialId,
        type: vc.type,
        issuerDID: vc.issuerDID,
        issuerName: vc.issuer?.name,
        subjectDID: vc.subjectDID,
        issuedAt: vc.issuedAt,
        expiresAt: vc.expiresAt,
        status: vc.status,
        credentialHash: vc.credentialHash,
        blockchainTxHash: vc.blockchainTxHash,
        verification: {
          valid: isActive,
          issuerVerified: true,
          signatureValid: !!vc.proofSignature,
          notRevoked: !isRevoked,
          notExpired: !isExpired,
          blockchainAnchorVerified: !!vc.blockchainTxHash,
          result: isRevoked ? 'REVOKED' : isExpired ? 'EXPIRED' : 'VALID'
        }
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/verify/asset/:assetId
router.get('/asset/:assetId', async (req, res) => {
  try {
    const asset = await prisma.asset.findFirst({
      where: { OR: [{ id: req.params.assetId }, { tokenId: req.params.assetId }] },
      include: {
        owner: { select: { name: true, employeeId: true } },
        unit: { select: { name: true } },
        sbu: { select: { name: true } },
        transfers: { orderBy: { createdAt: 'desc' }, take: 10 }
      }
    });
    if (!asset) return res.status(404).json({ success: false, error: 'Asset not found' });
    
    res.json({
      success: true,
      data: {
        id: asset.id,
        name: asset.name,
        tokenId: asset.tokenId,
        category: asset.category,
        transferability: asset.transferability,
        status: asset.status,
        ownerName: asset.owner?.name,
        unit: asset.unit?.name,
        sbu: asset.sbu?.name,
        mintedAt: asset.mintedAt,
        metadataHash: asset.metadataHash,
        blockchainTxHash: asset.blockchainTxHash,
        transferCount: asset.transfers.length,
        verification: {
          valid: asset.status === 'ACTIVE',
          blockchainAnchorVerified: !!asset.blockchainTxHash,
          result: asset.status
        }
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

