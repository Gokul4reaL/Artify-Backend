import express from 'express';
import MultiStyleController from './controller';
import { validateSchema } from './validate';

const router = express.Router();

router.post('/multi/uploadImage', validateSchema('uploadImage'), async (req: any, res: any) => {
    try {
        const result = await MultiStyleController.uploadImage(req, res);
        return res.json(result); // Return the result as JSON
    } catch (error) {
        console.error('Error handling registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.post('/multi/generateImage', validateSchema('generateImage'), async (req: any, res: any) => {
    try {
        const result = await MultiStyleController.generateImage(req, res);
        return res.json(result); // Return the result as JSON
    } catch (error) {
        console.error('Error handling registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.get('/multi/getImages', async (req: any, res: any) => {
    try {
        const result = await MultiStyleController.getImages(req, res);
        return res.json(result); // Return the result as JSON
    } catch (error) {
        console.error('Error handling registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


export default router;