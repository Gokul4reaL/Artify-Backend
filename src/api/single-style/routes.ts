import express from 'express';
import SingleStyleController from './controller';
import { validateSchema } from './validate';

const router = express.Router();

router.post('/uploadImage', validateSchema('uploadImage'), async (req: any, res: any) => {
    try {
        const result = await SingleStyleController.uploadImage(req, res);
        return res.json(result); // Return the result as JSON
    } catch (error) {
        console.error('Error handling registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.post('/generateImage', validateSchema('generateImage'), async (req: any, res: any) => {
    try {
        const result = await SingleStyleController.generateImage(req, res);
        return res.json(result); // Return the result as JSON
    } catch (error) {
        console.error('Error handling registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.get('/getImages', async (req: any, res: any) => {
    try {
        const result = await SingleStyleController.getImages(req, res);
        return res.json(result); // Return the result as JSON
    } catch (error) {
        console.error('Error handling registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


export default router;