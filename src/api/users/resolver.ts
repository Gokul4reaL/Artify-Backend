// api/users/resolver.ts

import { userRepository } from './user-repository';

class UserResolver {
    async login(payload: any): Promise<any> {
        return await userRepository.login(payload);
    }

    async register(payload: any): Promise<any> {
        return await userRepository.register(payload);
    }

    async createProfile(payload: any): Promise<any> {
        return await userRepository.createProfile(payload);
    }

    async checkUserName(payload: any): Promise<any> {
        return await userRepository.checkUserName(payload);
    }
}

export const userResolver = new UserResolver();
