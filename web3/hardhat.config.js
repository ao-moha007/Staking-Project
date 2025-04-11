require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
/** @type import('hardhat/config').HardhatUserConfig */
const PRIVATE_KEY = "a288ac9b68fa430fc748199a59a0640bb8753e5ed5832204c171ac9ecaa360db";
const RPC_URL = "https://80002.rpc.thirdweb.com";
module.exports = {
  //defaultNetwork: "polygon_amoy",
  networks: {
    hardhat: {
      // Hardhat network doesn't support ENS by default
      //Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
      //Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
      chainId: 1337, // Default for Hardhat Network
    },
    // ganache: {
    //   host: "127.0.0.1", // Localhost
    //   port: "7545",        // Port Ganache CLI is running on
    //   network_id: "5777" // Match the network ID used in Ganache CLI
    // },
    // polygon_amoy: {
    //   url: "https://80002.rpc.thirdweb.com",
    //   accounts: [`0x${PRIVATE_KEY}`],
    // },
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
