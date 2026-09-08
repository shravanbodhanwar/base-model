// ============================================================
// BEL-EDIDAP Shared TypeScript Types
// PROTOTYPE / DEMONSTRATION — Not real BEL internal data
// ============================================================

// ── DID Types ─────────────────────────────────────────────────

export type DIDStatus = 'ACTIVE' | 'REVOKED' | 'DEACTIVATED' | 'COMPROMISED';
export type DIDEntityType = 'ORGANIZATION' | 'UNIT' | 'SBU' | 'EMPLOYEE' | 'VENDOR' | 'PROJECT';

export interface DIDDocument {
  id: string; // e.g. did:bel:employee:E-001
  controller: string;
  verificationMethod: VerificationMethod[];
  authentication: string[];
  assertionMethod: string[];
  created: string;
  updated: string;
  status: DIDStatus;
}

export interface VerificationMethod {
  id: string;
  type: 'Ed25519VerificationKey2020' | 'EcdsaSecp256k1VerificationKey2019';
  controller: string;
  publicKeyMultibase?: string;
  publicKeyHex?: string;
  blockchainAccountId?: string;
}

// ── Credential Types ──────────────────────────────────────────

export type CredentialStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED' | 'SUSPENDED' | 'SUPERSEDED';

export type CredentialType =
  | 'EmployeeIdentityCredential'
  | 'DepartmentMembershipCredential'
  | 'RoleCredential'
  | 'VendorRegistrationCredential'
  | 'SupplierQualificationCredential'
  | 'TrainingCertificationCredential'
  | 'SecurityClearanceCredential'
  | 'ProjectMembershipCredential'
  | 'AchievementBadgeCredential'
  | 'InspectionCertificationCredential';

export interface VerifiableCredential {
  '@context': string[];
  id: string;
  type: ['VerifiableCredential', ...string[]];
  issuer: {
    id: string; // DID
    name?: string;
  };
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: {
    id: string; // Subject DID
    [key: string]: unknown;
  };
  proof: CredentialProof;
  credentialStatus: {
    id: string;
    type: 'BelBlockchainStatus2024';
    statusListCredential?: string;
  };
}

export interface CredentialProof {
  type: 'Ed25519Signature2020';
  created: string;
  verificationMethod: string;
  proofPurpose: 'assertionMethod';
  proofValue: string;
}

export interface CredentialVerificationResult {
  valid: boolean;
  credentialId: string;
  issuerDID: string;
  issuerVerified: boolean;
  subjectDID: string;
  signatureValid: boolean;
  notRevoked: boolean;
  notExpired: boolean;
  blockchainAnchorVerified: boolean;
  blockchainTxHash?: string;
  errors: string[];
  verifiedAt: string;
}

// ── RBAC Types ────────────────────────────────────────────────

export type SystemRole =
  | 'ROOT_GOVERNANCE'
  | 'ENTERPRISE_ADMIN'
  | 'SEGMENT_ADMIN'
  | 'UNIT_ADMIN'
  | 'SBU_HEAD'
  | 'MANAGER'
  | 'PROJECT_MANAGER'
  | 'OFFICER'
  | 'INTERN'
  | 'OBSERVER'
  | 'HR_ADMIN'
  | 'PROCUREMENT_ADMIN'
  | 'SECURITY_ADMIN'
  | 'AUDITOR'
  | 'VENDOR'
  | 'EXTERNAL_VERIFIER'
  | 'GUARDIAN';

export type Permission =
  | 'CREATE_USER'
  | 'UPDATE_USER'
  | 'SUSPEND_USER'
  | 'CREATE_DID'
  | 'UPDATE_DID'
  | 'REVOKE_DID'
  | 'ROTATE_DID_KEY'
  | 'ISSUE_CREDENTIAL'
  | 'REVOKE_CREDENTIAL'
  | 'VERIFY_CREDENTIAL'
  | 'CREATE_ASSET_TEMPLATE'
  | 'MINT_ASSET'
  | 'TRANSFER_ASSET'
  | 'BURN_ASSET'
  | 'APPROVE_TRANSACTION'
  | 'VIEW_TRANSACTION'
  | 'PAUSE_CONTRACT'
  | 'DEPLOY_CONTRACT'
  | 'MANAGE_CONTRACTS'
  | 'VIEW_AUDIT_LOG'
  | 'EXPORT_AUDIT_LOG'
  | 'MANAGE_ROLES'
  | 'MANAGE_DEPARTMENTS'
  | 'MANAGE_WALLETS'
  | 'VERIFY_VENDOR'
  | 'ISSUE_VENDOR_CREDENTIAL'
  | 'APPROVE_PROCUREMENT'
  | 'ACCESS_CONFIDENTIAL_RECORD'
  | 'VIEW_DASHBOARD'
  | 'MANAGE_GOVERNANCE';

export interface RoleAssignment {
  id: string;
  userId: string;
  role: SystemRole;
  scope: OrgScope;
  grantedAt: string;
  grantedBy: string;
  expiresAt?: string;
  credentialId?: string; // linked role credential
}

export interface OrgScope {
  type: 'ENTERPRISE' | 'SEGMENT' | 'UNIT' | 'SBU' | 'PROJECT' | 'TEAM';
  id?: string;
  name?: string;
}

// ── Asset / NFT Types ─────────────────────────────────────────

export type AssetStatus = 'ACTIVE' | 'TRANSFERRED' | 'DECOMMISSIONED' | 'PENDING_APPROVAL' | 'BURNED';
export type AssetCategory =
  | 'EQUIPMENT_CUSTODY'
  | 'RD_PROTOTYPE'
  | 'TRAINING_BADGE'
  | 'INSPECTION_CERT'
  | 'DOCUMENT_NOTARIZATION';
export type AssetTransferability = 'TRANSFERABLE' | 'SOULBOUND';

export interface AssetMetadata {
  name: string;
  description: string;
  category: AssetCategory;
  unit?: string;
  sbu?: string;
  customFields?: Record<string, string | number | boolean>;
}

export interface CustodyHistoryEntry {
  from?: string;
  to: string;
  transferredAt: string;
  txHash?: string;
  approvedBy?: string;
  notes?: string;
}

// ── Governance Types ──────────────────────────────────────────

export type ProposalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'CANCELLED' | 'EXPIRED';
export type GovernanceActionType =
  | 'DEPLOY_CONTRACT'
  | 'UPGRADE_CONTRACT'
  | 'PAUSE_CONTRACT'
  | 'UNPAUSE_CONTRACT'
  | 'BURN_HIGH_VALUE_ASSET'
  | 'REVOKE_ORG_DID'
  | 'EMERGENCY_ACTION'
  | 'UPDATE_MULTISIG_CONFIG'
  | 'GRANT_CRITICAL_ROLE';

export interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  actionType: GovernanceActionType;
  proposedBy: string;
  proposedAt: string;
  expiresAt: string;
  status: ProposalStatus;
  requiredApprovals: number;
  approvals: ProposalApproval[];
  blockchainTxHash?: string;
}

export interface ProposalApproval {
  signerDID: string;
  signerName: string;
  approvedAt: string;
  signature?: string;
}

// ── Audit Types ───────────────────────────────────────────────

export type AuditEventType =
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_SUSPENDED'
  | 'USER_ACTIVATED'
  | 'DID_CREATED'
  | 'DID_KEY_ROTATED'
  | 'DID_REVOKED'
  | 'CREDENTIAL_ISSUED'
  | 'CREDENTIAL_REVOKED'
  | 'CREDENTIAL_VERIFIED'
  | 'ROLE_GRANTED'
  | 'ROLE_REVOKED'
  | 'ASSET_MINTED'
  | 'ASSET_TRANSFERRED'
  | 'ASSET_BURNED'
  | 'PROCUREMENT_APPROVED'
  | 'TRANSACTION_APPROVED'
  | 'CONTRACT_PAUSED'
  | 'CONTRACT_UNPAUSED'
  | 'LOGIN'
  | 'LOGOUT'
  | 'FAILED_AUTHORIZATION'
  | 'CONFIDENTIAL_RECORD_ACCESSED'
  | 'GOVERNANCE_PROPOSAL_CREATED'
  | 'GOVERNANCE_PROPOSAL_APPROVED'
  | 'GOVERNANCE_PROPOSAL_EXECUTED'
  | 'KEY_COMPROMISE_REPORTED'
  | 'VENDOR_REGISTERED'
  | 'ORGANIZATION_CREATED';

export interface AuditEvent {
  id: string;
  eventType: AuditEventType;
  actorId: string;
  actorDID?: string;
  actorRole: SystemRole;
  action: string;
  scope?: OrgScope;
  targetId?: string;
  targetType?: string;
  timestamp: string;
  txHash?: string;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING';
  metadataHash?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

// ── API Response Types ────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}

// ── Auth Types ────────────────────────────────────────────────

export interface JWTPayload {
  sub: string; // userId
  email: string;
  role: SystemRole;
  orgScope?: OrgScope;
  iat?: number;
  exp?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  employeeId?: string;
  role: SystemRole;
  orgScope?: OrgScope;
  did?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  avatarUrl?: string;
  unit?: string;
  sbu?: string;
}

// ── Blockchain Types ──────────────────────────────────────────

export interface BlockchainTransaction {
  txHash: string;
  blockNumber: number;
  contract: string;
  eventName: string;
  actor?: string;
  timestamp: string;
  status: 'CONFIRMED' | 'PENDING' | 'FAILED';
  gasUsed?: string;
  linkedEntity?: string;
  linkedEntityType?: string;
}

export interface ContractAddresses {
  identityRegistry: string;
  orgRegistry: string;
  roleRegistry: string;
  credentialRegistry: string;
  assetNFT: string;
  auditRegistry: string;
  governance: string;
}
