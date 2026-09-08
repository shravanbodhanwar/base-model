import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy IdentityRegistry
  const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
  const identityRegistry = await IdentityRegistry.deploy();
  await identityRegistry.waitForDeployment();
  console.log("IdentityRegistry deployed to:", await identityRegistry.getAddress());

  // Deploy OrganizationRegistry
  const OrganizationRegistry = await ethers.getContractFactory("OrganizationRegistry");
  const organizationRegistry = await OrganizationRegistry.deploy();
  await organizationRegistry.waitForDeployment();
  console.log("OrganizationRegistry deployed to:", await organizationRegistry.getAddress());

  // Deploy RoleRegistry
  const RoleRegistry = await ethers.getContractFactory("RoleRegistry");
  const roleRegistry = await RoleRegistry.deploy();
  await roleRegistry.waitForDeployment();
  console.log("RoleRegistry deployed to:", await roleRegistry.getAddress());

  // Deploy CredentialRegistry
  const CredentialRegistry = await ethers.getContractFactory("CredentialRegistry");
  const credentialRegistry = await CredentialRegistry.deploy();
  await credentialRegistry.waitForDeployment();
  console.log("CredentialRegistry deployed to:", await credentialRegistry.getAddress());

  // Deploy AssetNFT
  const AssetNFT = await ethers.getContractFactory("AssetNFT");
  const assetNFT = await AssetNFT.deploy();
  await assetNFT.waitForDeployment();
  console.log("AssetNFT deployed to:", await assetNFT.getAddress());

  // Deploy AuditRegistry
  const AuditRegistry = await ethers.getContractFactory("AuditRegistry");
  const auditRegistry = await AuditRegistry.deploy();
  await auditRegistry.waitForDeployment();
  console.log("AuditRegistry deployed to:", await auditRegistry.getAddress());

  // Deploy Governance
  const Governance = await ethers.getContractFactory("Governance");
  const governance = await Governance.deploy();
  await governance.waitForDeployment();
  console.log("Governance deployed to:", await governance.getAddress());

  // Set Governance address in AssetNFT
  await assetNFT.setGovernanceContract(await governance.getAddress());

  const deployedData = {
    IdentityRegistry: await identityRegistry.getAddress(),
    OrganizationRegistry: await organizationRegistry.getAddress(),
    RoleRegistry: await roleRegistry.getAddress(),
    CredentialRegistry: await credentialRegistry.getAddress(),
    AssetNFT: await assetNFT.getAddress(),
    AuditRegistry: await auditRegistry.getAddress(),
    Governance: await governance.getAddress()
  };

  const deployedPath = path.join(__dirname, "../../../deployed.json");
  fs.writeFileSync(deployedPath, JSON.stringify(deployedData, null, 2));
  console.log(`Addresses written to ${deployedPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
