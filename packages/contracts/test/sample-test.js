const { expect } = require("chai");

describe("NFT", function() {
  it("NFT basic test", async function() {
    const [signer, badSigner] = await ethers.getSigners();
    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy();
    expect(await nft.name()).to.equal("name");
    await nft.mint(signer.address);
    expect(await nft.balanceOf(signer.address)).to.equal(1);
    await expect(nft.connect(badSigner).mint(signer.address)).to.revertedWith("ERC721PresetMinterPauserAutoId: must have minter role to mint")
  });
});