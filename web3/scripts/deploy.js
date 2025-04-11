const hre = require("hardhat");

async function main() {
  // 1. Replace with your PRIVATE_KEY (from MetaMask or other wallet)
  const PRIVATE_KEY = "a288ac9b68fa430fc748199a59a0640bb8753e5ed5832204c171ac9ecaa360db"; // 🔴 Never expose this in production!
  const provider = new hre.ethers.JsonRpcProvider("http://127.0.0.1:8545"); // Local Hardhat node
  const deployer = new hre.ethers.Wallet(PRIVATE_KEY, provider);

  console.log("Deploying contracts with address:", deployer.address);

  // 2. Deploy TOKEN contract
  const theblockchaincoders = await hre.ethers.deployContract("Theblockchaincoders", [], deployer);
  await theblockchaincoders.waitForDeployment();
  console.log(`TOKEN CONTRACT: ${theblockchaincoders.target}`);

  // 3. Deploy STAKING contract
  const tokenStaking = await hre.ethers.deployContract("TokenStaking", [], deployer);
  await tokenStaking.waitForDeployment();
  console.log(`STAKING CONTRACT: ${tokenStaking.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});