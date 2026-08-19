import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ILoginInput, IRegisterInput } from "../types/auth.types";
import * as authService from '../services/auth.service';
import { clearTokensFromCookie, sendTokenAsCookie } from "../utils/jwt.utils";

/**
 * @desc Registering a New User (POST /api/v1/auth/register)
 * @access Public
 */
export const register = asyncHandler(async (req: Request<{}, {}, IRegisterInput>, res: Response) => {

    // Validation is already done in the Middleware, so use req.body directly
    const data = req.body;

    // Call the Business Logic from the Service Layer
    const newUser = await authService.registerUser(data);

    // Insert JWT Tokens into an HttpOnly Cookie
    const { accessToken } = sendTokenAsCookie(res, newUser);

    res.status(201).json({
        success: true,
        message: 'Registration successful. User logged in.',
        user: {
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            role: newUser.role
        },
        accessToken,
    });
});

/**
 * @desc User Login လုပ်ခြင်း (POST /api/v1/auth/login)
 * @access Public
 */
export const login = asyncHandler(async (req: Request<{}, {}, ILoginInput>, res: Response) => {
    // retrieve validated data
    const data = req.body;

    // call login logic from service layer
    const user = await authService.loginUser(data);

    const { accessToken } = sendTokenAsCookie(res, user);

    res.status(200).json({
        success: true,
        message: 'Login successful.',
        user: {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
        },
        accessToken,
    });
});

/**
 * @desc User Logout လုပ်ခြင်း (POST /api/v1/auth/logout)
 * @access Public (Client should clear cookies)
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
    clearTokensFromCookie(res);

    res.status(200).json({
        success: true,
        message: 'Successfully logged out.',
    });
});

/**
 * @desc Forgot Password (Email ပို့ရန်) (POST /api/v1/auth/forgotpassword)
 * @access Public
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    if(!email) {
        res.status(400);
        throw new Error('Please provide an email address');
    }

    // Call Logic from Service
    await authService.forgotPasswordRequest(email, req.get('host') as string, req.protocol);

    res.status(200).json({
        success: true,
        message: 'Email sent.',
    });
});

/**
 * @desc Reset Password (PUT /api/v1/auth/resetpassword/:resettoken)
 * @access Public
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { password } = req.body;
    const { resettoken } = req.params;

    if (!password) {
        res.status(400);
        throw new Error('Please provide a new password');
    }

    const user = await authService.resetPasswordLogic(resettoken, password);

    const { accessToken } = sendTokenAsCookie(res, user);

    res.status(200).json({
        success: true,
        message: 'Password reset successful.',
        accessToken
    });
})