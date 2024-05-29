import { singleStyleRepository } from "./single-style-repository";

class SingleStyleResolver {
    async uploadImage(payload: any): Promise<any> {
        return await singleStyleRepository.uploadImage(payload);
    }

    async generateImage(payload: any): Promise<any> {
        return await singleStyleRepository.generateImage(payload);
    }

    async getImages(): Promise<any> {
        return await singleStyleRepository.getImages();
    }
}

export const singleStyleResolver = new SingleStyleResolver();
