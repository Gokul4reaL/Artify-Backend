import { multiStyleRepository } from "./multi-style-repository";

class MultiStyleResolver {
    async uploadImage(payload: any): Promise<any> {
        return await multiStyleRepository.uploadImage(payload);
    }

    async generateImage(payload: any): Promise<any> {
        return await multiStyleRepository.generateImage(payload);
    }

    async getImages(): Promise<any> {
        return await multiStyleRepository.getImages();
    }
}

export const multiStyleResolver = new MultiStyleResolver();
