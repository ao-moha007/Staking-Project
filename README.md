# Staking-Project

**Staking-Project** is a decentralized staking DApp built with **Vanilla JavaScript** and styled using **Bootstrap**. It enables users to stake a custom ERC-20 token to earn APY rewards over a predefined staking duration. All interactions are securely executed via **MetaMask**, and smart contracts are built with **Solidity**, deployed using **Hardhat**, and integrated with the frontend through **Ethers.js**.

---

##  Tech Stack

- **Smart Contracts**: Solidity
- **Frontend**: Vanilla JavaScript + Bootstrap
- **Blockchain Integration**: Ethers.js
- **Development Environment**: Hardhat
- **Wallet Integration**: MetaMask
- **Token**: Custom ERC-20 token (included)

---

##  Features

-  Stake custom ERC-20 tokens and earn APY-based rewards
-  Early unstaking fee mechanism
-  Admin-controlled staking parameters
-  Configurable staking period, limits, and rewards
-  Claim accumulated rewards at any time
-  Seamless MetaMask wallet connection

---

## Contracts

###  `ERC20Token.sol`
Implements a standard ERC-20 token with extended features. Deployed before staking begins.

###  `TokenStaking.sol`
Handles the staking logic:
- Manages user stakes and reward calculations
- Enforces staking start/end dates
- Allows early unstaking with penalties
- Owner can pause staking, update parameters, or withdraw unused tokens

---

##  Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Staking-Project.git
cd Staking-Project
```

### 2. Install Hardhat and Dependencies

```bash
npm install
```

### 3. Fund Your Wallet

Send testnet ETH (e.g., via faucet) to the MetaMask wallet you'll use for deployment and interactions.

### 4. Deploy Contracts

Using Hardhat, deploy both the ERC20 token and the `TokenStaking` contract from your funded wallet.

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network yourNetwork
```

>  Be sure to update your network config and deployment script to include both contracts.

### 5. Fund the Contracts

- Send your custom ERC-20 tokens to:
  - Your own wallet (for staking)
  - The `TokenStaking` contract (for user rewards)

### 6. Run the Frontend

Open `index.html` in your browser, or serve it locally:

```bash
npx serve .
```

### 7. Connect Wallet

In the browser, connect your MetaMask wallet.

### 8. Initialize Staking Contract

From the frontend UI, run the **initialize** function and input:
- Token address
- Staking period
- APY
- Min/max stake
- Unstake fee, etc.

### 9. Start Staking!

You’re now ready to stake your tokens and start earning rewards 

---


##  License

This project is licensed under the [MIT License](LICENSE).

---

