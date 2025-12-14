import Stripe from "stripe";
import { asyncHandler } from "../utils/asyncHandler";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/error.utils";

// Initialize Stripe with Secret Key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-11-17.clover',
    typescript: true,
});

/**
 * @desc Process Payment (Create Payment Intent)
 * @route POST /api/v1/payment/process
 * @access Private
 */
export const processPayment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    /**
     * Amount that send from Frontend (cents ဖြင့် မဟုတ်ဘဲ dollar/unit ဖြင့် လာလျှင် * 100 လုပ်ရန်လိုသည်)
     * Stripe သည် အသေးဆုံး unit (cents) ဖြင့်သာ လက်ခံသည်။ ဥပမာ $10 = 1000 cents
     */
    const { amount } = req.body;

    if(!amount) {
        return next(new AppError('Please provide payment amount', 400));
    }

    const myPayment = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        metadata: {
            company: "LaptopVerse",
        },
    });

    res.status(200).json({
        success: true,
        client_secret: myPayment.client_secret
    });
});

/**
 * @desc Send Stripe API Key to Frontend
 * @route GET /api/v1/payment/stripeapikey
 * @access Private
 */
export const sendStripeApiKey = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        stripeApiKey: process.env.STRIPE_API_KEY,
    });
});