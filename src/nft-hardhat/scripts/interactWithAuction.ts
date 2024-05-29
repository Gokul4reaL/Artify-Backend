import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0xCb0CD74Fc48d98340aB1C655E05DE67d3d3ee165";

  // Connect to your deployed contract
  const Auction = await ethers.getContractAt("AdvancedArtworkAuction", contractAddress);

  // Make sure you have an account to interact with the contract
  const [owner] = await ethers.getSigners();

  console.log("Minting an NFT and creating a new auction...");
  const mintTx = await Auction.connect(owner).mintAndStartAuction("tokenURI", ethers.parseEther("1"), 300); // 1 ETH starting price, 300 seconds duration
  await mintTx.wait(); // Wait for the transaction to be mined
  console.log("NFT minted and auction created.");

  const tokenId = 0;

  console.log(`Placing a bid on token ID ${tokenId}...`);
  const bidTx = await Auction.connect(owner).placeBid(tokenId, { value: ethers.parseEther("1.1") }); // Placing a bid of 1.1 ETH
  await bidTx.wait(); // Wait for the transaction to be mined

  console.log("Bid placed successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
