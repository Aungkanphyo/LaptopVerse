import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/error.utils";

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = 500; // Default Server Error
    let message = 'Internal Server Error';
    let errors = undefined;

    // AppError (Custom, Operational Errors) ကို ကိုင်တွယ်ခြင်း
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }

    // Mongoose Cast Error (e.g., Invalid ID format)
    else if(err.name === 'CastError') {
        statusCode = 400; // Bad Request
        message = `Invalid ID format for path: ${(err as any).path}`;
    }

    // Mongoose Duplicate Key Error (e.g., Unique email is already taken)
    else if(err.name === 'MongoServerError' && (err as any).code === 11000) {
        statusCode = 409; // Conflict
        const value = Object.values((err as any).keyValue)[0];
        message = `Duplicate field value: '${value}'. Please use another value.`;
    }

    // Display Error Stack only in Development (Environment)
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Final Response
    res.status(statusCode).json({
        success: false,
        message: message,
        errors: errors, // Currently only MongoServerError provides custom errors array
        stack: isDevelopment ? err.stack : undefined, // show stacktrace in development
    });
}