import { ethers } from "hardhat";

async function main() {

  // Deploy the AdvancedArtworkAuction contract
  const AdvancedArtworkAuctionFactory = await ethers.getContractFactory("AdvancedArtworkAuction");
  const advancedArtworkAuction = await AdvancedArtworkAuctionFactory.deploy();
  
  await advancedArtworkAuction.waitForDeployment();

  console.log("AdvancedArtworkAuction deployed to:", advancedArtworkAuction.target);

  // Example of interacting with the contract after deployment, if needed:
  // Adjust these values or the method according to your contract's actual functionalities.
  // const createAuctionTx = await advancedArtworkAuction.createTokenAndStartAuction(startingPrice, duration);
  // await createAuctionTx.wait(); // Wait for the transaction to be mined

  // Assuming your contract emits an event when an auction is created,
  // you can listen to that event or query past events for confirmation.
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
