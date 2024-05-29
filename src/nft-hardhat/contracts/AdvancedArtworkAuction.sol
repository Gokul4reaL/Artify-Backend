// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AdvancedArtworkAuction is ERC721URIStorage, ReentrancyGuard {
    struct AuctionItem {
        string nftId;
        uint256 startingPrice;
        bool isSold;
    }

    struct Auction {
        address payable seller;
        uint256 highestBid;
        address payable highestBidder;
        uint256 endTime;
        uint256 startTime;
        bool active;
        string auctionName;
        AuctionItem[] items;
    }

    mapping(string => Auction) public auctions;
    mapping(string => mapping(address => uint256)) public bids;
    string[] private activeAuctions;

    event AuctionCreated(string auctionId, string auctionName, uint256 startTime, uint256 endTime);
    event AuctionEnded(string auctionId, string auctionName, address winner, uint256 amount);
    event BidPlaced(string auctionId, address bidder, uint256 amount);
    event BidWithdrawn(string auctionId, address bidder, uint256 amount);
    event ItemSold(string auctionId, string nftId, address buyer, uint256 soldPrice);

    constructor() ERC721("AdvancedArtworkAuction", "AAUCT") {}

    function sellItem(string memory auctionId, string memory nftId) external payable nonReentrant {
        require(auctions[auctionId].active, "Auction is not active.");
        bool found = false;

        for (uint256 i = 0; i < auctions[auctionId].items.length; i++) {
            if (keccak256(abi.encodePacked(auctions[auctionId].items[i].nftId)) == keccak256(abi.encodePacked(nftId)) && !auctions[auctionId].items[i].isSold) {
                require(msg.value >= auctions[auctionId].highestBid, "Insufficient funds sent.");

                auctions[auctionId].items[i].isSold = true;
                auctions[auctionId].highestBidder = payable(address(0)); // Reset the highest bidder
                auctions[auctionId].highestBid = 0; // Reset the highest bid

                emit ItemSold(auctionId, nftId, msg.sender, msg.value);
                found = true;
                break;
            }
        }
        require(found, "Item not found or already sold.");
    }

    function mintAndStartAuction(
        string memory auctionId,
        string[] memory tokenURIs,
        uint256[] memory startingPrices,
        uint256 startTime,
        uint256 endTime,
        string memory auctionName,
        string[] memory nftIds
    ) external {
        require(tokenURIs.length == startingPrices.length && startingPrices.length == nftIds.length, "Array lengths must match");
        require(!auctions[auctionId].active, "Auction already active");
        require(endTime == 0 || startTime < endTime, "End time must be after start time or zero.");

        Auction storage auction = auctions[auctionId];
        for (uint i = 0; i < nftIds.length; i++) {
            uint256 tokenId = uint256(keccak256(abi.encodePacked(nftIds[i])));
            _mint(msg.sender, tokenId);
            _setTokenURI(tokenId, tokenURIs[i]);
            auction.items.push(AuctionItem({
                nftId: nftIds[i],
                startingPrice: startingPrices[i],
                isSold: false
            }));
        }

        auction.seller = payable(msg.sender);
        auction.startTime = startTime;
        auction.endTime = endTime;
        auction.active = true;
        auction.auctionName = auctionName;
        activeAuctions.push(auctionId);  // Add to active auctions list

        emit AuctionCreated(auctionId, auctionName, startTime, endTime);
    }

    function placeBid(string memory auctionId, uint256 amount) external payable nonReentrant {
        require(auctions[auctionId].active, "Auction is not active.");
        require(amount > auctions[auctionId].highestBid, "Bid not high enough.");

        if (bids[auctionId][msg.sender] > 0) {
            payable(msg.sender).transfer(bids[auctionId][msg.sender]);
        }

        bids[auctionId][msg.sender] = amount;
        auctions[auctionId].highestBid = amount;
        auctions[auctionId].highestBidder = payable(msg.sender);

        emit BidPlaced(auctionId, msg.sender, amount);
    }

    function endAuction(string memory auctionId) external nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.active, "Auction is not active.");
        require(msg.sender == auction.seller, "Only the seller can end the auction");
        require(auction.endTime == 0 || block.timestamp >= auction.endTime, "Auction cannot end before the designated end time or is indefinite.");

        auction.active = false;
        if (auction.highestBidder != address(0)) {
            auction.seller.transfer(auction.highestBid);
        }

        // Remove from active auctions list
        for (uint i = 0; i < activeAuctions.length; i++) {
            if (keccak256(abi.encodePacked(activeAuctions[i])) == keccak256(abi.encodePacked(auctionId))) {
                activeAuctions[i] = activeAuctions[activeAuctions.length - 1];
                activeAuctions.pop();
                break;
            }
        }

        emit AuctionEnded(auctionId, auction.auctionName, auction.highestBidder, auction.highestBid);
    }

    function getActiveAuctions() public view returns (string[] memory) {
        return activeAuctions;
    }

    function isAuctionActive(string memory auctionId) public view returns (bool) {
        return auctions[auctionId].active;
    }
}
