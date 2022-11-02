const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("PredictorPass", function () {    
  async function deployContract() { 
    const metadata = "ipfs://QmWuJoLZntYPsNvbbL8doN3W3wjupfjfKBABozP5GbgJ4k";

    const PredictorPass = await ethers.getContractFactory("PredictorPass");
    const [owner, addr1, addr2] = await ethers.getSigners();

    const predictorPass = await PredictorPass.deploy(metadata);
    await predictorPass.deployed();

    return {predictorPass, owner, addr1, addr2};
  }

  describe("Deployment", function () {

    it("Should assign the owner of the contract correctly", async function () {
      const { predictorPass, owner } = await loadFixture(deployContract);
      expect(await predictorPass.owner()).to.equal(owner.address);
    });

    it("Should init values correctly", async function () {
      const { predictorPass, owner } = await loadFixture(deployContract);
      expect(await predictorPass.getTokenIds()).to.equal(1);
    });
  });


  describe("Minting", function () {

    it("Should return 1, the new token id", async function () {
      const { predictorPass, owner } = await loadFixture(deployContract);
      const type = 0;
      const expectedId = 1;
      const price = ethers.utils.parseEther("0.01");

      expect(await predictorPass.mintPass(type, {value: price})).to.emit(predictorPass, "NewPass").withArgs(owner.address, expectedId, type);;

      const mintedPass = await predictorPass.passes(1);

      expect(mintedPass.id).to.equal(expectedId);
      expect(mintedPass.passType).to.equal(type);

      expect(await predictorPass.getTokenIds()).to.equal(2);

      // expect(await ethers.balanceOf(this)).to.equal(price);
    });

    it("Should mint 3 tokens", async function () {
      const { predictorPass, owner, addr1, addr2 } = await loadFixture(deployContract);

      const price1 = ethers.utils.parseEther("0.05");
      const price2 = ethers.utils.parseEther("0.03");
      const price3 = ethers.utils.parseEther("0.02");

      expect(await predictorPass.connect(addr2).mintPass(3, {value: price1})).to.emit(predictorPass, "NewPass").withArgs(addr1.address, 1, 3);
      expect(await predictorPass.connect(addr1).mintPass(2, {value: price2})).to.emit(predictorPass, "NewPass").withArgs(addr2.address, 2, 2);
      expect(await predictorPass.mintPass(1, {value: price3})).to.emit(predictorPass, "NewPass").withArgs(owner.address, 3, 1);

      const mintedPass1 = await predictorPass.passes(1);
      const mintedPass2 = await predictorPass.passes(2);
      const mintedPass3 = await predictorPass.passes(3);

      expect(mintedPass1.id).to.equal(1);
      expect(mintedPass1.passType).to.equal(3);

      expect(mintedPass2.id).to.equal(2);
      expect(mintedPass2.passType).to.equal(2);

      expect(mintedPass3.id).to.equal(3);
      expect(mintedPass3.passType).to.equal(1);

      expect(await predictorPass.ownerOf(1)).to.equal(addr2.address);
      expect(await predictorPass.playerPassId(addr2.address)).to.equal(1);

      expect(await predictorPass.ownerOf(2)).to.equal(addr1.address);
      expect(await predictorPass.playerPassId(addr1.address)).to.equal(2);

      expect(await predictorPass.ownerOf(3)).to.equal(owner.address);
      expect(await predictorPass.playerPassId(owner.address)).to.equal(3);

      // expect(await ethers.balanceOf(this)).to.equal(0.1);
    });

    it("Should assign the owner of the token correctly", async function () {
      const { predictorPass, owner } = await loadFixture(deployContract);
      const type = 0;
      const expectedId = 1;
      const price = ethers.utils.parseEther("0.01");

      expect(await predictorPass.mintPass(type, {value: price})).to.emit(predictorPass, "NewPass").withArgs(owner.address, expectedId, type);;

      expect(await predictorPass.ownerOf(expectedId)).to.equal(owner.address);
      expect(await predictorPass.balanceOf(owner.address)).to.equal(1);
      expect(await predictorPass.playerPassId(owner.address)).to.equal(expectedId);
    });

    it("Should return the token uri", async function () {
      const { predictorPass, owner } = await loadFixture(deployContract);
      const type = 0;
      const expectedId = 1;
      const price = ethers.utils.parseEther("0.01");

      expect(await predictorPass.mintPass(type, {value: price})).to.emit(predictorPass, "NewPass").withArgs(owner.address, expectedId, type);;

      expect(await predictorPass.tokenURI(expectedId)).to.equal("ipfs://QmWuJoLZntYPsNvbbL8doN3W3wjupfjfKBABozP5GbgJ4k/0.json");
    });

    it("Should fail, not enough eth", async function () {
      const { predictorPass } = await loadFixture(deployContract);
      const type = 3;
      const price = ethers.utils.parseEther("0.04"); // should be 0.05

      await expect(predictorPass.mintPass(type, {value: price})).to.be.revertedWith('Not enough ETH sent');
    });

    // solidity won't let this happen
    // it("Should fail, incorrect type", async function () {
    //   const { predictorPass } = await loadFixture(deployContract);
    //   const type = 5; // not a valid type
    //   const price = ethers.utils.parseEther("0.01");

    //   await expect(predictorPass.mintPass(type, {value: price})).to.be.revertedWith("Error: Transaction reverted: function was called with incorrect parameters");
    // });

    it("Should fail, player already has a pass", async function () {
      const { predictorPass, owner } = await loadFixture(deployContract);
      const expectedId = 1;
      const price = ethers.utils.parseEther("0.01");

      expect(await predictorPass.mintPass(0, {value: price})).to.emit(predictorPass, "NewPass").withArgs(owner.address, expectedId, 0);;
      await expect(predictorPass.mintPass(0, {value: price})).to.be.revertedWith("Player already has a pass");
    });
  });


  describe("Burn", function () {

    it("Should mint and burn the token, and mint another one", async function () {
      const { predictorPass, owner } = await loadFixture(deployContract);

      const type = 1;
      const expectedId = 1;
      const price = ethers.utils.parseEther("0.02");

      expect(await predictorPass.mintPass(type, {value: price})).to.emit(predictorPass, "NewPass").withArgs(owner.address, expectedId, type);;
      expect(await predictorPass.balanceOf(owner.address)).to.equal(1);

      expect(await predictorPass.burn(expectedId)).to.emit(predictorPass, "Transfer").withArgs(owner.address, 0, expectedId);
      expect(await predictorPass.balanceOf(owner.address)).to.equal(0);

      expect(await predictorPass.getTokenIds()).to.equal(1);

      expect(await predictorPass.mintPass(0, {value: price})).to.emit(predictorPass, "NewPass").withArgs(owner.address, expectedId + 1, type);;
    });

    it("Should not burn someone else's token", async function () {
      const { predictorPass, owner, addr1 } = await loadFixture(deployContract);

      const type = 2;
      const expectedId = 1;
      const price = ethers.utils.parseEther("0.03");

      expect(await predictorPass.mintPass(type, {value: price})).to.emit(predictorPass, "NewPass").withArgs(owner.address, expectedId, type);;

      await expect(predictorPass.connect(addr1).burn(expectedId)).to.be.revertedWith('ERC721: caller is not token owner or approved');
    });
  });


  describe("Only owner", function () {

    it("Should mint a free token for someone else", async function () {
      const { predictorPass, owner, addr1 } = await loadFixture(deployContract);

      const type = 1;
      const expectedId = 1;

      expect(await predictorPass.ownerMint(type, addr1.address)).to.emit(predictorPass, "NewPass").withArgs(owner.address, expectedId, type);;
      expect(await predictorPass.balanceOf(addr1.address)).to.equal(1);
    });

    it("Should not mint a free token if the caller is not the owner", async function () {
      const { predictorPass, owner, addr1 } = await loadFixture(deployContract);

      const type = 1;

      await expect(predictorPass.connect(addr1).ownerMint(type, addr1.address)).be.revertedWith("Ownable: caller is not the owner");
    });
  });


  describe("Transfer", function () {

    it("Should transfer token from owner to address1", async function () {
      const { predictorPass, owner, addr1 } = await loadFixture(deployContract);
      const type = 0;
      const expectedId = 1;
      const price = ethers.utils.parseEther("0.01");

      expect(await predictorPass.mintPass(type, {value: price})).to.emit(predictorPass, "NewPass").withArgs(owner.address, expectedId, type);;

      expect(await predictorPass.transferFrom(owner.address, addr1.address, expectedId)).to.emit(predictorPass, "Transfer").withArgs(owner.address, addr1.address, expectedId);

      expect(await predictorPass.ownerOf(expectedId)).to.equal(addr1.address);
      expect(await predictorPass.playerPassId(addr1.address)).to.equal(expectedId);

      expect(await predictorPass.playerPassId(owner.address)).to.equal(0);
      expect(await predictorPass.balanceOf(owner.address)).to.equal(0);
    });

    it("Should not transfer someone else's token", async function () {
      const { predictorPass, owner, addr1 } = await loadFixture(deployContract);
      const type = 0;
      const expectedId = 1;
      const price = ethers.utils.parseEther("0.01");

      expect(await predictorPass.mintPass(type, {value: price})).to.emit(predictorPass, "NewPass").withArgs(owner.address, expectedId, type);;

      await expect(predictorPass.connect(addr1).transferFrom(addr1.address, owner.address, expectedId)).be.revertedWith("RC721: caller is not token owner nor approved");
    });
  });

  describe("Getters", function () {
    // test getters
    it("Should get the token id", async function () {
      const { predictorPass, owner } = await loadFixture(deployContract);
      const type = 0;
      const expectedId = 1;
      const price = ethers.utils.parseEther("0.01");

      expect(await predictorPass.mintPass(type, {value: price})).to.emit(predictorPass, "NewPass").withArgs(owner.address, expectedId, type);;

      expect(await predictorPass.playerPassId(owner.address)).to.equal(expectedId);
    });

    it("Should get the token type", async function () {
      const { predictorPass, owner } = await loadFixture(deployContract);
      const type = 0;
      const expectedId = 1;
      const price = ethers.utils.parseEther("0.01");

      expect(await predictorPass.mintPass(type, {value: price})).to.emit(predictorPass, "NewPass").withArgs(owner.address, expectedId, type);;

      expect(await predictorPass.getPass(expectedId).type).to.equal(type);
    });

    // bad cases
    it("Should not get a non existent token", async function () {
      const { predictorPass, owner } = await loadFixture(deployContract);
      const expectedId = 1;

      await expect(predictorPass.getPass(expectedId)).to.be.revertedWith("ERC721: owner query for nonexistent token");
    });

    it("Should not get the token id of a non existent address", async function () {
      const { predictorPass, owner } = await loadFixture(deployContract);
      const expectedId = 1;

      await expect(predictorPass.playerPassId(owner.address)).to.be.revertedWith("ERC721: owner query for nonexistent token");
    });

    it("Should not get the token type of a non existent address", async function () {
      const { predictorPass, owner } = await loadFixture(deployContract);
      const expectedId = 1;

      await expect(predictorPass.getPassType(expectedId)).to.be.revertedWith("ERC721: owner query for nonexistent token");
    });      
  });
});