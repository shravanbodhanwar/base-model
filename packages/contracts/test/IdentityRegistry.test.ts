import { expect } from "chai";
import { ethers } from "hardhat";
import { IdentityRegistry } from "../typechain-types";

describe("IdentityRegistry", function () {
  let identityRegistry: IdentityRegistry;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const IdentityRegistryFact = await ethers.getContractFactory("IdentityRegistry");
    identityRegistry = await IdentityRegistryFact.deploy() as IdentityRegistry;
  });

  it("Should register a DID successfully", async function () {
    const pubKeyHash = ethers.keccak256(ethers.toUtf8Bytes("pubKey1"));
    await expect(identityRegistry.registerDID("did:bel:123", addr1.address, pubKeyHash))
      .to.emit(identityRegistry, "DIDRegistered");

    const record = await identityRegistry.getDIDRecord("did:bel:123");
    expect(record.owner).to.equal(addr1.address);
    expect(record.status).to.equal(0n); // ACTIVE
  });

  it("Should fail duplicate DID registration", async function () {
    const pubKeyHash = ethers.keccak256(ethers.toUtf8Bytes("pubKey1"));
    await identityRegistry.registerDID("did:bel:123", addr1.address, pubKeyHash);
    
    await expect(identityRegistry.registerDID("did:bel:123", addr1.address, pubKeyHash))
      .to.be.revertedWith("DID already registered");
  });

  it("Only REGISTRAR_ROLE can register", async function () {
    const pubKeyHash = ethers.keccak256(ethers.toUtf8Bytes("pubKey1"));
    await expect(
      identityRegistry.connect(addr1).registerDID("did:bel:456", addr1.address, pubKeyHash)
    ).to.be.revertedWithCustomError(identityRegistry, "AccessControlUnauthorizedAccount");
  });

  it("Should rotate key and emit event", async function () {
    const pubKeyHash = ethers.keccak256(ethers.toUtf8Bytes("pubKey1"));
    await identityRegistry.registerDID("did:bel:123", owner.address, pubKeyHash);

    const newPubKeyHash = ethers.keccak256(ethers.toUtf8Bytes("pubKey2"));
    await expect(identityRegistry.rotateKey("did:bel:123", newPubKeyHash))
      .to.emit(identityRegistry, "DIDKeyRotated")
      .withArgs("did:bel:123", newPubKeyHash, (val: any) => true);
      
    const record = await identityRegistry.getDIDRecord("did:bel:123");
    expect(record.publicKeyHash).to.equal(newPubKeyHash);
  });

  it("Should revoke DID successfully", async function () {
    const pubKeyHash = ethers.keccak256(ethers.toUtf8Bytes("pubKey1"));
    await identityRegistry.registerDID("did:bel:123", owner.address, pubKeyHash);

    await expect(identityRegistry.revokeDID("did:bel:123"))
      .to.emit(identityRegistry, "DIDRevoked");

    const record = await identityRegistry.getDIDRecord("did:bel:123");
    expect(record.status).to.equal(1n); // REVOKED
  });

  it("Unauthorized revocation fails", async function () {
    const pubKeyHash = ethers.keccak256(ethers.toUtf8Bytes("pubKey1"));
    await identityRegistry.registerDID("did:bel:123", owner.address, pubKeyHash);

    await expect(
      identityRegistry.connect(addr1).revokeDID("did:bel:123")
    ).to.be.revertedWith("Not authorized to revoke");
  });
});
