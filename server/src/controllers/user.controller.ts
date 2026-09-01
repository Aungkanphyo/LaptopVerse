import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import User from "../models/user.model";
import { AppError } from "../utils/error.utils";

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