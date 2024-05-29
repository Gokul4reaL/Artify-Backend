import * as Hapi from 'hapi';
import { auctionResolver } from './resolver';
import { generateToken } from '../../middleware/authenticate'; // Import generateToken function

class AuctionController {
    public createNFT = async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<any> => {
        try {
            //@ts-ignore
            const payload = request.body;
            const data = await auctionResolver.createNFT(payload);            
            return data;
        } catch (error : any) {
            console.error('Error logging in:', error.message);
            return { message: 'Internal server error' };
        }
    };

    public qualityCheck = async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<any> => {
        try {
            //@ts-ignore
            const payload = request.body;
            const data = await auctionResolver.qualityCheck(payload);            
            return data;
        } catch (error : any) {
            console.error('Error logging in:', error.message);
            return { message: 'Internal server error' };
        }
    };

    public startAuction = async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<any> => {
        try {
            //@ts-ignore
            const payload = request.body;
            const data: any = await auctionResolver.startAuction(payload);
            return data;
        } catch (error : any) {
            console.error('Error registering user:', error.message);
            return { message: 'Internal server error' };
        }
    };

    public fetchActiveAuctions = async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<any> => {
        try {
            //@ts-ignore
            const data = await auctionResolver.fetchActiveAuctions();            
            return data;
        } catch (error : any) {
            console.error('Error logging in:', error.message);
            return { message: 'Internal server error' };
        }
    };

    public getSignerInfo = async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<any> => {
        try {
            //@ts-ignore
            const data = await auctionResolver.getSignerInfo();            
            return data;
        } catch (error : any) {
            console.error('Error logging in:', error.message);
            return { message: 'Internal server error' };
        }
    };

    public auctionInfo = async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<any> => {
        try {
            //@ts-ignore
            const payload = request.body;
            const data: any = await auctionResolver.auctionInfo(payload);
            return data;
        } catch (error : any) {
            console.error('Error registering user:', error.message);
            return { message: 'Internal server error' };
        }
    };

    public placeBid = async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<any> => {
        try {
            //@ts-ignore
            const payload = request.body;
            const data: any = await auctionResolver.placeBid(payload);
            return data;
        } catch (error : any) {
            console.error('Error registering user:', error.message);
            return { message: 'Internal server error' };
        }
    };

    public sellItem = async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<any> => {
        try {
            //@ts-ignore
            const payload = request.body;
            const data: any = await auctionResolver.sellItem(payload);
            return data;
        } catch (error : any) {
            console.error('Error registering user:', error.message);
            return { message: 'Internal server error' };
        }
    };

    public endAuction = async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<any> => {
        try {
            //@ts-ignore
            const payload = request.body;
            const data: any = await auctionResolver.endAuction(payload);
            return data;
        } catch (error : any) {
            console.error('Error registering user:', error.message);
            return { message: 'Internal server error' };
        }
    };
}

export default new AuctionController();
