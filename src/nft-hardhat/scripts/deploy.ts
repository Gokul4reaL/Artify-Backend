import { ethers } from "hardhat";
const fs = require('fs');
const path = require('path');

async function main() {
  // Deploy the contract
  const AuctionContract = await ethers.getContractFactory("AdvancedArtworkAuction");
  const auctionContract = await AuctionContract.deploy();
  await auctionContract.waitForDeployment();
  console.log("Contract deployed to:", auctionContract.target);
  updateEnvFile(auctionContract.target);


}

function updateEnvFile(contractAddress: any) {
  const envPath = path.join(__dirname, '..', '..','..', '.env');
  const content = `CONTRACT_ADDRESS=${contractAddress}\n`;

  if (fs.existsSync(envPath)) {
    let envContents = fs.readFileSync(envPath, 'utf8');
    
    // Regex to match the line and consider end of file without newline
    const regex = new RegExp(`^CONTRACT_ADDRESS=.*`, 'gm');

    // Check if the CONTRACT_ADDRESS exists in the file
    if (regex.test(envContents)) {
      // Replace existing line
      envContents = envContents.replace(regex, content);
    } else {
      // Append new line if not found
      envContents += (envContents.endsWith('\n') ? '' : '\n') + content;
    }

    fs.writeFileSync(envPath, envContents);
  } else {
    // Create new .env file with the content
    fs.writeFileSync(envPath, content + '\n');  // Add newline for possible future additions
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
