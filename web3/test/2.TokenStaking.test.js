const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ERC20Token", function () {
  let ERC20Token, Staking,staking, Token, token;
  let owner, user1, user2;
  const initialSupply = ethers.parseEther("1000000");
  const stakeAmount = ethers.parseEther("1000");

  beforeEach(async () => {
    [owner, user1, user2, _] = await ethers.getSigners();
   
     // Deploy mock token
         ERC20Token = await ethers.getContractFactory("ERC20Token");
         token = await ERC20Token.deploy();
        await token.waitForDeployment();
        
        console.log(`TOKEN CONTRACT: ${await token.getAddress()}`);
        console.log(`TOKEN CONTRACT: ${await token.name()}`);
        console.log(`TOKEN CONTRACT: ${await token.symbol()}`);
   
   

    // Deploy Staking contract
     Staking = await ethers.getContractFactory("TokenStaking");
     staking = await Staking.deploy();
    await staking.waitForDeployment();
    console.log(`STAKING CONTRACT: ${await staking.getAddress()}`);
    await staking.initialize(
      owner.address,
      await token.getAddress(),
      1000, // 10% APY (since denominator is 10000)
      ethers.parseEther("100"), // min stake
      ethers.parseEther("100000"), // max stake
      (await ethers.provider.getBlock("latest")).timestamp - 10, // start now
      (await ethers.provider.getBlock("latest")).timestamp + 86400 * 100, // ends in 100 days
      10, // 10 days stake period
      500 // 5% early unstake fee
    );

    // Transfer tokens to users
    await token.transfer(user1.address, stakeAmount);
    await token.transfer(user2.address, stakeAmount);
    await token.transfer(staking.target, stakeAmount);

    // Approve tokens to Staking contract
    await token.connect(user1).approve(staking.target, stakeAmount);
    await token.connect(user2).approve(staking.target, stakeAmount);
  });

  it("should initialize correctly", async () => {
    expect(await staking.getAPY()).to.equal(1000);
    expect(await staking.getStakeDays()).to.equal(864000); // 10 days in seconds
    expect(await staking.getEarlyUnstakeFeePercentage()).to.equal(500);
  });

  it("should allow user to stake tokens", async () => {
    await expect(staking.connect(user1).stake(stakeAmount))
      .to.emit(staking, "Stake")
      .withArgs(user1.address, stakeAmount);

    const user = await staking.getUser(user1.address);
    expect(user.stakeAmount).to.equal(stakeAmount);
  });

  it("should calculate estimated rewards correctly", async () => {
    await staking.connect(user1).stake(stakeAmount);
    await ethers.provider.send("evm_increaseTime", [86400 * 5]); // 5 days
    await ethers.provider.send("evm_mine");

    const rewards = await staking.connect(user1).getUserEstimatedRewards();
    expect(rewards).to.be.gt(0);
  });

  it("should allow claiming rewards", async () => {
    await staking.connect(user1).stake(stakeAmount);
    await ethers.provider.send("evm_increaseTime", [86400 * 10]);
    await ethers.provider.send("evm_mine");

    await staking.connect(user1).claimReward();
    const user = await staking.getUser(user1.address);
    expect(user.rewardAmount).to.equal(0);
  });

  it("should apply early unstake fee if unstaked before time", async () => {
    await staking.connect(user1).stake(stakeAmount);
    await ethers.provider.send("evm_increaseTime", [86400 * 3]);
    await ethers.provider.send("evm_mine");

    await expect(staking.connect(user1).unStake(stakeAmount))
      .to.emit(staking, "EarlyUnstakeFee");

    const user = await staking.getUser(user1.address);
    expect(user.stakeAmount).to.equal(0);
  });

  it("should allow owner to withdraw excess funds", async () => {
    await staking.connect(user1).stake(stakeAmount);
    const withdrawable = await staking.getwithdrawableAmount();
    await expect(staking.connect(owner).withdraw(withdrawable)).to.not.be
      .reverted;
  });

  it("should allow owner to pause and unpause Staking", async () => {
    await staking.connect(user1).stake(stakeAmount);
    await staking.connect(owner).togglesStakingStatus();

    await expect(
      staking.connect(user2).stake(stakeAmount)
    ).to.be.revertedWith("TokensStaking: staking is paused");
  });

  it("should revert if user tries to claim without rewards", async () => {
    await expect(
      staking.connect(user1).claimReward()
    ).to.be.revertedWith("TokenStaking: no reward to claim");
  });
});
