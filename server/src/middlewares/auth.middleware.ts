import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/error.utils";
import { JwtPayload } from "jsonwebtoken";
import { verifyAccessToken } from "../utils/jwt.utils";
import User, { IUserDocument } from "../models/user.model";

/**
 * @desc Middleware that verifies the Access Token and sets req.user
 * @access For Private Routes
 */
export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    // Get token from Header or Cookies
    // Authorization Header (Bearer Token)
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Cookie (Access Token that send by HttpOnly Cookie)
    else if(req.cookies.accessToken) {
        token = req.cookies.accessToken;
    }

    // Return 401 Unauthorized if the token is missing
    if(!token) {
        // 401 Unauthorized
        return next(new AppError('Not authorized to access this route. Token missing.', 401));
    }

    // Check token
    let decoded: JwtPayload | string;
    try {
        decoded = verifyAccessToken(token); // Verify from JWT utility
    } catch (error) {
        // If the Token is expired or invalid
        return next(new AppError('Not authorized, token failed or expired.', 401));
    }

    // Searching for the User in the Database using the ID retrieved from the token
    if(typeof decoded !== 'string' && decoded.id) {
        // Find User without Password
        const user = await User.findById(decoded.id);

        if(!user) {
            // If the token exists but the user does not(e.g if the user has been deleted)
            return next(new AppError('User belonging to this token no longer exists.', 401));
        }

        // Insert User Information into Request Object
        req.user = user as IUserDocument;
        req.userId = user._id.toString();
        req.role = user.role;

        next();
    } else {
        return next(new AppError('Invalid token structure.', 401));
    }
});

/**
 * @desc Role-Based Access Control (RBAC) Middleware
 * @param roles - Allow Roles (eg: 'admin', 'manager')
 * @returns Express Middleware
 */
export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Check the req.user.role retrieved from the protect middleware
        if(!req.user || !roles.includes(req.user.role)) {
            // 403 
            return next(new AppError(
                `User role ${req.user?.role} is not authorized to access this route.`, 
                403
            ));
        }
        next();
    }
}