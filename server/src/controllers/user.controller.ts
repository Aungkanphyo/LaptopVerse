import { NextFunction, Request, Response } from "express";
import { authenticator } from 'otplib';
import { asyncHandler } from "../utils/asyncHandler";
import User from "../models/user.model";
import { AppError } from "../utils/error.utils";
import { deleteFromCloudinary, uploadToCloudinary } from "../config/cloudinary.config";

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getUserProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.userId).select('-password'); // Exclude password

    if(!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({ success: true, user });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/auth/me/update
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { fullName, email } = req.body;

    // if change email check this email is not used by other user
    if (email) {
        const emailExists = await User.findOne({ email, _id: { $ne: req.userId } });
        if (emailExists) {
            return next(new AppError('Email is already in use by another account', 400));
        }
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.userId,
        { fullName, email },
        { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
    });
});

/**
 * @desc    Upload or Replace Profile Avatar
 * @route   PUT /api/v1/auth/avatar/upload
 * @access  Private
 */
export const updateAvatar = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
        return next(new AppError('Please upload an image file', 400));
    }

    const user = await User.findById(req.userId);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Submit and upload a unique Transformation Option for Avatar
    const uploadedImg = await uploadToCloudinary(req.file.buffer, 'avatars', {
        transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }]
    });

    // If there is an old image, it will be automatically deleted by Cloudinary
    if (user.avatar?.public_id) {
        await deleteFromCloudinary(user.avatar.public_id);
    }

    user.avatar = {
        public_id: uploadedImg.public_id,
        url: uploadedImg.url
    };
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Profile picture updated successfully',
        avatar: user.avatar
    });
});

/**
 * @desc    Delete Profile Avatar completely
 * @route   DELETE /api/v1/auth/avatar
 * @access  Private
 */
export const deleteAvatar = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.userId);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    if (!user.avatar?.public_id) {
        return next(new AppError('No avatar image found to delete', 400));
    }

    // Delete image from Cloudinary
    await deleteFromCloudinary(user.avatar.public_id);

    // Reset avatar field in user document
    user.avatar = { public_id: "", url: "" };
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Profile picture deleted successfully',
        avatar: user.avatar
    });
});

/**
 * @desc    Update user password
 * @route   PUT /api/v1/auth/password/update
 * @access  Private
 */
// Change Password Controller
export const updatePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return next(new AppError('Please provide both old and new passwords', 400));
    }

    const user = await User.findById(req.userId).select('+password');
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Check if old password matches
    const isMatched = await user.comparePassword(oldPassword);
    if (!isMatched) {
        return next(new AppError('Incorrect old password', 400));
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password updated successfully',
    });
});

/**
 * @desc    Setup 2FA (Generate Secret Key & KeyURI via otplib)
 * @route   POST /api/v1/auth/2fa/setup
 * @access  Private
 */
export const setup2FA = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.userId);
    if (!user) return next(new AppError('User not found', 404));

    const secret = authenticator.generateSecret();

    user.twoFactorSecret = secret;
    await user.save();

    const otpauthUrl = authenticator.keyuri(user.email, 'LaptopVerse', secret);

    res.status(200).json({
        success: true,
        secret,
        otpauthUrl
    });
});

/**
 * @desc    Verify TOTP Token & Enable 2FA
 * @route   POST /api/v1/auth/2fa/verify
 * @access  Private
 */
export const verifyAndEnable2FA = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.body;
    if (!token) return next(new AppError('Verification code is required', 400));

    const user = await User.findById(req.userId).select('+twoFactorSecret');
    if (!user || !user.twoFactorSecret) {
        return next(new AppError('2FA setup not initiated', 400));
    }

    const isValid = authenticator.verify({
        token,
        secret: user.twoFactorSecret
    });

    if (!isValid) {
        return next(new AppError('Invalid or expired 2FA code', 400));
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Two-Factor Authentication enabled successfully'
    });
});

/**
 * @desc    Disable 2FA
 * @route   POST /api/v1/auth/2fa/disable
 * @access  Private
 */
export const disable2FA = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.body;
    if (!token) return next(new AppError('2FA verification code is required', 400));

    const user = await User.findById(req.userId).select('+twoFactorSecret');
    if (!user || !user.twoFactorSecret) {
        return next(new AppError('2FA is not enabled on this account', 400));
    }

    const isValid = authenticator.verify({
        token,
        secret: user.twoFactorSecret
    });

    if (!isValid) {
        return next(new AppError('Invalid 2FA code. Disable action rejected.', 400));
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Two-Factor Authentication disabled successfully'
    });
});

/**
 * @desc    Get Active Sessions List
 * @route   GET /api/v1/auth/sessions
 * @access  Private
 */
export const getActiveSessions = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.userId);
    if (!user) return next(new AppError('User not found', 404));

    res.status(200).json({
        success: true,
        sessions: user.sessions
    });
});

/**
 * @desc    Revoke Session by ID
 * @route   DELETE /api/v1/auth/sessions/:sessionId
 * @access  Private
 */
export const revokeSession = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { sessionId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) return next(new AppError('User not found', 404));

    user.sessions = user.sessions.filter((s) => s._id.toString() !== sessionId);
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Session revoked successfully'
    });
});