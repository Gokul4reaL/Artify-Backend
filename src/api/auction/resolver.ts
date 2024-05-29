import { auctionRepository } from "./auction-repository";

class AuctionResolver {

    async createNFT(payload: any): Promise<any> {
        return await auctionRepository.createNFT(payload);
    }

    async qualityCheck(payload: any): Promise<any> {
        return await auctionRepository.qualityCheck(payload);
    }

    async fetchActiveAuctions(): Promise<any> {
        return await auctionRepository.fetchActiveAuctions();
    }

    async getSignerInfo(): Promise<any> {
        return await auctionRepository.getSignerInfo();
    }

    async startAuction(payload: any): Promise<any> {
        return await auctionRepository.startAuction(payload);
    }

    async auctionInfo(payload: any): Promise<any> {
        return await auctionRepository.auctionInfo(payload);
    }

    async placeBid(payload: any): Promise<any> {
        return await auctionRepository.placeBid(payload);
    }

    async sellItem(payload: any): Promise<any> {
        return await auctionRepository.sellItem(payload);
    }

    async endAuction(payload: any): Promise<any> {
        return await auctionRepository.endAuction(payload);
    }
}

export const auctionResolver = new AuctionResolver();