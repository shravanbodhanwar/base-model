import { Status, EntityType, WalletType, OrgType, ScopeType, CredentialType, AssetCategory, Transferability, VoteOption, EventType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma';

export async function seedDatabase() {
  console.log('Starting seed [SIMULATED] via PGlite adapter...');

  // Roles
  const rolesData = [
    { name: 'ROOT_GOVERNANCE', displayName: 'Root Governance', permissions: ['ALL'] },
    { name: 'ENTERPRISE_ADMIN', displayName: 'Enterprise Admin', permissions: ['MANAGE_USERS', 'MANAGE_ROLES', 'MANAGE_ORGS', 'VIEW_AUDIT'] },
    { name: 'HR_ADMIN', displayName: 'HR Admin', permissions: ['MANAGE_USERS', 'ISSUE_CREDENTIAL', 'CREATE_DID'] },
    { name: 'SECURITY_ADMIN', displayName: 'Security Admin', permissions: ['REVOKE_DID', 'REVOKE_CREDENTIAL', 'VIEW_SECURITY_EVENTS'] },
    { name: 'PROCUREMENT_ADMIN', displayName: 'Procurement Admin', permissions: ['MANAGE_VENDORS', 'ISSUE_PROCUREMENT_CREDENTIAL'] },
    { name: 'AUDITOR', displayName: 'Auditor', permissions: ['VIEW_AUDIT_LOG', 'EXPORT_AUDIT_LOG', 'VIEW_TRANSACTION'] },
    { name: 'SBU_HEAD', displayName: 'SBU Head', permissions: ['MANAGE_SBU_USERS', 'MANAGE_SBU_ASSETS', 'ISSUE_SBU_CREDENTIAL'] },
    { name: 'MANAGER', displayName: 'Manager', permissions: ['MANAGE_TEAM'] },
    { name: 'OFFICER', displayName: 'Officer', permissions: ['VIEW_OWN_DATA'] },
    { name: 'INTERN', displayName: 'Intern', permissions: ['VIEW_OWN_DATA_LIMITED'] },
    { name: 'VENDOR', displayName: 'Vendor', permissions: ['VIEW_OWN_VENDOR_DATA'] }
  ];

  const roles: Record<string, any> = {};
  for (const r of rolesData) {
    roles[r.name] = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
  }

  // Organizations
  const belOrg = await prisma.organization.create({
    data: { name: 'Bharat Electronics Limited - SIMULATED', shortName: 'BEL', orgType: OrgType.ORGANIZATION, did: 'did:bel:org:bel-001' }
  });

  const defenceSeg = await prisma.organization.create({
    data: { name: 'Defence', shortName: 'DEF', orgType: OrgType.SEGMENT, did: 'did:bel:seg:def-001' }
  });
  const nonDefenceSeg = await prisma.organization.create({
    data: { name: 'Non-Defence', shortName: 'NDEF', orgType: OrgType.SEGMENT, did: 'did:bel:seg:ndef-001' }
  });

  // Units
  const bangaloreUnit = await prisma.unit.create({
    data: { organizationId: belOrg.id, name: 'Bangalore (Defence)', shortName: 'BG', city: 'Bangalore', did: 'did:bel:unit:bg-001' }
  });
  const hyderabadUnit = await prisma.unit.create({
    data: { organizationId: belOrg.id, name: 'Hyderabad (Defence)', shortName: 'HYD', city: 'Hyderabad', did: 'did:bel:unit:hyd-001' }
  });
  const puneUnit = await prisma.unit.create({
    data: { organizationId: belOrg.id, name: 'Pune (Non-Defence)', shortName: 'PUN', city: 'Pune', did: 'did:bel:unit:pun-001' }
  });

  // SBUs
  const milRadarSBU = await prisma.sBU.create({
    data: { unitId: bangaloreUnit.id, name: 'Military Radars SBU', shortName: 'MR', did: 'did:bel:sbu:mr-001' }
  });
  const ewSBU = await prisma.sBU.create({
    data: { unitId: bangaloreUnit.id, name: 'Electronic Warfare & Avionics SBU', shortName: 'EW', did: 'did:bel:sbu:ew-001' }
  });
  const swSBU = await prisma.sBU.create({
    data: { unitId: bangaloreUnit.id, name: 'Software SBU', shortName: 'SW', did: 'did:bel:sbu:sw-001' }
  });
  const navSBU = await prisma.sBU.create({
    data: { unitId: bangaloreUnit.id, name: 'Naval Systems SBU', shortName: 'NS', did: 'did:bel:sbu:ns-001' }
  });
  const commSBU = await prisma.sBU.create({
    data: { unitId: hyderabadUnit.id, name: 'Communication Systems SBU', shortName: 'CS', did: 'did:bel:sbu:cs-001' }
  });
  const ceSBU = await prisma.sBU.create({
    data: { unitId: puneUnit.id, name: 'Consumer Electronics SBU', shortName: 'CE', did: 'did:bel:sbu:ce-001' }
  });

  const passwordHash = await bcrypt.hash('Demo@1234', 10);

  const usersData = [
    { email: 'root@bel-demo.in', name: 'Root Gov', role: 'ROOT_GOVERNANCE', scopeType: ScopeType.ENTERPRISE, scopeId: belOrg.id, employeeId: 'E-001' },
    { email: 'admin@bel-demo.in', name: 'Admin', role: 'ENTERPRISE_ADMIN', scopeType: ScopeType.ENTERPRISE, scopeId: belOrg.id, employeeId: 'E-002' },
    { email: 'hr@bel-demo.in', name: 'HR Admin', role: 'HR_ADMIN', scopeType: ScopeType.SBU, scopeId: swSBU.id, employeeId: 'E-003' },
    { email: 'security@bel-demo.in', name: 'Security Admin', role: 'SECURITY_ADMIN', scopeType: ScopeType.ENTERPRISE, scopeId: belOrg.id, employeeId: 'E-004' },
    { email: 'procurement@bel-demo.in', name: 'Procurement Admin', role: 'PROCUREMENT_ADMIN', scopeType: ScopeType.ENTERPRISE, scopeId: belOrg.id, employeeId: 'E-005' },
    { email: 'sbuhead@bel-demo.in', name: 'SBU Head MR', role: 'SBU_HEAD', scopeType: ScopeType.SBU, scopeId: milRadarSBU.id, employeeId: 'E-006' },
    { email: 'manager@bel-demo.in', name: 'Manager MR', role: 'MANAGER', scopeType: ScopeType.SBU, scopeId: milRadarSBU.id, employeeId: 'E-007' },
    { email: 'employee@bel-demo.in', name: 'Employee MR', role: 'OFFICER', scopeType: ScopeType.SBU, scopeId: milRadarSBU.id, employeeId: 'E-008' },
    { email: 'intern@bel-demo.in', name: 'Intern SW', role: 'INTERN', scopeType: ScopeType.SBU, scopeId: swSBU.id, employeeId: 'E-009' },
    { email: 'auditor@bel-demo.in', name: 'Auditor', role: 'AUDITOR', scopeType: ScopeType.ENTERPRISE, scopeId: belOrg.id, employeeId: 'E-010' },
    { email: 'vendor@bel-demo.in', name: 'Vendor 1', role: 'VENDOR', scopeType: ScopeType.EXTERNAL, scopeId: null, employeeId: 'V-001' }
  ];

  const createdUsers: Record<string, any> = {};

  for (const u of usersData) {
    const user = await prisma.user.create({
      data: {
        email: u.email,
        passwordHash,
        name: u.name,
        employeeId: u.employeeId,
      }
    });
    createdUsers[u.email] = user;

    await prisma.roleAssignment.create({
      data: {
        userId: user.id,
        roleId: roles[u.role].id,
        scopeType: u.scopeType,
        scopeId: u.scopeId,
        grantedBy: 'system'
      }
    });

    const didString = `did:bel:employee:${u.employeeId}`;
    await prisma.dID.create({
      data: {
        did: didString,
        entityType: EntityType.EMPLOYEE,
        ownerId: user.id,
      }
    });

    await prisma.wallet.create({
      data: {
        userId: user.id,
        address: `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`,
        type: WalletType.SIMULATED,
        encryptedPrivateKey: 'simulated_pk_placeholder'
      }
    });
  }

  // Assets
  const mrAdmin = createdUsers['sbuhead@bel-demo.in'];
  await prisma.asset.create({
    data: {
      name: 'MR Radar Component X',
      category: AssetCategory.HARDWARE,
      createdById: mrAdmin.id,
      ownerId: mrAdmin.id,
      sbuId: milRadarSBU.id,
    }
  });

  await prisma.asset.create({
    data: {
      name: 'SW License A',
      category: AssetCategory.SOFTWARE,
      createdById: createdUsers['hr@bel-demo.in'].id,
      ownerId: createdUsers['hr@bel-demo.in'].id,
      sbuId: swSBU.id,
    }
  });

  await prisma.asset.create({
    data: {
      name: 'Office Badge',
      category: AssetCategory.ACCESS_BADGE,
      transferability: Transferability.SOULBOUND,
      createdById: mrAdmin.id,
      ownerId: createdUsers['employee@bel-demo.in'].id,
      sbuId: milRadarSBU.id,
    }
  });

  // Credential
  await prisma.credential.create({
    data: {
      credentialId: 'vc:bel:emp:001',
      type: CredentialType.IDENTITY,
      issuerId: createdUsers['admin@bel-demo.in'].id,
      issuerDID: 'did:bel:employee:E-002',
      subjectId: createdUsers['employee@bel-demo.in'].id,
      subjectDID: 'did:bel:employee:E-008',
      claims: { department: 'Engineering' }
    }
  });

  // Audit
  await prisma.auditEvent.create({
    data: {
      eventType: EventType.SYSTEM_CONFIG,
      actorId: createdUsers['root@bel-demo.in'].id,
      action: 'SYSTEM_INIT',
      scopeType: ScopeType.ENTERPRISE,
    }
  });

  console.log('Seed completed successfully via PGlite adapter.');
}

if (require.main === module) {
  const { ensureDatabase } = require('../src/lib/prisma');
  ensureDatabase()
    .then(() => {
      console.log('Database schema and seed complete.');
    })
    .catch((e: unknown) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
