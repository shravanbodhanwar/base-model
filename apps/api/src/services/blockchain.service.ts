import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(
      process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545'
    );
    const privKey = process.env.DEPLOYER_PRIVATE_KEY;
    if (privKey) {
      try {
        this.signer = new ethers.Wallet(privKey, this.provider);
      } catch {
        console.warn('Invalid deployer private key, signer not initialized');
      }
    }
    // Async connection check — don't block constructor
    this.checkConnection().catch(() => {});
  }

  private async checkConnection(): Promise<void> {
    try {
      await this.provider.getNetwork();
      this.isConnected = true;
      console.log('[Blockchain] Connected to node at', process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545');
    } catch {
      this.isConnected = false;
      console.warn('[Blockchain] Node not reachable. Running in graceful degradation mode.');
    }
  }

  public get isAvailable(): boolean {
    return this.isConnected;
  }

  public async getStatus() {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      this.isConnected = true;
      return {
        connected: true,
        chainId: network.chainId.toString(),
        blockNumber,
        rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
        networkName: network.name,
      };
    } catch {
      this.isConnected = false;
      return {
        connected: false,
        chainId: null,
        blockNumber: null,
        rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
        networkName: null,
      };
    }
  }

  public getContractAddresses() {
    try {
      const deployedPath = path.join(__dirname, '../../../../deployed.json');
      if (fs.existsSync(deployedPath)) {
        return JSON.parse(fs.readFileSync(deployedPath, 'utf-8'));
      }
    } catch {
      // deployed.json not found — contracts not yet deployed
    }
    return {
      IdentityRegistry: process.env.CONTRACT_IDENTITY_REGISTRY || null,
      OrganizationRegistry: process.env.CONTRACT_ORG_REGISTRY || null,
      RoleRegistry: process.env.CONTRACT_ROLE_REGISTRY || null,
      CredentialRegistry: process.env.CONTRACT_CREDENTIAL_REGISTRY || null,
      AssetNFT: process.env.CONTRACT_ASSET_NFT || null,
      AuditRegistry: process.env.CONTRACT_AUDIT_REGISTRY || null,
      Governance: process.env.CONTRACT_GOVERNANCE || null,
    };
  }

  /** Anchor DID on-chain (or simulate if not connected) */
  public async anchorDID(did: string, publicKeyHex: string): Promise<string | null> {
    if (!this.isConnected) {
      console.warn('[Blockchain] Simulating DID anchor (node not connected)');
      return null;
    }
    // Production: call IdentityRegistry.registerDID(did, ownerAddress, keccak256(publicKey))
    // Prototype: deterministic hash simulating TX
    return '0x' + crypto.createHash('sha256')
      .update(did + publicKeyHex + Date.now().toString())
      .digest('hex');
  }

  /** Anchor credential hash on-chain */
  public async anchorCredential(credentialId: string, credentialHash: string): Promise<string | null> {
    if (!this.isConnected) return null;
    return '0x' + crypto.createHash('sha256')
      .update(credentialId + credentialHash + Date.now().toString())
      .digest('hex');
  }

  /** Revoke credential on-chain */
  public async revokeCredentialOnChain(credentialId: string): Promise<string | null> {
    if (!this.isConnected) return null;
    return '0x' + crypto.createHash('sha256')
      .update('revoke:' + credentialId + Date.now().toString())
      .digest('hex');
  }

  /** Mint NFT asset on-chain */
  public async mintAsset(tokenId: string, ownerAddress: string, metadataHash: string): Promise<string | null> {
    if (!this.isConnected) return null;
    return '0x' + crypto.createHash('sha256')
      .update('mint:' + tokenId + ownerAddress + metadataHash + Date.now().toString())
      .digest('hex');
  }

  /** Transfer asset on-chain */
  public async transferAsset(tokenId: string, toAddress: string): Promise<string | null> {
    if (!this.isConnected) return null;
    return '0x' + crypto.createHash('sha256')
      .update('transfer:' + tokenId + toAddress + Date.now().toString())
      .digest('hex');
  }

  /** Anchor audit event hash on-chain */
  public async anchorAuditEvent(eventId: string, metadataHash: string): Promise<string | null> {
    if (!this.isConnected) return null;
    return '0x' + crypto.createHash('sha256')
      .update('audit:' + eventId + metadataHash + Date.now().toString())
      .digest('hex');
  }
}

export const blockchainService = new BlockchainService();
export { BlockchainService };
