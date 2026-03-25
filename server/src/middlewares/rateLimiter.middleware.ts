import { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { AppError } from "../utils/error.utils";

// Global API Rate Limiter
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // A maximum of 100 calls per IP will be allowed within 15 minutes.
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req: Request, res: Response, next: NextFunction, options) => {
        next(new AppError('Too many requests from this IP, please try again after 15 minutes.', options.statusCode));
    }
});

// Auth Rate Limiter (Brute-force Protection)
export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // A maximum of 5 login attempts per IP will be allowed within 1 hour.
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response, next: NextFunction, options) => {
        next(new AppError('Too many requests from this IP, please try again after 15 minutes.', options.statusCode));
    }
});

/**
 * Heavy Operations Rate Limiter
 * For APIs that load the database, such as CSV Export and Report Generation
 */
export const exportLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Only a maximum of 3 exports will be allowed per IP within 15 minutes.
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response, next: NextFunction, options) => {
        next(new AppError('Too many requests from this IP, please try again after 15 minutes.', options.statusCode));
    }
});