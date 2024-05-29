// api/admin/routes.ts

import express from 'express';
import AdminController from './controller';
import { validateSchema } from './validate';

const router = express.Router();

router.post('/admin/login', validateSchema('login'), async (req: any, res: any) => {
    try {
        const result = await AdminController.login(req, res);
        return res.json(result);
    } catch (error) {
        console.error('Error handling login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// User registration route with request body validation middleware
router.post('/admin/register', validateSchema('register'), async (req: any, res: any) => {
    try {
        const result = await AdminController.register(req, res);
        return res.json(result); // Return the result as JSON
    } catch (error) {
        console.error('Error handling registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/admin/createProfile', validateSchema('createProfile'), async (req: any, res: any) => {
    try {
        const result = await AdminController.createProfile(req, res);
        return res.json(result); // Return the result as JSON
    } catch (error) {
        console.error('Error handling registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/admin/checkUserName', validateSchema('checkUserName'), async (req: any, res: any) => {
    try {
        const result = await AdminController.checkUserName(req, res);
        return res.json(result); // Return the result as JSON
    } catch (error) {
        console.error('Error handling registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/admin/getNFTS', async (req: any, res: any) => {
    try {
        const result = await AdminController.getNFTS(req, res);
        return res.json(result); // Return the result as JSON
    } catch (error) {
        console.error('Error handling registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/admin/getAuctions', async (req: any, res: any) => {
    try {
        const result = await AdminController.getAuctions(req, res);
        return res.json(result); // Return the result as JSON
    } catch (error) {
        console.error('Error handling registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/admin/createAuctions', validateSchema('createAuctions'), async (req: any, res: any) => {
    try {
        const result = await AdminController.createAuctions(req, res);
        return res.json(result); // Return the result as JSON
    } catch (error) {
        console.error('Error handling registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/admin/addToAuction', validateSchema('addToAuction'), async (req: any, res: any) => {
    try {
        const result = await AdminController.addToAuction(req, res);
        return res.json(result); // Return the result as JSON
    } catch (error) {
        console.error('Error handling registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


export default router;
