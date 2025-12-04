import dotenv from 'dotenv';
import { Response } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
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

interface TokenPayload {
    id: string;
    role: string;
}

// Access Token ကို generate လုပ်
export const generateAccessToken = (userId: string, role: string): string => {
    const payload: TokenPayload = { id: userId, role };
    return jwt.sign(payload, ACCESS_SECRET, {
        expiresIn: ACCESS_EXPIRY as SignOptions['expiresIn'],
    });
}

// Refresh Token ကို generate လုပ်သည်
export const generateRefreshToken = (userId: string, role: string): string => {
    const payload: TokenPayload = { id: userId, role };
    return jwt.sign(payload, REFRESH_SECRET, {
        expiresIn: REFRESH_EXPIRY as SignOptions['expiresIn'],
    });
};

// Tokens များကို HttpOnly Cookie တွင် ထည့်သွင်းပေးသည်
export const sendTokenAsCookie = (res: Response, user: IUserDocument): { accessToken: string } => {
    const userId = user._id.toString();
    const userRole = user.role;

    // Tokens Generate လုပ်
    const accessToken = generateAccessToken(userId, userRole);
    const refreshToken = generateRefreshToken(userId, userRole);

    const cookieOptions = {
        httpOnly: true, // Frontend JS ကနေ ခိုးယူလို့မရအောင် (Security)
        secure: NODE_ENV === 'production', // HTTPS မှာသာ ပို့မည်
        sameSite: 'strict' as const, // Cross-Site Request Forgery (CSRF) protection
        domain: COOKIE_DOMAIN
    };

    // Cookies Set လုပ်
    res.cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: (typeof ACCESS_EXPIRY === 'string' 
         ? parseInt(ACCESS_EXPIRY.replace('s', '')) // '900s' -> 900
         : ACCESS_EXPIRY || 900) * 1000,
    });

    // Refresh Token ကို 7 ရက် ထား
    res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Security အရ client ကို Access Token ကို body နဲ့ ပြန်မပို့သင့်ပါ။
    // ဒါပေမဲ့ client-side development လွယ်ကူစေဖို့အတွက် accessToken ကို ပြန်ပို့ပေးနိုင်ပါသည်။ 
    // (ဥပမာ - Redux state/memory မှာ ခဏထားရန်)
    return { accessToken };
};

// Cookies များကို ဖျက်ပြီး Logout လုပ်
export const clearTokensFromCookie = (res: Response): void => {
    res.clearCookie('accessToken', { domain: COOKIE_DOMAIN, httpOnly: true, sameSite: 'strict' as const });
    res.clearCookie('refreshToken', { domain: COOKIE_DOMAIN, httpOnly: true, sameSite: 'strict' as const });
};

// Refresh Token ကို verify လုပ်ရန် function (Auth Middleware အတွက်)
export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, REFRESH_SECRET);
};

// Access Token ကို verify လုပ်ရန် function
export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, ACCESS_SECRET);
}