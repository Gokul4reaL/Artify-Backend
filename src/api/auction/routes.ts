//api/auction/routes.ts

import express from 'express';
import { validateSchema } from './validate';
import AuctionController from './controller';

const router = express.Router();

router.post('/createNFT', validateSchema('createNFT'), async (req: any, res: any) => {
    try {
        const result = await AuctionController.createNFT(req, res);
        return res.json(result); // Return the result as JSON
    } catch (error) {
        console.error('Error handling registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/qualityCheck', validateSchema('qualityCheck'), async (req: any, res: any) => {
    try {
        const result = await AuctionController.qualityCheck(req, res);
        return res.json(result); // Return the result as JSON
    } catch (error) {
        console.error('Error handling registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/admin/startAuction', validateSchema('startAuction'), async (req: any, res: any) => {
    try {
        const result = await AuctionController.startAuction(req, res);
        return res.json(result); // Return the result as JSON
    } catch (error) {
        console.error('Error handling registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/fetchActiveAuctions', async (req: any, res: any) => {
    try {
        const result = await AuctionController.fetchActiveAuctions(req, res);
        return res.json(result); // Return the result as JSON
    } catch (error) {
        console.error('Error handling registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/getSignerInfo', async (req: any, res: any) => {
    try {
        const result = await AuctionController.getSignerInfo(req, res);
        return res.json(result); // Return the result as JSON
    } catch (error) {
        console.error('Error handling registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/auctionInfo', validateSchema('auctionInfo'), async (req: any, res: any) => {
    try {
        const result = await AuctionController.auctionInfo(req, res);
        return res.json(result); // Return the result as JSON
    } catch (error) {
        console.error('Error handling registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/placeBid', validateSchema('placeBid'), async (req: any, res: any) => {
    try {
        const result = await AuctionController.placeBid(req, res);
        return res.json(result); // Return the result as JSON
    } catch (error) {
        console.error('Error handling registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/sellItem', validateSchema('sellItem'), async (req: any, res: any) => {
    try {
        const result = await AuctionController.sellItem(req, res);
        return res.json(result); // Return the result as JSON
    } catch (error) {
        console.error('Error handling registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/admin/endAuction', validateSchema('endAuction'), async (req: any, res: any) => {
    try {
        const result = await AuctionController.endAuction(req, res);
        return res.json(result); // Return the result as JSON
    } catch (error) {
        console.error('Error handling registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


export default router;