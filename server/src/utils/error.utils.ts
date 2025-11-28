/**
 * @desc Standardized Error Class for handling custom HTTP errors (e.g., 404, 401, 409)
 * @extends Error
 */
export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Errors to send back to the client

        // Capture stack trace for better debugging
        Error.captureStackTrace(this, this.constructor);
    }
}