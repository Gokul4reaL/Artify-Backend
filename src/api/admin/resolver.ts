// api/users/resolver.ts
import { adminRepository } from "./admin-repository";
import { auctionRepository } from "../auction/auction-repository";

class AdminResolver {
    async login(payload: any): Promise<any> {
        return await adminRepository.login(payload);
    }

    async register(payload: any): Promise<any> {
        return await adminRepository.register(payload);
    }

    async createProfile(payload: any): Promise<any> {
        return await adminRepository.createProfile(payload);
    }

    async checkUserName(payload: any): Promise<any> {
        return await adminRepository.checkUserName(payload);
    }

    async getNFTS(): Promise<any> {
        return await adminRepository.getNFTS();
    }

    async getAuctions(): Promise<any> {
        return await adminRepository.getAuctions();
    }

    async createAuctions(payload: any): Promise<any> {
        return await adminRepository.createAuctions(payload);
    }

    async addToAuction(payload: any): Promise<any> {
        return await adminRepository.addToAuction(payload);
    }
}

export const adminResolver = new AdminResolver();
