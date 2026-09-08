import { expect } from "chai";
import { ethers } from "hardhat";
import { CredentialRegistry } from "../typechain-types";

describe("CredentialRegistry", function () {
  let credentialRegistry: CredentialRegistry;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const CredentialRegistryFact = await ethers.getContractFactory("CredentialRegistry");
    credentialRegistry = await CredentialRegistryFact.deploy() as CredentialRegistry;
  });

  it("Should anchor a credential successfully", async function () {
    const credIdHash = ethers.keccak256(ethers.toUtf8Bytes("cred1"));
    const subjectHash = ethers.keccak256(ethers.toUtf8Bytes("subj1"));
    const dataHash = ethers.keccak256(ethers.toUtf8Bytes("data1"));

    await expect(credentialRegistry.anchorCredential(
      credIdHash,
      "did:bel:issuer",
      subjectHash,
      "Degree",
      dataHash,
      Math.floor(Date.now() / 1000),
      Math.floor(Date.now() / 1000) + 3600
    )).to.emit(credentialRegistry, "CredentialAnchored");
  });

  it("Should verify active credential", async function () {
    const credIdHash = ethers.keccak256(ethers.toUtf8Bytes("cred1"));
    const subjectHash = ethers.keccak256(ethers.toUtf8Bytes("subj1"));
    const dataHash = ethers.keccak256(ethers.toUtf8Bytes("data1"));

    await credentialRegistry.anchorCredential(
      credIdHash,
      "did:bel:issuer",
      subjectHash,
      "Degree",
      dataHash,
      Math.floor(Date.now() / 1000),
      Math.floor(Date.now() / 1000) + 3600
    );

    const status = await credentialRegistry.verifyCredentialStatus(credIdHash);
    expect(status).to.equal(0n); // ACTIVE
  });

  it("Should revoke a credential successfully", async function () {
    const credIdHash = ethers.keccak256(ethers.toUtf8Bytes("cred2"));
    const subjectHash = ethers.keccak256(ethers.toUtf8Bytes("subj2"));
    const dataHash = ethers.keccak256(ethers.toUtf8Bytes("data2"));

    await credentialRegistry.anchorCredential(
      credIdHash,
      "did:bel:issuer",
      subjectHash,
      "Degree",
      dataHash,
      Math.floor(Date.now() / 1000),
      Math.floor(Date.now() / 1000) + 3600
    );

    await expect(credentialRegistry.revokeCredential(credIdHash, "did:bel:issuer"))
      .to.emit(credentialRegistry, "CredentialRevoked");

    const status = await credentialRegistry.verifyCredentialStatus(credIdHash);
    expect(status).to.equal(1n); // REVOKED
  });

  it("Unauthorized anchor does not exist but duplicate fails", async function () {
    const credIdHash = ethers.keccak256(ethers.toUtf8Bytes("cred3"));
    await credentialRegistry.anchorCredential(
      credIdHash, "did:bel:issuer", ethers.ZeroHash, "Type", ethers.ZeroHash, 0, 0
    );

    await expect(credentialRegistry.anchorCredential(
      credIdHash, "did:bel:issuer", ethers.ZeroHash, "Type", ethers.ZeroHash, 0, 0
    )).to.be.revertedWith("Credential already anchored");
  });
});
