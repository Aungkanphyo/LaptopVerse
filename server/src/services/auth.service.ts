import User, { IUserDocument } from "../models/user.model";
import { ILoginInput, IRegisterInput } from "../types/auth.types";
import { AppError } from "../utils/error.utils";
import sendEmail from "../utils/sendEmail";
import crypto from 'crypto';

export const registerUser = async (data: IRegisterInput): Promise<IUserDocument> => {
    // check for email
    const existingUser = await User.findOne({ email: data.email });
    if(existingUser) {
        // 409 Conflict Error
        throw new AppError('This email is already registered.', 409);
    }

    // User is being created (Password Hashing is already handled by the pre-save hook in user.model.ts)
    const newUser = await User.create({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: 'user', // default role
        isVerified: false,
    });

    return newUser;
};

/**
 * @desc User Login Logic
 * @param data - User login data (email, password)
 * @returns User Document
 */
export const loginUser = async (data: ILoginInput): Promise<IUserDocument> => {
    // Searching for the User. The Password needs to be explicitly selected
    const user = await User.findOne({ email: data.email }).select('+password');

    if(!user || !(await user.comparePassword(data.password))) {
        // 401 Unauthorized Error
        throw new AppError('Invalid email or password.', 401);
    }

    // Login ပြီးမြောက်ပါက Password ကို ဖယ်ပြီး return ပြန်ပေးပါ
    // Mongoose toObject() ကိုသုံးပြီး password ကို ဖယ်ထုတ်နိုင်သည်။
    const userObject = user.toObject();
    delete userObject.password;

    return userObject as IUserDocument;
}

/**
 * Forgot Password Service
 * @param email User provided email
 */
export const forgotPasswordRequest = async (email: string, requestHost: string, protocol: string) => {
    const user = await User.findOne({ email });

    if(!user) {
        throw new AppError('There is no user with that email address.', 404);
    }

    // Get Reset Token (Model Method)
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create Reset URL (Frontend URL or API URL)
    const resetUrl = `${protocol}://${requestHost}/api/v1/auth/resetpassword/${resetToken}`;

    const htmlMessage = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Hello ${user.fullName},</h2>
            <p>We received a request to reset the password for your <strong>LaptopVerse</strong> account.</p>
            <p>If you made this request, please click the button below to set a new password:</p>
            
            <div style="margin: 30px 0;">
                <a href="${resetUrl}" 
                    style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Reset Password
                </a>
            </div>

            <p style="font-size: 0.9em; color: #666;">(This link will expire in 10 minutes)</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p>If you didn't ask to reset your password, you can safely ignore this email. Your account is secure.</p>
            <p>Thanks,<br />The LaptopVerse Team</p>
        </div>
    `;;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Reset Your Password - LaptopVerse',
            message: `Please reset your password by making a PUT request to: \n\n ${resetUrl}`,
            html: htmlMessage,
        });

        return { message: 'Email sent successfully' };
    } catch (error) {
        // console.log("Nodemailer Error Details:", error);
        // Email ပို့မရရင် DB မှာ save ထားတဲ့ token တွေကို ပြန်ဖျက်မယ်
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        throw new AppError('Email could not be sent', 500);
    }
};

/**
 * Reset Password Service
 * @param resetToken Email ထဲမှရလာသော Token အစစ်
 * @param newPassword User အသစ်ပေးလိုသော Password
 */
export const resetPasswordLogic = async (resetToken: string, newPassword: string) => {
    // Token ကို Hash ပြန်လုပ်မယ် (DB ထဲမှာ Hash နဲ့ သိမ်းထားလို့)
    const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Hash တူပြီး Expire မဖြစ်သေးတဲ့ User ကို ရှာမယ်
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: new Date(Date.now()) }
    });

    if(!user) {
        throw new AppError('Invalid or expired password reset token', 400);
    }

    // Password အသစ်သတ်မှတ်ပြီး Token တွေကို ပြန်ဖျက်
    user.password = newPassword
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return user;
};