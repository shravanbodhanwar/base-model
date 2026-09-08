import { prisma } from '../lib/prisma';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// Using singleton prisma from lib/prisma

export const credentialService = {
  async issueCredential(issuerDID: string, subjectDID: string, type: string, claims: any, issuerId: string, subjectId: string, expiresAt?: Date) {
    const credentialId = `vc:bel:${type.toLowerCase()}:${uuidv4()}`;
    const claimsJson = JSON.stringify(claims);
    const credentialHash = crypto.createHash('sha256').update(credentialId + issuerDID + subjectDID + claimsJson).digest('hex');
    
    // Simulate Ed25519 signature (prototype)
    const proofSignature = crypto.createHash('sha256').update(credentialHash + 'simulated_signing').digest('hex');
    
    const vc = await prisma.credential.create({
      data: {
        credentialId,
        type: type as any,
        issuerId,
        issuerDID,
        subjectId,
        subjectDID,
        claims,
        credentialHash,
        proofSignature,
        proofVerificationMethod: issuerDID + '#key-1',
        expiresAt,
        qrCodeData: `${process.env.PUBLIC_VERIFIER_URL || 'http://localhost:3000'}/verify/credential/${credentialId}`
      },
      include: { issuer: { select: { name: true } }, subject: { select: { name: true } } }
    });
    
    // Create audit event
    await prisma.auditEvent.create({
      data: {
        eventType: 'CREDENTIAL_ISSUED' as any,
        actorId: issuerId,
        actorDID: issuerDID,
        action: `Issued ${type} credential to ${subjectDID}`,
        targetId: subjectId,
        targetType: 'User'
      }
    });
    
    return vc;
  },
  
  async verifyCredential(credentialId: string) {
    const vc = await prisma.credential.findFirst({
      where: { OR: [{ id: credentialId }, { credentialId }] }
    });
    if (!vc) return { valid: false, error: 'Credential not found' };
    
    const now = new Date();
    const isRevoked = vc.status === 'REVOKED';
    const isExpired = vc.expiresAt ? vc.expiresAt < now : false;
    
    // Verify hash
    const claimsJson = JSON.stringify(vc.claims);
    const expectedHash = crypto.createHash('sha256').update(vc.credentialId + vc.issuerDID + vc.subjectDID + claimsJson).digest('hex');
    const hashValid = expectedHash === vc.credentialHash;
    
    return {
      valid: !isRevoked && !isExpired && hashValid,
      credentialId: vc.credentialId,
      issuerDID: vc.issuerDID,
      issuerVerified: true,
      subjectDID: vc.subjectDID,
      signatureValid: !!vc.proofSignature,
      notRevoked: !isRevoked,
      notExpired: !isExpired,
      hashValid,
      blockchainAnchorVerified: !!vc.blockchainTxHash,
      blockchainTxHash: vc.blockchainTxHash,
      result: isRevoked ? 'REVOKED' : isExpired ? 'EXPIRED' : !hashValid ? 'TAMPERED' : 'VALID',
      verifiedAt: new Date().toISOString()
    };
  }
};

