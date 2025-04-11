const { ethers } = require("hardhat");

async function initializeStaking() {
  const PRIVATE_KEY = "WALLET_PRIVATE_KEY"; 
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const deployer = new ethers.Wallet(PRIVATE_KEY, provider);
  // 1. Connect to the deployed contract
  const contractAddress = "0x20B90382d7436bbdaB924A63B6F91638E1cF5De4";
  const TokenStaking = await ethers.getContractFactory("TokenStaking",deployer);
  const staking = TokenStaking.attach(contractAddress);

  // 2. Check if already initialized
  const isInitialized = await staking.getStartDate() > 0; // Or any other flag
  if (isInitialized) {
    console.log("Contract already initialized");
    return;
  }

  // 3. Initialize with parameters
  const tx = await staking.initialize(
    "0x78A82c351b5CaAfc47b36f1c38FC837262A7f677",          // owner_
    "0x0f5475BC1B2E48d4d5330f937A4219b8d061bA10",          // tokenAddress_
    15,                       // apyRate_ (15%)
    ethers.parseEther("1"),  // minimumStakingAmount_
    ethers.parseEther("5"), // maxStakeTokenLimit_
    Math.floor(Date.now() / 1000),     // stakeStartDate_ (now)
    Math.floor(Date.now() / 1000) + 2592000, // stakeEndDate_ (30 days later)
    2,                          // stakeDays_ (7-day lock)
    20                       // earlyUnstakeFeePercentage_ (10%)
  );

  await tx.wait();
  console.log("Initialization successful!");
}

initializeStaking().catch(console.error);