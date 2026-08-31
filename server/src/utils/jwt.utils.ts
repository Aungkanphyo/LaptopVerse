import dotenv from 'dotenv';
import { Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IUserDocument } from '../models/user.model';

dotenv.config();

// Environment Variables (Strict Typing & Null Checks)
const getRequiredEnv = (key: string): string => {
    const value = process.env[key];
    if(!value) {
        // Log Error and exit the process if critical secret is missing
        console.error(`💥 CRITICAL ERROR: Environment variable ${key} is not set.`);
        process.exit(1);
    }
    return value;
}

const ACCESS_SECRET = getRequiredEnv('JWT_ACCESS_SECRET');
const REFRESH_SECRET = getRequiredEnv('JWT_REFRESH_SECRET');

const ACCESS_EXPIRY: string = getRequiredEnv('JWT_ACCESS_EXPIRY');
const REFRESH_EXPIRY: string = getRequiredEnv('JWT_REFRESH_EXPIRY');

const COOKIE_DOMAIN: string = process.env.COOKIE_DOMAIN || 'localhost';
const NODE_ENV: string = process.env.NODE_ENV || 'development';

const parseExpiryToMs = (expiry: string): number => {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1));

    if (isNaN(value)) {
        const rawValue = parseInt(expiry);
        return isNaN(rawValue) ? 15 * 60 * 1000 : rawValue * 1000;
    }

    switch (unit) {
        case 'd': return value * 24 * 60 * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'm': return value * 60 * 1000;
        case 's': return value * 1000;
        default: return parseInt(expiry) * 1000;
    }
};

interface TokenPayload {
    id: string;
    role: string;
}

// Access Token generate
export const generateAccessToken = (userId: string, role: string): string => {
    const payload: TokenPayload = { id: userId, role };
    return jwt.sign(payload, ACCESS_SECRET, {
        expiresIn: ACCESS_EXPIRY as SignOptions['expiresIn'],
    });
}

// Refresh Token generate
export const generateRefreshToken = (userId: string, role: string): string => {
    const payload: TokenPayload = { id: userId, role };
    return jwt.sign(payload, REFRESH_SECRET, {
        expiresIn: REFRESH_EXPIRY as SignOptions['expiresIn'],
    });
};

// Tokens are stored in an HttpOnly cookie.
export const sendTokenAsCookie = (res: Response, user: IUserDocument): { accessToken: string } => {
    const userId = user._id.toString();
    const userRole = user.role;

    // Tokens Generate လုပ်
    const accessToken = generateAccessToken(userId, userRole);
    const refreshToken = generateRefreshToken(userId, userRole);

    const cookieOptions = {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: 'lax' as const,
        ...(NODE_ENV === 'production' && { domain: COOKIE_DOMAIN })
    };

    // Cookies Set
    res.cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: parseExpiryToMs(ACCESS_EXPIRY),
    });

    res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: parseExpiryToMs(REFRESH_EXPIRY),
    });
    return { accessToken };
};

// Delete cookies and log out
export const clearTokensFromCookie = (res: Response): void => {
    res.clearCookie('accessToken', { domain: COOKIE_DOMAIN, httpOnly: true, sameSite: 'strict' as const });
    res.clearCookie('refreshToken', { domain: COOKIE_DOMAIN, httpOnly: true, sameSite: 'strict' as const });
};

// Function to verify the refresh token (for Auth Middleware)
export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, REFRESH_SECRET);
};

// Access Token verify function
export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, ACCESS_SECRET);
}