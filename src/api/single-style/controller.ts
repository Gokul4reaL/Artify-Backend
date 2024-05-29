import * as Hapi from 'hapi';
import { singleStyleResolver } from './resolver';

class SingleStyleController {
    public uploadImage = async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<any> => {
        try {
            //@ts-ignore
            const payload = request.body;
            const data: any = await singleStyleResolver.uploadImage(payload);
            return data;
        } catch (error : any) {
            console.error('Error registering user:', error.message);
            return { message: 'Internal server error' };
        }
    };

    public generateImage = async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<any> => {
        try {
            //@ts-ignore
            const payload = request.body;
            const data: any = await singleStyleResolver.generateImage(payload);
            return data;
        } catch (error : any) {
            console.error('Error registering user:', error.message);
            return { message: 'Internal server error' };
        }
    };

    public getImages = async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<any> => {
        try {
            //@ts-ignore
            const data: any = await singleStyleResolver.getImages();
            return data;
        } catch (error : any) {
            console.error('Error registering user:', error.message);
            return { message: 'Internal server error' };
        }
    };

}

export default new SingleStyleController();