
import { ethers } from "ethers";
import { JsonRpcProvider } from "ethers";
const EtherHardhat = async () => {
    try {
      // Connect to Hardhat local network
      const hardhatProvider = new JsonRpcProvider("http://127.0.0.1:8545");
      const senderPrivateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Replace with actual private key
      const senderWallet = new ethers.Wallet(senderPrivateKey, hardhatProvider);
      
      const tx = await senderWallet.sendTransaction({
        to: "0x78A82c351b5CaAfc47b36f1c38FC837262A7f677", // Recipient address
        value: ethers.parseEther("100"), // Amount in Ether
      });

      await tx.wait();
      console.log("Ether transferred successfully!");

    } catch (error) {
      console.group("ethers not transferred");
      console.log(error);
    }
  };

  EtherHardhat();