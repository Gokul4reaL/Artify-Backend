
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Define schemas
const schemas : { [key: string]: Joi.ObjectSchema<any> }= {
    uploadImage: Joi.object({
        image: Joi.required(),
        userID: Joi.string().required()
    }),
    generateImage: Joi.object({
        selectedImage: Joi.required(),
        uploadedID: Joi.string().required(),
        userID: Joi.string().required()
    }),
}

// Middleware function to validate request body against a schema
export const validateSchema = (schemaName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schemas[schemaName].validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        next(); // Proceed to the next middleware or route handler
    };
};