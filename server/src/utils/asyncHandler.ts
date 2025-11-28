import { NextFunction, Request, Response } from "express";

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

/**
 * @desc Higher-Order Function (HOC) that centralizes error handling for Async/Await functions
 * @param fn - Controller function (req, res, next) => Promise<any>
 * @returns Express route handler (req, res, next)
 */
export const asyncHandler = (fn: AsyncFunction) => 
    (req: Request, res: Response, next: NextFunction) => {
        // Run the promise. If there is an error, pass it to the Global Error Handler using next()
        Promise.resolve(fn(req, res, next)).catch(next);
    }