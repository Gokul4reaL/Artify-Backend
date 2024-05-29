import mime from "mime";
import { NFT } from "../../model/nfts";
import { google } from "googleapis";
const fs = require('fs');
const keys = require('../../keys.json'); // Path to your keys.json file
const sharp = require('sharp');
const pdf = require('pdf-parse');
import parse from 'csv-parser';
import * as officeparser from 'officeparser';
const { extname } = require('path');
const { exec } = require('child_process');
import { ethers } from 'ethers';
import auctionContract from '../../nft-hardhat/artifacts/contracts/AdvancedArtworkAuction.sol/AdvancedArtworkAuction.json';
import dotenv from 'dotenv';
import { Auction } from "../../model/auctions";
import { NFTAuction } from "../../model/nft_auctions";
import axios from "axios";
import { User } from "../../model/users";
import { UserProfile } from "../../model/users_profile";
dotenv.config();


class AuctionRepository {

  private provider: ethers.JsonRpcProvider;
  private contract?: ethers.Contract;
  private contractAddress: string;

    constructor() {
      this.initialize();
    }
    
    private async initialize() {
        this.provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
        this.contractAddress = process.env.CONTRACT_ADDRESS; // Ensure this is set in your .env
        console.log("Contract Address: ", this.contractAddress);
        this.contract = new ethers.Contract(this.contractAddress, auctionContract.abi, await this.provider.getSigner(0));
    }


  async createNFT(payload: any) {
    try {
      // Extract data from the payload
      const nft_name = payload.nft_name;
      const description = payload.description;
      const seller_id = payload.seller_id;
      const starting_price = payload.starting_price;
      const sold_price = payload.sold_price;
      const bidding_history = payload.bidding_history;

      const nft_item: any = await this.uploadNFT(payload);

      // Create the NFT entry in the database
      const createdNFT = await NFT.create({
        nft_name,
        description,
        seller_id,
        nft_item,
        starting_price,
        sold_price,
        bidding_history,
      });

      return "success";
    } catch (error) {
      // Handle error appropriately
      console.error("Error creating NFT:", error);
      throw error; // Throw the error for handling in the caller function
    }
  }

  async uploadNFT(payload: any) {
    try {
      if (!payload || !payload.nft_item || !payload.seller_id) {
        throw new Error("Missing image or userID");
      }

      const { name, type, content } = payload.nft_item;

      // Decode base64-encoded file data (if applicable)
      const fileData = Buffer.from(
        content.split(";base64,").pop() || "",
        "base64"
      );

      // Save the file to a temporary file
      const tempFilePath = `./uploads/${name}`;
      fs.writeFileSync(tempFilePath, fileData);

      // Upload the temporary file to Google Drive
      const fileId = await this.uploadToGoogleDrive(
        tempFilePath,
        type,
        name,
        payload
      );

      // Delete the temporary file
      fs.unlinkSync(tempFilePath);

      return fileId;
    } catch (error) {
      console.error("Error uploading file to Google Drive:", error);
      throw error;
    }
  }

  async uploadToGoogleDrive(
    filePath: any,
    mimeType: any,
    fileName: any,
    payload: any
  ) {
    const userId = payload.seller_id.slice(-6);
    const imageExtensionIndex = fileName.lastIndexOf("."); // Find the last occurrence of '.'
    const imageNameWithoutExtension =
      imageExtensionIndex !== -1
        ? fileName.substring(0, imageExtensionIndex)
        : fileName; // Remove extension if found
    const currentMinute = new Date().getTime(); // Get the current minute
    const uploadedFileName = `${imageNameWithoutExtension}_${userId}_${currentMinute}`; // Combine userID, image name without extension, and current minute

    const auth = new google.auth.GoogleAuth({
      credentials: keys,
      scopes: ["https://www.googleapis.com/auth/drive"], // Scopes for accessing Google Drive
    });
    const drive = google.drive({ version: "v3", auth });

    // Upload the file to Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: uploadedFileName,
        mimeType,
        parents: ["1YA_f-4kns8Xv55x0mYRSE4oB3_Q8v-p5"], // Folder ID should be specified
      },
      media: {
        mimeType,
        body: fs.createReadStream(filePath),
      },
    });

    return response.data.id;
  }

  async qualityCheck(payload: any) {
    const { name, type, content } = payload;
    const fileData = Buffer.from(
      content.split(";base64,").pop() || "",
      "base64"
    );
    const tempFilePath = `./uploads/${name}`;
    fs.writeFileSync(tempFilePath, fileData);
    console.log("Type: ", type);
    console.log(type.split("/")[0]);

    try {
      switch (type.split("/")[0]) {
        case "image":
          await this.validateImage(tempFilePath);
          return "Image is valid";
        case "audio":
          await this.validateMedia(tempFilePath);
          return "Audio is valid";
        case "video":
          await this.validateMedia(tempFilePath);
          return "Video is valid";
        case "application":
          if (type === "application/pdf") {
            await this.validatePDF(tempFilePath);
            return "PDF is valid";
          } else if (
            type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          ) {
            await this.validateOffice(tempFilePath); // Assuming validateOffice can handle DOCX files
            return "Word document is valid";
          } else if (
            type ===
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          ) {
            await this.validateOffice(tempFilePath); // Assuming validateOffice can handle XLSX files
            return "Excel document is valid";
          } else if (
            type ===
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"
          ) {
            await this.validateOffice(tempFilePath); // Assuming validateOffice can handle PPTX files
            return "PowerPoint presentation is valid";
          } else {
            throw new Error("Unsupported file type");
          }
        case "text":
          if (type === "text/csv") {
            await this.validateOffice(tempFilePath); // Assuming validateOffice can handle XLSX files
            return "Excel document is valid";
          }
        default:
          throw new Error("Unsupported file type");
      }
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      fs.unlinkSync(tempFilePath); // Clean up the uploaded file
    }
  }

  async validateImage(filePath: any) {
    const metadata = await sharp(filePath).metadata();
    if (metadata.width < 800 || metadata.height < 600) {
      throw new Error("Image resolution too low");
    }
  }

async validateMedia(filePath: any) {
  return new Promise((resolve, reject) => {
    const extension = extname(filePath).toLowerCase();
    let command;
    if (['.mp3', '.wav', '.aac', '.mp4', '.mov', '.avi'].includes(extension)) {
      // For both audio and video files
      command = `ffmpeg -i ${filePath} -f null -`;
    } else {
      reject(new Error('Unsupported media file format'));
      return;
    }

    exec(command, async (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.error("Error during ffmpeg processing:", error);
        reject(new Error('Invalid media file'));
        return;
      }
      const duration = await this.extractDuration(stderr);
      if (duration >= 30) {
        resolve(`Media file duration is sufficient: ${duration} seconds.`);
      } else {
        reject(new Error(`Media file duration is too short: ${duration} seconds.`));
      }
    });
  });
}

async extractDuration(stderr: string) {
  const matches = stderr.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2}),/);
  if (matches) {
    const hours = parseInt(matches[1]);
    const minutes = parseInt(matches[2]);
    const seconds = parseFloat(matches[3]);
    return hours * 3600 + minutes * 60 + seconds;
  } else {
    throw new Error('Unable to extract duration from ffmpeg output.');
  }
}

  
  async validatePDF(filePath: any) {
    try {
      // Read PDF file as bytes
      const dataBuffer = fs.readFileSync(filePath);

      // Parse PDF document
      const pdfData = await pdf(dataBuffer);

      // Extract text from PDF
      const text = pdfData.text;

      // Extract metadata from PDF
      const metadata = {
        info: pdfData.info,
        metadata: pdfData.metadata,
      };
      return { text, metadata };
    } catch (error: any) {
      console.error("Error extracting text and metadata:", error.message);
      throw error;
    }
  }

  async validateOffice(filePath: string) {
  // Check if the file is an Office document (docx, xlsx, pptx) or a CSV file
  const mimeType = mime.lookup(filePath);
  if (
    !mimeType ||
    (!mimeType.startsWith('application/vnd.openxmlformats-officedocument') && // Office documents
      mimeType !== 'text/csv') // CSV files
  ) {
    throw new Error('Invalid file type. Only Office documents (docx, xlsx, pptx) and CSV files are supported.');
  }

  // If the file is a CSV file, validate it directly without further processing
  if (mimeType === 'text/csv') {
    return new Promise<void>((resolve, reject) => {
      // Example: Perform CSV validation checks
      const stream = fs.createReadStream(filePath)
        .on('error', reject)
        .pipe(parse({ headers: true }));
      
      let rowCount = 0;
      stream.on('data', (row: any) => {
        // Example: Validate CSV rows
        // Here you can check if the rows meet your quality criteria
        rowCount++;
      });
      
      stream.on('end', () => {
        if (rowCount < 10) {
          reject(new Error('CSV file must contain at least 10 rows.'));
        } else {
          resolve();
        }
      });
    });
  }

  // If the file is a PowerPoint (PPTX) file, validate it using the validatePowerPoint function
  if (mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
    await this.validatePowerPoint(filePath);
    return;
  }

  return new Promise<void>((resolve, reject) => {
    officeparser.parseOffice(filePath, function(data: { macro: any; }) {
      if (data && data.macro) {
        reject(new Error('Office document contains macros'));
      } else {
        resolve();
      }
    });
  });

}

async validatePowerPoint(filePath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    officeparser.parseOffice(filePath, function(data: { macro: any }) {
      if (data && data.macro) {
        reject(new Error('PowerPoint presentation contains macros'));
      } else {
        resolve();
      }
    });
  });
}

async startAuction(payload: any) {    
  try {
      // Convert startTime from ISO string to a UNIX timestamp (seconds since epoch)
      const startTime = Math.floor(new Date(payload.start_time).getTime() / 1000);
      const endTime = payload.end_time ? Math.floor(new Date(payload.end_time).getTime() / 1000) : 0;

      if (payload.nft_items_count === 0 || !payload.auction_items || payload.auction_items.length === 0) {
          console.log(`No items to auction in ID: ${payload.auction_id}`);
          throw new Error("No auction items provided.");
      }

      const validItems = payload.auction_items.filter((item: any) => item.nft_id && item.starting_price != null);
      const nftIds = validItems.map((item: any) => item.nft_id);
      const startingPrices = validItems.map((item: any) => ethers.parseUnits(item.starting_price.toString(), 'wei'));

      const tokenURIs = nftIds.map((id: string) => `uri-for-${id}`); // Placeholder for token URI generation

      console.log(`Starting auction with ID: ${payload.auction_id}`);
      console.log("Converted startTime:", startTime);
      console.log("Converted endTime:", endTime);
      console.log("NFT IDs:", nftIds);
      console.log("Starting Prices (in wei):", startingPrices.map((price: { toString: () => any; }) => price.toString()));
      console.log("Auction Name:", payload.auction_name);

      if (validItems.length === 0) {
          console.log(`No valid items for auction ID: ${payload.auction_id}`);
          throw new Error("No valid auction items provided.");
      }

      const auctionActive = await this.contract.isAuctionActive(payload.auction_id);
      if (auctionActive) {
      console.error(`Auction ${payload.auction_id} is already active.`);
      return; // Or handle this scenario appropriately
      }


      const transaction = await this.contract.mintAndStartAuction(
          payload.auction_id,
          tokenURIs,
          startingPrices,
          startTime,
          endTime,
          payload.auction_name,
          nftIds
      );

      await transaction.wait();  // Wait for the transaction to be mined
      console.log(`Auction ${payload.auction_id} started successfully.`);
  } catch (error: any) {
      console.error(`Failed to start auction ${payload.auction_id}:`, error);
      throw new Error(`Error starting the auction: ${error.message}`);
  }
}

async fetchActiveAuctions() {
  try {
      const activeAuctionIds = await this.contract.getActiveAuctions();
      console.log("Active Auction IDs:", activeAuctionIds);

      let auctionsDetails: any[] = [];

      console.log("Fetching Auctions Details:");
      for (const auctionId of activeAuctionIds) {
          const auctionDetails = await this.getAuctionDetails(auctionId);
          auctionsDetails.push(auctionDetails);
      }

      console.log("Auctions Details:", auctionsDetails);
      return auctionsDetails;
  } catch (error) {
      console.error("Failed to fetch active auctions:", error);
      throw new Error("Error fetching active auctions");
  }
}

async getAuctionDetails(auctionId: string) {
  try {
      // Fetch details of the auction from the auctions table
      const auction = await Auction.findOne({
          where: { auction_id: auctionId },
          attributes: ['auction_id', 'auction_name', 'start_time', 'end_time'],
          raw: true
      });

      // Fetch associated NFT items from the NFTAuctions table
      const nftAuctions = await NFTAuction.findAll({
          where: { auction_id: auctionId },
          attributes: ['nft_id'],
          raw: true
      });

      // Fetch additional details for each NFT item from the NFT table
      const nftItemsPromises = nftAuctions.map(async (nftAuction: any) => {
          const nftDetails = await NFT.findByPk(nftAuction.nft_id, {
              attributes: ['nft_id', 'nft_name', 'starting_price', 'description', 'nft_item']
          });
          return nftDetails;
      });

      const nftItems = await Promise.all(nftItemsPromises);

      // Combine auction details with NFT items information
      const auctionDetails = {
          ...auction,
          nft_items: nftItems
      };

      return auctionDetails;
  } catch (error) {
      console.error(`Failed to fetch details for auction ${auctionId}:`, error);
      throw new Error(`Error fetching details for auction ${auctionId}`);
  }
}

async getSignerInfo() {
    const signer = await this.provider.getSigner();
    const address = await signer.getAddress();
    const balance = await this.getAccountBalance(address);
    return { address, balance };
}

async getAccountBalance(address: string): Promise<string> {
  try {
    const balance = await this.provider.getBalance(address);
    console.log(`Fetched account balance for address ${address}: ${balance}`);
    return ethers.formatEther(balance) + ' ETH';
  } catch (error) {
    console.error('Error fetching account balance:', error);
    throw error;
  }
}

async auctionInfo(payload: any) {
  try {
      const auctionId = payload.auction_id;

      // Fetch auction details
      const auction = await Auction.findOne({
          where: { auction_id: auctionId },
          include: [{ model: NFTAuction, attributes: ['nft_id'] }]
      });

      if (!auction) {
          throw new Error('Auction not found');
      }

      // Extract nft_ids from the fetched auction
      const nftIds = auction.auction_items.map((nftAuction: { nft_id: any }) => nftAuction.nft_id);

      // Fetch nft items details based on nft_ids
      const nftItems = await NFT.findAll({ where: { nft_id: nftIds } });

      // Fetch seller details for each nft_item
      const modifiedNftItems = await Promise.all(nftItems.map(async (nftItem: any) => {
          // Fetch seller details
          const seller = await UserProfile.findOne({ where: { user_id: nftItem.seller_id } });
          
          // Modify nft_item here
          const modifiedNftItem = { ...nftItem.dataValues, nft_item: await this.modifyNFTItem(nftItem.nft_item), seller };
          return modifiedNftItem;
      }));

      return { auction, modifiedNftItems };
  } catch (error) {
      console.error('Error fetching auction info:', error);
      throw new Error('Failed to fetch auction info');
  }
}



async modifyNFTItem(nftItem: string) {
  try {
      // Add a prefix to the nft_item
      console.log("NFT Item: ", nftItem);
      const downloadUrl = `https://drive.google.com/uc?id=${nftItem}`;
      const response = await axios.get(downloadUrl, {
          responseType: "arraybuffer", // Set response type to array buffer to receive binary data
      });

      if (response.status === 200) {
          let contentType = response.headers['content-type'];
          let base64Content = '';
          
          if (contentType.startsWith('image')) {
              // If content type is image, no need to process, return directly
              base64Content = Buffer.from(response.data, "binary").toString("base64");
          } else {
              // Extract file extension from the content-disposition header
              base64Content = Buffer.from(response.data, "binary").toString("base64");
              const contentDisposition = response.headers['content-disposition'];
              const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
              let fileExtension = '';
              if (filenameMatch) {
                  const filename = filenameMatch[1];
                  fileExtension = filename.split('.').pop().toLowerCase();
              }
              console.log("file extension: ", fileExtension);

              // Check file extension to determine the file type
              if (fileExtension === 'pdf') {
                  contentType = 'application/pdf';
              } else if (fileExtension === 'doc' || fileExtension === 'docx') {
                  contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
              } else if (fileExtension === 'xls' || fileExtension === 'xlsx') {
                  contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
              } else if (fileExtension === 'csv') {
                  contentType = 'text/csv';
              } else if (fileExtension === 'ppt' || fileExtension === 'pptx') {
                  contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
              } else if (fileExtension === 'mp3' ||
              fileExtension === 'wav' ||
              fileExtension === 'aac') {
                  contentType = `audio/${fileExtension}`;
              } else if (fileExtension === 'mp4' ||
              fileExtension === 'mov' ||
              fileExtension === 'avi') {
                  contentType = `video/${fileExtension}`;
              } else {
                  contentType = 'application/octet-stream'
              }
          }

          return  `data:${contentType};base64,${base64Content}`;
      } else {
          return nftItem;
      }
  } catch (error) {
      console.error("Error modifying NFT item:", error);
      return nftItem;
  }
}

async placeBid(payload: any) {
  console.log("Payload: ", payload);
  try {
    const auction = await this.contract.auctions(payload.auction_id);
        const currentHighestBid = auction.highestBid;

        // Convert bidAmount to Wei
        const bidAmountWei = ethers.parseEther(payload.bidAmount.toString());

        // Check if the new bid is higher than the current highest bid
        if (bidAmountWei <= currentHighestBid) {
            console.error('Your bid must be higher than the current highest bid of', ethers.formatEther(currentHighestBid), 'ETH');
            return;
        }

        // Place the bid
        const transactionResponse = await this.contract.placeBid(
            payload.auction_id,
            bidAmountWei, {
                value: bidAmountWei  // Send the Ether along with the transaction
            }
        );
        await transactionResponse.wait();
    // Update bidding history in the nft table
    const nftId = payload.nft_id; // Assuming you have the nft_id
    const bidAmount = payload.bidAmount; // Convert bid amount to ether
    const biddingHistoryEntry = {
      auction_id: payload.auction_id,
      amount: bidAmount,
    }; // Construct bidding history entry as JSON object

    const nft = await NFT.findOne({ where: { nft_id: nftId } });
    let currentBiddingHistory = nft.bidding_history || {}; // Initialize as empty object if no bidding history exists

    const maxNumericKey = Object.keys(currentBiddingHistory)
  .map(Number)
  .reduce((max, curr) => Math.max(max, curr), -1);

// Use the next sequential numeric key
const nextNumericKey = maxNumericKey + 1;

const newBiddingHistory = {
  ...currentBiddingHistory,
  [nextNumericKey]: biddingHistoryEntry,
};

    await NFT.update(
      { bidding_history: newBiddingHistory },
      { where: { nft_id: nftId } }
    );

    console.log("Bidding history updated in the nft table!");
  } catch (error) {
    console.error("Error placing bid:", error);
  }
}

async sellItem(payload: any) {
  try {
      // Call the sellItem function on the contract
      const transactionResponse = await this.contract.sellItem(
          payload.auction_id,
          payload.nft_id, {
              value: ethers.parseEther(payload.sold_price.toString())  // Specify the amount of Ether to send
          }
      );

      // Wait for the transaction to be confirmed
      await transactionResponse.wait();

      // Update the sold_price in the NFT table
      await NFT.update(
          { sold_price: payload.sold_price },
          { where: { nft_id: payload.nft_id } }
      );

      console.log('Item sold successfully!');
  } catch (error) {
      console.error('Error selling item:', error);
  }
}

async endAuction(payload: any) {
  try {
      // Call the endAuction function on the contract
      const transactionResponse = await this.contract.endAuction(payload.auction_id);

      // Wait for the transaction to be confirmed
      await transactionResponse.wait();

      console.log('Auction ended successfully!');
  } catch (error) {
      console.error('Error ending auction:', error);
  }
}


}

export const auctionRepository = new AuctionRepository();


