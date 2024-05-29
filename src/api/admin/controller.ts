import * as Hapi from 'hapi';
import { generateToken } from '../../middleware/authenticate'; // Import generateToken function
import { adminResolver } from './resolver';

class AdminController {
    public login = async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<any> => {
        try {
            //@ts-ignore
            const payload = request.body;
            const data = await adminResolver.login(payload);            
            if (!data) {
                return { message: 'Invalid username or password' };
            }
            // Generate token
            const token = generateToken({data});
            return token;
        } catch (error : any) {
            console.error('Error logging in:', error.message);
            return { message: 'Internal server error' };
        }
    };

    public register = async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<any> => {
        try {
            //@ts-ignore
            const payload = request.body;
            const data: any = await adminResolver.register(payload);
            return data;
        } catch (error : any) {
            console.error('Error registering user:', error.message);
            return { message: 'Internal server error' };
        }
    };

    public createProfile = async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<any> => {
        try {
            //@ts-ignore
            const payload = request.body;
            const data: any = await adminResolver.createProfile(payload);
            return data;
        } catch (error : any) {
            console.error('Error registering user:', error.message);
            return { message: 'Internal server error' };
        }
    };

    public checkUserName = async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<any> => {
        try {
            //@ts-ignore
            const payload = request.body;
            const data: any = await adminResolver.checkUserName(payload);
            return data;
        } catch (error : any) {
            console.error('Error registering user:', error.message);
            return { message: 'Internal server error' };
        }
    };

    public getNFTS = async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<any> => {
        try {
            //@ts-ignore
            const data: any = await adminResolver.getNFTS();
            return data;
        } catch (error : any) {
            console.error('Error registering user:', error.message);
            return { message: 'Internal server error' };
        }
    };

    public getAuctions = async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<any> => {
        try {
            //@ts-ignore
            const data: any = await adminResolver.getAuctions();
            return data;
        } catch (error : any) {
            console.error('Error registering user:', error.message);
            return { message: 'Internal server error' };
        }
    };

    public createAuctions = async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<any> => {
        try {
            //@ts-ignore
            const payload = request.body;
            const data: any = await adminResolver.createAuctions(payload);
            return data;
        } catch (error : any) {
            console.error('Error registering user:', error.message);
            return { message: 'Internal server error' };
        }
    };

    public addToAuction = async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<any> => {
        try {
            //@ts-ignore
            const payload = request.body;
            const data: any = await adminResolver.addToAuction(payload);
            return data;
        } catch (error : any) {
            console.error('Error registering user:', error.message);
            return { message: 'Internal server error' };
        }
    };


}

export default new AdminController();
