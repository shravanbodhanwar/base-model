import { expect } from "chai";
import { ethers } from "hardhat";
import { Governance } from "../typechain-types";

describe("Governance", function () {
  let governance: Governance;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const GovernanceFact = await ethers.getContractFactory("Governance");
    governance = await GovernanceFact.deploy() as Governance;

    // Grant SIGNER_ROLE to addr1 and addr2
    const SIGNER_ROLE = await governance.SIGNER_ROLE();
    await governance.grantRole(SIGNER_ROLE, addr1.address);
    await governance.grantRole(SIGNER_ROLE, addr2.address);
  });

  it("Should create a proposal", async function () {
    const titleHash = ethers.keccak256(ethers.toUtf8Bytes("Title"));
    const callDataHash = ethers.keccak256(ethers.toUtf8Bytes("Data"));
    
    await expect(governance.createProposal(
      titleHash,
      1,
      owner.address,
      callDataHash,
      "did:bel:proposer",
      3600
    )).to.emit(governance, "ProposalCreated");
  });

  it("Single approval is insufficient to execute", async function () {
    const titleHash = ethers.keccak256(ethers.toUtf8Bytes("Title"));
    await governance.createProposal(
      titleHash, 1, owner.address, ethers.ZeroHash, "did", 3600
    );

    await expect(governance.approveProposal(1n))
      .to.emit(governance, "ProposalApproved");

    const proposal = await governance.proposals(1n);
    expect(proposal.state).to.equal(0n); // PENDING
  });

  it("Two approvals execute proposal", async function () {
    const titleHash = ethers.keccak256(ethers.toUtf8Bytes("Title"));
    await governance.createProposal(
      titleHash, 1, owner.address, ethers.ZeroHash, "did", 3600
    );

    await governance.approveProposal(1n);
    await expect(governance.connect(addr1).approveProposal(1n))
      .to.emit(governance, "ProposalExecuted");

    const proposal = await governance.proposals(1n);
    expect(proposal.state).to.equal(1n); // EXECUTED
  });

  it("Should reject double voting", async function () {
    const titleHash = ethers.keccak256(ethers.toUtf8Bytes("Title"));
    await governance.createProposal(
      titleHash, 1, owner.address, ethers.ZeroHash, "did", 3600
    );

    await governance.approveProposal(1n);
    await expect(governance.approveProposal(1n))
      .to.be.revertedWith("Already approved");
  });

  it("Cannot approve expired proposal", async function () {
    const titleHash = ethers.keccak256(ethers.toUtf8Bytes("Title"));
    // duration 0 means it expires instantly in this block
    await governance.createProposal(
      titleHash, 1, owner.address, ethers.ZeroHash, "did", 0
    );
    
    // Mine next block so it is expired
    await ethers.provider.send("evm_mine", []);

    await expect(governance.approveProposal(1n))
      .to.be.revertedWith("Expired");
  });

  it("Cannot approve cancelled proposal", async function () {
    const titleHash = ethers.keccak256(ethers.toUtf8Bytes("Title"));
    await governance.createProposal(
      titleHash, 1, owner.address, ethers.ZeroHash, "did", 3600
    );

    await governance.cancelProposal(1n);
    await expect(governance.approveProposal(1n))
      .to.be.revertedWith("Not pending");
  });
});
