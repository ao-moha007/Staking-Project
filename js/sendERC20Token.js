// scripts/send-tokens.js
const { ethers } = require("hardhat");
async function main() {
  // 1. Replace with your PRIVATE_KEY (from MetaMask or other wallet)
  const PRIVATE_KEY = "a288ac9b68fa430fc748199a59a0640bb8753e5ed5832204c171ac9ecaa360db"; 
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const deployer = new ethers.Wallet(PRIVATE_KEY, provider);
  
  const receiverWallet = "0x78A82c351b5CaAfc47b36f1c38FC837262A7f677"; // Replace with your wallet address
  const receiverContract = "0x20B90382d7436bbdaB924A63B6F91638E1cF5De4"; // Replace with your wallet address
  const contractAddress = "0x0f5475BC1B2E48d4d5330f937A4219b8d061bA10"; // Replace with deployed contract address
  const Contract = await ethers.getContractAt("ERC20Token", contractAddress,deployer);
  
  const amount = ethers.parseUnits("1000", 18); // 100 tokens with 18 decimals
  const treasuryAmount = ethers.parseUnits("1000", 18);
  try{
    const tx = await Contract.transfer(receiverContract, amount);
    await tx.wait();
    console.log(`Sent 100 TBC tokens to ${receiverWallet}`);
  }catch(error) {
    console.log(error);
  }
  
  // const txContract = await Contract.transfer(receiverContract, treasuryAmount);
  // await txContract.wait();
  //console.log(`Sent 1000 TBC tokens to ${receiverContract}`,treasuryAmount);
  const balance = await Contract.balanceOf("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266");
  const balanceWallet = await Contract.balanceOf("0x78A82c351b5CaAfc47b36f1c38FC837262A7f677");
  const balanceContract = await Contract.balanceOf("0x20B90382d7436bbdaB924A63B6F91638E1cF5De4");
  const balanceDep = await Contract.balanceOf(deployer.address);
  console.log("Balance:", ethers.formatUnits(balance, 18));
  console.log("Balance of wallet:", ethers.formatUnits(balanceWallet, 18));
  console.log("Balance of staking contract:",receiverContract, ethers.formatUnits(balanceContract, 18));
  console.log("Balance deployer :",deployer.address, ethers.formatUnits(balanceDep, 18));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


