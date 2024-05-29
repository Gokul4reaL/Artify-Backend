// middleware/authenticate.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
    user?: any; // Define the user property
}

// Generate JWT token
export function generateToken(payload: any): string {
    const secretKey = 'cb28e66c49c5fb6f33a3b3ac39d17e6e85f35855be83f6e48bb1f783f2b4bc4b';
    const options = {
        expiresIn: '3h' // Token expiration time
    };
    return jwt.sign(payload, secretKey, options);
}

// Verify JWT token
 function verifyToken(token: string): any {
    const secretKey = 'cb28e66c49c5fb6f33a3b3ac39d17e6e85f35855be83f6e48bb1f783f2b4bc4b';
    try {
        const decoded = jwt.verify(token, secretKey);
        return decoded;
    } catch (error) {
        throw new Error('Invalid token');
    }
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    try {
        const user = verifyToken(token); // Verify the token
        req.user = user; // Attach user information to the request object
        next();
    } catch (err : any) {
        console.error('Error verifying token:', err.message);
        return res.sendStatus(403);
    }
}
