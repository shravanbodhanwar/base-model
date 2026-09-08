# BEL-EDIDAP
### BEL Enterprise Decentralized Identity & Digital Asset Platform

> [!IMPORTANT]
> **ACADEMIC & DEMONSTRATION DISCLAIMER**
> This project is a **college seminar / practice school prototype**, using **Bharat Electronics Limited (BEL)** purely as an organizational context for enterprise architecture.
> **This is NOT internal BEL software, nor does it contain real BEL data, employee records, defence telemetry, or classified specifications.** All organizational units, employees, security clearance levels, and assets are simulated for technical demonstration.

---

## 1. System Overview

BEL-EDIDAP is a full-stack, enterprise-grade Web3 platform designed for aerospace and defence manufacturing organizations. It integrates:
1. **Decentralized Identity (W3C DID)** — Self-sovereign cryptographic identities for employees, SBUs, and contractors.
2. **Verifiable Credentials (W3C VC)** — Cryptographically signed, off-chain tamper-evident qualifications, training certifications, and security clearances.
3. **Scoped Role-Based Access Control (RBAC)** — Strict multi-tier organizational segregation (Enterprise, Unit, Strategic Business Unit).
4. **Digital Asset Custody (ERC-721 & ERC-5192 Soulbound)** — Immutable tracking of defence equipment, prototypes, and non-transferable training badges.
5. **Multi-Signature Governance (2-of-3 Council)** — Cryptographic threshold approval for critical operations and smart contract pausing.
6. **Zero-PII Public Verifier** — External zero-knowledge/proof verification of certificates without exposing classified or personal data.

```
+-----------------------------------------------------------------------------------+
|                                 BEL-EDIDAP ARCHITECTURE                           |
+-----------------------------------------------------------------------------------+
|  FRONTEND: Next.js 14 (App Router) + Tailwind CSS + Lucide Icons (Port 3000)       |
|  - Enterprise Dark Navy Theme (#0A0F1E)                                           |
|  - Role-Aware Dashboards & Visual Trust Hierarchy                                  |
|  - Public Zero-Auth Verifier (/verify/credential/:id, /verify/asset/:id)          |
+-----------------------------------------------------------------------------------+
                                         │  REST API / JWT / Scoped RBAC
                                         ▼
+-----------------------------------------------------------------------------------+
|  BACKEND API: Express.js + TypeScript + Prisma ORM (Port 3001)                    |
|  - Scoped RBAC Middleware & W3C Ed25519 Signing Service                           |
|  - Audit Trail Engine (Append-Only Event Hashing)                                 |
|  - PostgreSQL Persistence (Off-Chain Claims, Profiles, Custody History)           |
+-----------------------------------------------------------------------------------+
                                         │  JSON-RPC (Ethers.js v6)
                                         ▼
+-----------------------------------------------------------------------------------+
|  SMART CONTRACTS: Solidity 0.8.24 (Cancun EVM) + OpenZeppelin v5 (Hardhat/Besu)   |
|  - IdentityRegistry: DID Document hashes & public key rotation                    |
|  - OrganizationRegistry: Corporate anchors (BEL Root -> Units -> SBUs)            |
|  - RoleRegistry: On-chain role bindings & authority hierarchy                     |
|  - CredentialRegistry: Status anchors (ACTIVE, REVOKED, EXPIRED)                  |
|  - AssetNFT: ERC-721 Custody & ERC-5192 Soulbound Reversion Rules                 |
|  - AuditRegistry: Tamper-evident SHA-256 state anchors                            |
|  - Governance: 2-of-3 Multisig Threshold Consensus Engine                         |
+-----------------------------------------------------------------------------------+
```

---

## 2. Key Architectural Decisions

### A. Why Permissioned Ledger (Hyperledger Besu / Hardhat Local) vs Public Ethereum?
- **Zero Gas Cost & Predictable Throughput**: High-frequency equipment handovers and credential verification cannot depend on volatile gas markets.
- **Defence Data Sovereignty**: Internal organizational hashes must remain within enterprise or sovereign cloud boundaries.
- **IBFT 2.0 Instant Finality**: Transactions achieve immediate finality without fork reorganizations.

### B. Why Decentralized Identity (DID) over Traditional Centralized PKI?
- Traditional PKI creates single-point-of-failure Certificate Authorities (CAs).
- W3C DIDs (`did:bel:employee:E-001`) allow individuals and units to retain cryptographic autonomy and key rotation without breaking dependent verification links.

### C. On-Chain vs Off-Chain Data Segregation
| Layer | Stored Data | Security Guarantee |
|---|---|---|
| **On-Chain (Ledger)** | DID hashes, Credential SHA-256 digests, Revocation statuses, Token IDs, Custody history, Multisig votes | **Zero PII**, Immutable, Tamper-Evident |
| **Off-Chain (Database)** | Employee names, emails, clear text claims, equipment technical notes, CAD metadata | Encrypted, Access-Controlled via Scoped RBAC |

### D. Why ERC-5192 Soulbound Tokens?
Defence training qualifications, security clearance badges, and equipment certifications must **never** be transferable to third parties. The smart contract reverts any `transferFrom` invocation for soulbound tokens.

---

## 3. Demo Accounts & Credentials

All demo accounts share the demonstration password: **`Demo@1234`**

| # | Email | System Role | Organizational Scope | Key Capabilities |
|---|---|---|---|---|
| 1 | `root@bel-demo.in` | `ROOT_GOVERNANCE` | Enterprise (BEL Root) | Wildcard `ALL` permissions, Multisig Council |
| 2 | `admin@bel-demo.in` | `ENTERPRISE_ADMIN` | Enterprise (BEL Root) | User management, Role assignments, Org tree |
| 3 | `hr@bel-demo.in` | `HR_ADMIN` | Bangalore / Software SBU | Employee onboarding, DID creation, VC issuance |
| 4 | `security@bel-demo.in` | `SECURITY_ADMIN` | Enterprise (BEL Root) | Credential & DID revocation, Security audits |
| 5 | `procurement@bel-demo.in` | `PROCUREMENT_ADMIN`| Enterprise (BEL Root) | Vendor onboarding, Supplier QA credentials |
| 6 | `sbuhead@bel-demo.in` | `SBU_HEAD` | Bangalore / Military Radars | Radar asset minting, SBU employee management |
| 7 | `manager@bel-demo.in` | `MANAGER` | Bangalore / Military Radars | Team project oversight, Custody transfers |
| 8 | `employee@bel-demo.in` | `OFFICER` | Bangalore / Military Radars | View personal credentials, Hold asset custody |
| 9 | `intern@bel-demo.in` | `INTERN` | Bangalore / Software SBU | Restricted self-service portal |
| 10| `auditor@bel-demo.in` | `AUDITOR` | Enterprise (BEL Root) | **Strictly Read-Only**: Audit logs & ledger explorer |
| 11| `vendor@bel-demo.in` | `VENDOR` | External Contractor | Isolated portal: View own qualification credentials |

---

## 4. Step-by-Step Installation & Run Guide

### Prerequisites
- **Node.js**: v18+ or v20+ LTS
- **npm**: v9+ or v10+
- **Git**

### Installation Commands
```powershell
# 1. Clone repository
git clone <repo-url> "BEL on Blockchain"
cd "BEL on Blockchain"

# 2. Install Smart Contracts dependencies & Compile
cd packages/contracts
npm install
npx hardhat compile

# 3. Deploy all 7 Smart Contracts (creates deployed.json)
npx hardhat run scripts/deploy.ts

# 4. Install Backend API dependencies & Generate Prisma
cd ../../apps/api
npm install
npx prisma generate

# 5. Seed Database
npx ts-node prisma/seed.ts

# 6. Start Backend Server (Port 3001)
npm run dev

# 7. In a new terminal: Install Frontend dependencies & Start Web App (Port 3000)
cd ../../apps/web
npm install
npm run dev
```

Visit the application at: **`http://localhost:3000`**

---

## 5. Demonstration Walkthrough (8 Core Demo Flows)

### Flow 1: Enterprise Login & Scoped Dashboard
1. Navigate to `http://localhost:3000/login`.
2. Click **Demo Accounts** accordion and select `admin@bel-demo.in`.
3. View the **Executive Dashboard**: observe live KPI counts, active DIDs, and tamper-evident audit feed.

### Flow 2: Decentralized Identity (DID) & Key Rotation
1. Navigate to **Identity -> DIDs** (`/identity/dids`).
2. Search for `did:bel:employee:E-008`.
3. Click **Rotate Key** -> The backend rotates the Ed25519 key version on the permissioned ledger.

### Flow 3: Cryptographic Trust Hierarchy
1. Navigate to **Identity -> Employees** and click on `Employee MR`.
2. Inspect the **Trust Graph**:
   `BEL Root DID -> Bangalore Unit -> Military Radars SBU -> Employee DID -> Role Credential -> Permissions`.

### Flow 4: Verifiable Credential Issuance
1. Navigate to **Credentials -> Issue Credential** (`/credentials/issue`).
2. Select `SecurityClearanceCredential`.
3. Choose `Employee MR`, customize JSON claims (e.g. `clearanceLevel: "SECRET"`), and click **Sign & Issue**.
4. The backend computes the SHA-256 claims hash and anchors the credential ID to the smart contract.

### Flow 5: Public Credential Verification (Zero Login Required)
1. On the issued credential detail page, click **Generate Public QR**.
2. Open an incognito window or navigate directly to `http://localhost:3000/verify/credential/<credentialId>`.
3. Observe the **5-step verification chain**:
   `Issuer Authenticity ✓ -> Cryptographic Proof ✓ -> Revocation Status ✓ -> Validity ✓ -> Blockchain Anchor ✓ -> VALID`.
   *Notice that zero private employee PII is displayed to the external verifier.*

### Flow 6: Revocation & Real-Time Invalidation
1. Return to the dashboard as `security@bel-demo.in` or `admin@bel-demo.in`.
2. On the credential detail page, click **Revoke Credential**.
3. Refresh the public verification page -> The verifier instantly displays **REVOKED ⊘**.

### Flow 7: Digital Asset Custody Handover & Soulbound Badges
1. Navigate to **Assets -> Mint Asset** (`/assets/mint`).
2. Mint `Tactical S-Band Radar Component` as `TRANSFERABLE`.
3. Click **Transfer Custody** and assign it to `employee@bel-demo.in`.
4. Check the **Custody Timeline** to view the provenance trail.
5. Now mint a `TRAINING_BADGE` with `Soulbound` enabled -> Attempting a transfer strictly reverts.

### Flow 8: Multi-Signature Governance (2-of-3 Council)
1. Navigate to **Governance** (`/governance`).
2. Click **New Proposal** -> Enter title `Emergency Pause Asset Contract`.
3. As `root@bel-demo.in`, click **Sign & Approve** -> Status shows `1/2 Approvals (50%)`.
4. Switch account to `admin@bel-demo.in` and click **Sign & Approve** -> Threshold met! Proposal transitions to `APPROVED` and executes smart contract state.

---

## 6. Smart Contracts Suite Reference

| Contract | Purpose | Key Solidity Methods | Emitted Events |
|---|---|---|---|
| `IdentityRegistry.sol` | On-chain W3C DID document registry | `registerDID`, `rotateKey`, `revokeDID` | `DIDRegistered`, `DIDKeyRotated`, `DIDRevoked` |
| `OrganizationRegistry.sol` | BEL organizational scope anchors | `registerOrganization`, `updateOrgStatus` | `OrganizationRegistered`, `OrganizationUpdated` |
| `RoleRegistry.sol` | Scoped authority bindings | `assignRole`, `revokeRole`, `hasRole` | `RoleAssigned`, `RoleRevoked` |
| `CredentialRegistry.sol` | Hash-only credential status anchors | `anchorCredential`, `revokeCredential` | `CredentialAnchored`, `CredentialRevoked` |
| `AssetNFT.sol` | ERC-721 & ERC-5192 custody tokens | `mintAsset`, `transferAsset`, `burnAsset` | `AssetMinted`, `AssetTransferred`, `Locked` |
| `AuditRegistry.sol` | Append-only audit state digests | `anchorAuditEvent`, `verifyAnchor` | `AuditEventAnchored` |
| `Governance.sol` | M-of-N multi-sig consensus | `createProposal`, `approveProposal`, `executeProposal` | `ProposalCreated`, `ProposalApproved`, `ProposalExecuted` |

---

## 7. Verification & Security Guarantees

1. **Defense Against Privilege Escalation**: Frontend hiding of buttons is purely cosmetic; the backend API rejects unauthorized tokens with HTTP 403.
2. **SBU Scope Containment**: Officers and managers in SBU-A cannot query, transfer, or modify records belonging to SBU-B.
3. **Zero Knowledge on Public Verifier**: Third-party inspectors verify cryptographically valid signatures without accessing unhashed national IDs, salaries, or clearance justifications.
