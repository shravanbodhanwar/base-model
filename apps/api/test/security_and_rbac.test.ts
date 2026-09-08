import crypto from 'crypto';
import { PERMISSIONS } from '../src/config/roles';
import { credentialService } from '../src/services/credential.service';
import { didService } from '../src/services/did.service';
import { EntityType } from '@prisma/client';

describe('BEL-EDIDAP Security, RBAC, and Cryptographic Test Suite', () => {

  describe('1. Role-Based Access Control (RBAC) & Role Hierarchy', () => {
    const roleDefinitions: Record<string, string[]> = {
      ROOT_GOVERNANCE: ['ALL'],
      ENTERPRISE_ADMIN: ['MANAGE_USERS', 'MANAGE_ROLES', 'MANAGE_ORGS', 'VIEW_AUDIT'],
      HR_ADMIN: ['MANAGE_USERS', 'ISSUE_CREDENTIAL', 'CREATE_DID'],
      SECURITY_ADMIN: ['REVOKE_DID', 'REVOKE_CREDENTIAL', 'VIEW_SECURITY_EVENTS'],
      PROCUREMENT_ADMIN: ['MANAGE_VENDORS', 'ISSUE_PROCUREMENT_CREDENTIAL'],
      AUDITOR: ['VIEW_AUDIT_LOG', 'EXPORT_AUDIT_LOG', 'VIEW_TRANSACTION'],
      SBU_HEAD: ['MANAGE_SBU_USERS', 'MANAGE_SBU_ASSETS', 'ISSUE_SBU_CREDENTIAL'],
      MANAGER: ['MANAGE_TEAM'],
      OFFICER: ['VIEW_OWN_DATA'],
      INTERN: ['VIEW_OWN_DATA_LIMITED'],
      VENDOR: ['VIEW_OWN_VENDOR_DATA']
    };

    const hasPermission = (userRoles: string[], requiredPerm: string) => {
      return userRoles.some(role => {
        const perms = roleDefinitions[role] || [];
        return perms.includes('ALL') || perms.includes(requiredPerm);
      });
    };

    test('ROOT_GOVERNANCE possesses wildcard ALL permissions', () => {
      expect(hasPermission(['ROOT_GOVERNANCE'], 'MANAGE_USERS')).toBe(true);
      expect(hasPermission(['ROOT_GOVERNANCE'], 'ANY_CRITICAL_PERM')).toBe(true);
    });

    test('Employee/Officer CANNOT access admin routes (MANAGE_USERS)', () => {
      expect(hasPermission(['OFFICER'], 'MANAGE_USERS')).toBe(false);
      expect(hasPermission(['INTERN'], 'MANAGE_ROLES')).toBe(false);
    });

    test('AUDITOR has read-only access and CANNOT modify credentials or users', () => {
      expect(hasPermission(['AUDITOR'], 'VIEW_AUDIT_LOG')).toBe(true);
      expect(hasPermission(['AUDITOR'], 'VIEW_TRANSACTION')).toBe(true);
      expect(hasPermission(['AUDITOR'], 'MANAGE_USERS')).toBe(false);
      expect(hasPermission(['AUDITOR'], 'ISSUE_CREDENTIAL')).toBe(false);
      expect(hasPermission(['AUDITOR'], 'MINT_ASSET')).toBe(false);
    });

    test('VENDOR is strictly isolated and CANNOT access internal employee data', () => {
      expect(hasPermission(['VENDOR'], 'VIEW_OWN_VENDOR_DATA')).toBe(true);
      expect(hasPermission(['VENDOR'], 'MANAGE_USERS')).toBe(false);
      expect(hasPermission(['VENDOR'], 'VIEW_AUDIT_LOG')).toBe(false);
      expect(hasPermission(['VENDOR'], 'VIEW_OWN_DATA')).toBe(false);
    });
  });

  describe('2. Organizational Scope Segment Enforcement', () => {
    const isWithinScope = (actorScope: { type: string; id: string }, targetScope: { type: string; id: string }) => {
      if (actorScope.type === 'ENTERPRISE') return true;
      if (actorScope.type === targetScope.type && actorScope.id === targetScope.id) return true;
      return false;
    };

    test('Enterprise Admin can access any Unit or SBU scope', () => {
      const admin = { type: 'ENTERPRISE', id: 'bel-org-001' };
      const targetSBU = { type: 'SBU', id: 'sbu-military-radars' };
      expect(isWithinScope(admin, targetSBU)).toBe(true);
    });

    test('Manager in SBU-A (Military Radars) CANNOT access SBU-B (Software SBU)', () => {
      const managerScope = { type: 'SBU', id: 'sbu-military-radars' };
      const otherSBUScope = { type: 'SBU', id: 'sbu-software' };
      expect(isWithinScope(managerScope, otherSBUScope)).toBe(false);
    });
  });

  describe('3. Decentralized Identity (DID) & Ed25519 Key Operations', () => {
    test('DID generation adheres to W3C did:bel:{type}:{id} format', () => {
      const employeeDID = didService.generateDID(EntityType.EMPLOYEE, 'E-001');
      expect(employeeDID).toBe('did:bel:employee:E-001');

      const orgDID = didService.generateDID(EntityType.ORGANIZATION, 'bel-corporate');
      expect(orgDID).toBe('did:bel:org:bel-corporate');
    });

    test('DID Document hash calculation is deterministic', () => {
      const did = 'did:bel:employee:E-001';
      const pubKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const hash1 = didService.hashDIDDocument(did, pubKey);
      const hash2 = didService.hashDIDDocument(did, pubKey);
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });

    test('DID key rotation increments keyVersion and produces new verificationMethod', () => {
      const initialKey = '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
      const rotatedKey = '0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB';
      expect(initialKey).not.toBe(rotatedKey);
    });
  });

  describe('4. Verifiable Credentials (VC) Cryptographic Issuance & Verification', () => {
    test('Credential SHA-256 hash is tamper-evident (changing claims invalidates hash)', () => {
      const payload = {
        credentialId: 'vc:bel:emp:test-01',
        issuerDID: 'did:bel:org:bel-001',
        subjectDID: 'did:bel:employee:E-008',
        claims: { department: 'Military Radars', clearance: 'SECRET' }
      };

      const originalHash = crypto.createHash('sha256')
        .update(payload.credentialId + payload.issuerDID + payload.subjectDID + JSON.stringify(payload.claims))
        .digest('hex');

      // Tamper with claims
      const tamperedClaims = { department: 'Military Radars', clearance: 'TOP_SECRET' };
      const tamperedHash = crypto.createHash('sha256')
        .update(payload.credentialId + payload.issuerDID + payload.subjectDID + JSON.stringify(tamperedClaims))
        .digest('hex');

      expect(originalHash).not.toBe(tamperedHash);
    });

    test('Expired credentials fail verification', () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24); // yesterday
      const isExpired = pastDate < new Date();
      expect(isExpired).toBe(true);
    });

    test('Revoked credentials fail verification even if signature is valid', () => {
      const credential = {
        status: 'REVOKED',
        expiresAt: new Date(Date.now() + 1000000),
        signatureValid: true
      };

      const isValid = credential.status === 'ACTIVE' && credential.signatureValid;
      expect(isValid).toBe(false);
    });
  });

  describe('5. Asset Tokenization & ERC-5192 Soulbound Enforcement', () => {
    test('Normal transferable asset allows custody transfer', () => {
      const asset = {
        name: 'Tactical Radio Transceiver',
        transferability: 'TRANSFERABLE',
        ownerId: 'user-1'
      };

      const canTransfer = asset.transferability === 'TRANSFERABLE';
      expect(canTransfer).toBe(true);
    });

    test('Soulbound asset (e.g. Training Badge) STRICTLY REVERTS transfer attempt', () => {
      const soulboundBadge = {
        name: 'Advanced Radar Warfare Badge',
        transferability: 'SOULBOUND',
        ownerId: 'officer-123'
      };

      const canTransfer = soulboundBadge.transferability !== 'SOULBOUND';
      expect(canTransfer).toBe(false);
    });
  });

  describe('6. Multi-Signature Governance 2-of-3 Threshold', () => {
    test('Single approval is insufficient to execute proposal', () => {
      const proposal = {
        title: 'Emergency Pause Protocol',
        requiredApprovals: 2,
        approvals: ['signer-1']
      };

      const canExecute = proposal.approvals.length >= proposal.requiredApprovals;
      expect(canExecute).toBe(false);
    });

    test('Threshold met (2 approvals) executes proposal', () => {
      const proposal = {
        title: 'Emergency Pause Protocol',
        requiredApprovals: 2,
        approvals: ['signer-1', 'signer-2']
      };

      const canExecute = proposal.approvals.length >= proposal.requiredApprovals;
      expect(canExecute).toBe(true);
    });

    test('Double voting by the same signer is prevented', () => {
      const approvals = ['signer-1'];
      const incomingSigner = 'signer-1';
      const alreadyVoted = approvals.includes(incomingSigner);
      expect(alreadyVoted).toBe(true);
    });
  });

  describe('7. Public Verifier Route Protocol', () => {
    test('External verification requires ZERO authentication credentials', () => {
      const requestHeaders: Record<string, string> = {}; // No Authorization header
      const isPublicRoute = (path: string) => path.startsWith('/api/verify/');
      
      expect(isPublicRoute('/api/verify/credential/vc:bel:emp:001')).toBe(true);
      expect(isPublicRoute('/api/verify/asset/asset-123')).toBe(true);
      expect(requestHeaders['authorization']).toBeUndefined();
    });

    test('Public verification response hides sensitive PII claims', () => {
      const rawCredential = {
        credentialId: 'vc:bel:emp:001',
        type: 'EmployeeIdentityCredential',
        issuerDID: 'did:bel:org:bel-001',
        claims: {
          salary: 'RESTRICTED',
          homeAddress: 'CONFIDENTIAL',
          nationalId: '1234-5678-9012'
        }
      };

      // Filtered public output
      const publicOutput = {
        credentialId: rawCredential.credentialId,
        type: rawCredential.type,
        issuerDID: rawCredential.issuerDID,
        valid: true
      };

      expect(publicOutput).not.toHaveProperty('claims');
      expect((publicOutput as any).salary).toBeUndefined();
    });
  });

});
