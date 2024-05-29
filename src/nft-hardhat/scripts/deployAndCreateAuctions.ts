// scripts/deployAndCreateAuctions.js

const { ethers } = require("hardhat");

async function main() {
  // Deploy the contract
  const AuctionContract = await ethers.getContractFactory("AdvancedArtworkAuction");
  const auctionContract = await AuctionContract.deploy();
  await auctionContract.waitForDeployment();
  console.log("Contract deployed to:", auctionContract.target);

  // Create some auctions
  await createAuction(auctionContract, "tokenURI1", ethers.parseEther("1"), 300);
  await createAuction(auctionContract, "tokenURI2", ethers.parseEther("2"), 600);
  await createAuction(auctionContract, "tokenURI3", ethers.parseEther("3"), 900);

  console.log("Auctions created.");
}
async function createAuction(contract: { mintAndStartAuction: (arg0: any, arg1: any, arg2: any) => any; }, tokenURI: string, startingPrice: any, duration: number) {
    const tx = await contract.mintAndStartAuction(tokenURI, startingPrice, duration);
    await tx.wait();
    console.log(`Auction created with tokenURI: ${tokenURI}, startingPrice: ${startingPrice}, duration: ${duration}`);
  }

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
