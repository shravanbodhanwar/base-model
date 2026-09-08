import { ed25519 } from '@noble/curves/ed25519';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex as toHex } from '@noble/hashes/utils';
import { EntityType } from '@prisma/client';

export class DIDService {
  generateDID(entityType: EntityType, identifier: string): string {
    const typeMap: Record<EntityType, string> = {
      ORGANIZATION: 'org',
      UNIT: 'unit',
      SBU: 'sbu',
      EMPLOYEE: 'employee',
      VENDOR: 'vendor',
      PROJECT: 'project'
    };
    return `did:bel:${typeMap[entityType]}:${identifier}`;
  }

  generateKeyPair() {
    const privateKey = ed25519.utils.randomPrivateKey();
    const publicKey = ed25519.getPublicKey(privateKey);
    return {
      privateKeyHex: toHex(privateKey),
      publicKeyHex: toHex(publicKey)
    };
  }

  signData(data: string, privateKeyHex: string): string {
    const msgHash = sha256(data);
    const signature = ed25519.sign(msgHash, privateKeyHex);
    return toHex(signature);
  }

  verifySignature(data: string, signatureHex: string, publicKeyHex: string): boolean {
    const msgHash = sha256(data);
    return ed25519.verify(signatureHex, msgHash, publicKeyHex);
  }

  hashDIDDocument(did: string, publicKeyHex: string): string {
    return toHex(sha256(did + publicKeyHex));
  }
}

export const didService = new DIDService();
