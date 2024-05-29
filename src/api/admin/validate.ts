// api/users/validate.ts

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Define schemas
const schemas : { [key: string]: Joi.ObjectSchema<any> }= {
    login: Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
    }),
    register: Joi.object({
        email: Joi.string().required(),
        mobileNumber: Joi.string().required(),
        password: Joi.string().required(),
        user_type: Joi.string().required()
    }),
    createProfile: Joi.object({
        fullName : Joi.string().required(),
        country: Joi.string().required(),
        username: Joi.string().required(),
        day: Joi.string().required(),
        month: Joi.string().required(),
        year: Joi.string().required(),
        gender: Joi.string().required(),
        profilePhoto: Joi.string().required().allow('',null),
        user_id: Joi.string().required()
    }),
    checkUserName: Joi.object({
        username: Joi.string().required()
    }),
    createAuctions: Joi.object({
        auction_name: Joi.string().required(),
        start_time: Joi.date().required(),
        end_time: Joi.date().required().allow(null)
    }),
    addToAuction: Joi.object({
        auction_id: Joi.string().required(),
        nft_id: Joi.string().required()
    })
};

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
