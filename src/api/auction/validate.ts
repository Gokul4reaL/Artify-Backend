import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const schemas : { [key: string]: Joi.ObjectSchema<any> }= {
    createNFT: Joi.object({
        nft_name: Joi.string().required(),
        description: Joi.string().required(),
        seller_id: Joi.string().allow(null).optional(),
        nft_item: Joi.required(),
        starting_price: Joi.number().required(),
        sold_price: Joi.number().allow(null).optional(),
        bidding_history: Joi.string().allow(null).optional()
    }),
    qualityCheck: Joi.object({
        name: Joi.required(),
        type: Joi.required(),
        size: Joi.required(),
        content: Joi.required()
    }),
    startAuction: Joi.object({
        nft_items_count: Joi.required(),
        auction_id: Joi.required(),
        auction_name: Joi.required(),
        start_time: Joi.required(),
        end_time: Joi.required().allow(null),
        auction_items : Joi.optional().allow(null)
    }),
    auctionInfo: Joi.object({
        auction_id: Joi.string().required()
    }),
    placeBid: Joi.object({
        auction_id: Joi.string().required(),
        nft_id: Joi.string().required(),
        bidAmount: Joi.number().required()
    }),
    sellItem: Joi.object({
        auction_id: Joi.string().required(),
        nft_id: Joi.string().required(),
        sold_price: Joi.number().required()
    }),
    endAuction: Joi.object({
        auction_id: Joi.string().required()
    })
};

export const validateSchema = (schemaName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schemas[schemaName].validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        next(); // Proceed to the next middleware or route handler
    };
};