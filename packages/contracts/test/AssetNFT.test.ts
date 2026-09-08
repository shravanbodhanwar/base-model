import { expect } from "chai";
import { ethers } from "hardhat";
import { AssetNFT } from "../typechain-types";

describe("AssetNFT", function () {
  let assetNFT: AssetNFT;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const AssetNFTFact = await ethers.getContractFactory("AssetNFT");
    assetNFT = await AssetNFTFact.deploy() as AssetNFT;
  });

  it("Should mint a transferable asset", async function () {
    const metaHash = ethers.keccak256(ethers.toUtf8Bytes("meta"));
    await expect(assetNFT.mintAsset(
      addr1.address,
      "did:bel:owner1",
      metaHash,
      "Hardware",
      false,
      "UnitA",
      "SBU1",
      100
    )).to.emit(assetNFT, "AssetMinted");

    expect(await assetNFT.ownerOf(1n)).to.equal(addr1.address);
  });

  it("Should mint a soulbound token", async function () {
    const metaHash = ethers.keccak256(ethers.toUtf8Bytes("meta"));
    await assetNFT.mintAsset(
      addr1.address,
      "did:bel:owner1",
      metaHash,
      "Badge",
      true,
      "UnitA",
      "SBU1",
      0
    );

    expect(await assetNFT.ownerOf(1n)).to.equal(addr1.address);
  });

  it("Should allow transfer of normal asset", async function () {
    const metaHash = ethers.keccak256(ethers.toUtf8Bytes("meta"));
    await assetNFT.mintAsset(
      owner.address,
      "did:bel:owner1",
      metaHash,
      "Hardware",
      false,
      "UnitA",
      "SBU1",
      100
    );

    await expect(assetNFT.transferFrom(owner.address, addr1.address, 1n))
      .to.emit(assetNFT, "AssetTransferred")
      .withArgs(1n, owner.address, addr1.address);
  });

  it("Should prevent transfer of soulbound asset", async function () {
    const metaHash = ethers.keccak256(ethers.toUtf8Bytes("meta"));
    await assetNFT.mintAsset(
      owner.address,
      "did:bel:owner1",
      metaHash,
      "Badge",
      true,
      "UnitA",
      "SBU1",
      0
    );

    await expect(
      assetNFT.transferFrom(owner.address, addr1.address, 1n)
    ).to.be.revertedWith("Soulbound assets cannot be transferred");
  });

  it("Unauthorized burn fails", async function () {
    const metaHash = ethers.keccak256(ethers.toUtf8Bytes("meta"));
    await assetNFT.mintAsset(
      addr1.address,
      "did:bel:owner1",
      metaHash,
      "Hardware",
      false,
      "UnitA",
      "SBU1",
      100
    );

    await expect(
      assetNFT.connect(addr1).burn(1n)
    ).to.be.revertedWithCustomError(assetNFT, "AccessControlUnauthorizedAccount");
  });

  it("Should record custody history", async function () {
    const metaHash = ethers.keccak256(ethers.toUtf8Bytes("meta"));
    await assetNFT.mintAsset(
      owner.address,
      "did:bel:owner1",
      metaHash,
      "Hardware",
      false,
      "UnitA",
      "SBU1",
      100
    );

    await assetNFT.transferFrom(owner.address, addr1.address, 1n);

    const history = await assetNFT.getCustodyHistory(1n);
    expect(history.length).to.equal(2); // Mint + Transfer
    expect(history[1].to).to.equal(addr1.address);
  });
});
