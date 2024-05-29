// api/users/routes.ts

import express from 'express';
import UserController from './controller';
import { validateSchema } from './validate';

const router = express.Router();

router.post('/login', validateSchema('login'), async (req: any, res: any) => {
    try {
        const result = await UserController.login(req, res);
        return res.json(result);
    } catch (error) {
        console.error('Error handling login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// User registration route with request body validation middleware
router.post('/register', validateSchema('register'), async (req: any, res: any) => {
    try {
        const result = await UserController.register(req, res);
        return res.json(result); // Return the result as JSON
    } catch (error) {
        console.error('Error handling registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/createProfile', validateSchema('createProfile'), async (req: any, res: any) => {
    try {
        const result = await UserController.createProfile(req, res);
        return res.json(result); // Return the result as JSON
    } catch (error) {
        console.error('Error handling registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/checkUserName', validateSchema('checkUserName'), async (req: any, res: any) => {
    try {
        const result = await UserController.checkUserName(req, res);
        return res.json(result); // Return the result as JSON
    } catch (error) {
        console.error('Error handling registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
