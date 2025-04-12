const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ERC20Token", function () {
  let token, owner, addr1, addr2;

  const initialSupply = ethers.parseEther("10000000"); // 10 million tokens

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("ERC20Token");
    token = await Token.deploy();
    await token.waitForDeployment();
  });

  it("should deploy with correct initial values", async () => {
    expect(await token.name()).to.equal("ERC20Token");
    expect(await token.symbol()).to.equal("TKN");
    expect(await token.standard()).to.equal("ERC20Token v.0.1");
    expect(await token.totalSupply()).to.equal(initialSupply);
    expect(await token.balanceOf(owner.address)).to.equal(initialSupply);
  });

  it("should transfer tokens and update balances", async () => {
    const transferAmount = ethers.parseEther("1000");
    await token.connect(owner).transfer(addr1.address, transferAmount);

    expect(await token.balanceOf(owner.address)).to.equal(initialSupply - transferAmount);

    expect(await token.balanceOf(addr1.address)).to.equal(transferAmount);
  });

  it("should update TokenHolderInfo on transfer", async () => {
    const transferAmount = ethers.parseEther("500");
    await token.connect(owner).transfer(addr1.address, transferAmount);

    const [tokenId, to, from, totalToken, isHolder] = await token.getTokenHolderData(addr1.address);
    expect(to).to.equal(addr1.address);
    expect(from).to.equal(owner.address);
    expect(totalToken).to.equal(transferAmount);
    expect(isHolder).to.be.true;
    expect(tokenId).to.be.gt(0);
  });

  it("should return list of token holders", async () => {
    const transferAmount = ethers.parseEther("100");
    await token.connect(owner).transfer(addr1.address, transferAmount);
    await token.connect(owner).transfer(addr2.address, transferAmount);

    const holders = await token.getTokenHolder();
    expect(holders).to.include(addr1.address);
    expect(holders).to.include(addr2.address);
  });

  it("should approve and allow delegated transfer via transferFrom", async () => {
    const approveAmount = ethers.parseEther("300");
    const transferAmount = ethers.parseEther("200");

    await token.connect(owner).approve(addr1.address, approveAmount);
    expect(await token.allowance(owner.address, addr1.address)).to.equal(approveAmount);

    await token.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount);

    expect(await token.balanceOf(addr2.address)).to.equal(transferAmount);
    expect(await token.allowance(owner.address, addr1.address)).to.equal(approveAmount-transferAmount);
   

  });

  it("should fail transfer when balance is insufficient", async () => {
    const transferAmount = ethers.parseEther("100");
    await expect(token.connect(addr1).transfer(owner.address, transferAmount)).to.be.revertedWith("ERC20: insufficient balance");
  });

  it("should fail transferFrom when allowance is insufficient", async () => {
    const transferAmount = ethers.parseEther("50");
    await expect(token.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount)).to.be.revertedWith("ERC20: insufficient allowance");
  });
});
