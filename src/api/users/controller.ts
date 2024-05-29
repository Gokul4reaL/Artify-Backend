import * as Hapi from 'hapi';
import { userResolver } from './resolver';
import { generateToken } from '../../middleware/authenticate'; // Import generateToken function

class UserController {
    public login = async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<any> => {
        try {
            //@ts-ignore
            const payload = request.body;
            const data = await userResolver.login(payload);            
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
            const data: any = await userResolver.register(payload);
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
            const data: any = await userResolver.createProfile(payload);
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
            const data: any = await userResolver.checkUserName(payload);
            return data;
        } catch (error : any) {
            console.error('Error registering user:', error.message);
            return { message: 'Internal server error' };
        }
    };

}

export default new UserController();
