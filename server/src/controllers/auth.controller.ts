import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ILoginInput, IRegisterInput, IResendOtpInput, IVerifyOtpInput } from "../types/auth.types";
import * as authService from '../services/auth.service';
import { clearTokensFromCookie, sendTokenAsCookie } from "../utils/jwt.utils";
import { IUserDocument } from "../models/user.model";

/**
 * @desc Registering a New User (POST /api/v1/auth/register)
 * @access Public
 */
export const register = asyncHandler(async (req: Request<{}, {}, IRegisterInput>, res: Response) => {

    // Validation is already done in the Middleware, so use req.body directly
    const data = req.body;

    // Call the Business Logic from the Service Layer
    const newUser = await authService.registerUser(data);

    // Response will be returned to verify OTP without providing direct login
    res.status(201).json({
        success: true,
        message: "We've sent a verification code to your email.",
        email: newUser.email,
    });
});

/**
 * @desc Verify OTP Email (POST /api/v1/auth/verify-email)
 * @access Public
 */
export const verifyEmail = asyncHandler(async (req: Request<{}, {}, IVerifyOtpInput>, res: Response) => {
    const { email, otp } = req.body;
    const user = await authService.verifyEmailOTP(email, otp);

    const { accessToken } = sendTokenAsCookie(res, user);

    res.status(200).json({
        success: true,
        message: 'Email verified successfully. You are now logged in.',
        user: {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
        },
        accessToken,
    });
});

/**
 * @desc Resend Verification OTP (POST /api/v1/auth/resend-otp)
 * @access Public
 */
export const resendOTP = asyncHandler(async (req: Request<{}, {}, IResendOtpInput>, res: Response) => {
    const { email } = req.body;
    await authService.resendOTP(email);

    res.status(200).json({
        success: true,
        message: 'A new OTP has been sent to your email.',
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
 * @desc Google OAuth Callback Controller (GET /api/v1/auth/google/callback)
 * @access Public
 */
export const googleCallback = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as IUserDocument;
    
    if (!user) {
        res.redirect(`${process.env.CLIENT_URL}/login?error=Google authentication failed`);
        return;
    }

    sendTokenAsCookie(res, user);
    res.redirect(`${process.env.CLIENT_URL}?auth=success`);
});

/**
 * @desc User Logout (POST /api/v1/auth/logout)
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

    if (!email) {
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