const hre = require("hardhat");
const  dotenv = require("dotenv");
dotenv.config();
async function main() {
  // 1. Replace with your PRIVATE_KEY (from MetaMask or other wallet)
  const PRIVATE_KEY = process.env.PRIVATE_KEY; 
  const provider = new hre.ethers.JsonRpcProvider("http://127.0.0.1:8545"); // Local Hardhat node
  const deployer = new hre.ethers.Wallet(PRIVATE_KEY, provider);

  console.log("Deploying contracts with address:", deployer.address);

  // 2. Deploy TOKEN contract
  const ERC20Token = await hre.ethers.deployContract("ERC20Token", [], deployer);
  await ERC20Token.waitForDeployment();
  console.log(`TOKEN CONTRACT: ${ERC20Token.target}`);

  // 3. Deploy STAKING contract
  const tokenStaking = await hre.ethers.deployContract("TokenStaking", [], deployer);
  await tokenStaking.waitForDeployment();
  console.log(`STAKING CONTRACT: ${tokenStaking.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});