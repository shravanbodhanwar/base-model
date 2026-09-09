import { prisma } from '../lib/prisma';
import { Router } from 'express';
import { CredentialType } from '@prisma/client';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { credentialService } from '../services/credential.service';

const router = Router();
// Using singleton prisma from lib/prisma
router.use(authenticateJWT);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const isAdmin = req.user?.roleAssignments?.some((r: any) =>
      r.role.permissions.includes('ALL') || r.role.permissions.includes('MANAGE_CREDENTIALS') || r.role.permissions.includes('VIEW_AUDIT'));
    
    const take = req.query.take ? parseInt(req.query.take as string) : 50;
    const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;
    
    let whereClause = {};
    if (!isAdmin) {
      whereClause = {
        OR: [
          { subjectId: req.user!.id },
          { issuerId: req.user!.id }
        ]
      };
    }

    const credentials = await prisma.credential.findMany({
      where: whereClause,
      include: {
        issuer: { select: { name: true } },
        subject: { select: { name: true } }
      },
      orderBy: { issuedAt: 'desc' },
      take,
      skip
    });
    res.json({ success: true, data: credentials });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/issue', requirePermission('ISSUE_CREDENTIAL'), async (req: AuthRequest, res) => {
  try {
    const { subjectDID, type, claims, subjectId, expiresAt } = req.body;
    if (!subjectId || !subjectDID || !type || !claims || typeof claims !== 'object' || Array.isArray(claims)) {
      return res.status(400).json({ success: false, error: 'subjectId, subjectDID, type, and a JSON claims object are required' });
    }
    const subject = await prisma.user.findUnique({ where: { id: subjectId }, select: { id: true } });
    if (!subject) return res.status(404).json({ success: false, error: 'Credential subject not found' });
    const parsedExpiry = expiresAt ? new Date(expiresAt) : undefined;
    if (parsedExpiry && Number.isNaN(parsedExpiry.getTime())) {
      return res.status(400).json({ success: false, error: 'expiresAt must be a valid date' });
    }

    // The issuer is always the authenticated user. Deriving their DID on the
    // server prevents a caller from forging another employee as the issuer.
    const issuerDID = (await prisma.dID.findFirst({ where: { ownerId: req.user!.id, status: 'ACTIVE' } }))?.did
      || `did:bel:employee:${req.user!.employeeId || req.user!.id}`;
    const schemaTypes: Record<string, CredentialType> = {
      EmployeeIdentityCredential: 'IDENTITY',
      DepartmentMembershipCredential: 'ROLE',
      RoleCredential: 'ROLE',
      SecurityClearanceCredential: 'QUALIFICATION',
      TrainingCertificationCredential: 'QUALIFICATION',
      ProjectMembershipCredential: 'ROLE',
      VendorRegistrationCredential: 'IDENTITY',
      SupplierQualificationCredential: 'QUALIFICATION',
    };
    const credentialType = schemaTypes[type] || (Object.values(CredentialType).includes(type) ? type as CredentialType : null);
    if (!credentialType) {
      return res.status(400).json({ success: false, error: 'Unsupported credential schema' });
    }

    const vc = await credentialService.issueCredential(
      issuerDID,
      subjectDID,
      credentialType,
      { ...claims, credentialSchema: type },
      req.user!.id,
      subjectId,
      parsedExpiry
    );
    res.status(201).json({ success: true, data: vc });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/:id/revoke', requirePermission('REVOKE_CREDENTIAL'), async (req: AuthRequest, res) => {
  try {
    const vc = await prisma.credential.update({
      where: { id: req.params.id },
      data: { status: 'REVOKED' }
    });
    res.json({ success: true, data: vc });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const vc = await prisma.credential.findUnique({
      where: { id: req.params.id },
      include: { issuer: { select: { name: true } }, subject: { select: { name: true } } }
    });
    if (!vc) return res.status(404).json({ success: false, error: 'Not found' });
    
    const isAdmin = req.user?.roleAssignments?.some((r: any) =>
      r.role.permissions.includes('ALL') || r.role.permissions.includes('MANAGE_CREDENTIALS'));
      
    if (!isAdmin && vc.subjectId !== req.user!.id && vc.issuerId !== req.user!.id) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    
    res.json({ success: true, data: vc });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

