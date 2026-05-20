import mongoose, { Schema, Model, Document } from "mongoose";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface IUser {
    fullName: string;
    email: string;
    password?: string; // Google Auth users might not have a password initially
    role: 'admin' | 'manager' | 'user';
    isVerified: boolean;
    status: 'active' | 'banned' | 'deactivated';
    googleId?: string;
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
}

export interface IUserDocument extends IUser, Document {
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    getResetPasswordToken(): string;
}

const UserSchema = new Schema<IUserDocument>(
    {
        fullName: {
            type: String,
            required: [true, 'Please provide your full name'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Please provide your email'],
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            // Password required if googleId is not present
            required: function(this: IUserDocument) { return !this.googleId },
            minLength: 6,
            select: false // Default query တွေမှာ password ကို မပါလာစေရန် (Security)
        },
        role: {
            type: String,
            enum: ['admin', 'manager', 'user'],
            default: 'user'
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        status: {
            type: String,
            enum: ['active', 'banned', 'deactivated'],
            default: 'active'
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
    },
    {
        timestamps: true,
    }
);

// Pre-save Hook (Hashing Password)
UserSchema.pre<IUserDocument>('save', async function (next) {
    // Password အသစ်ထည့်တာ သို့မဟုတ် ပြင်တာမျိုး မဟုတ်ရင် ကျော်သွားမယ်
    if(!this.isModified('password') || !this.password) {
        return;
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        // Hashing လုပ်ရင်း Error ဖြစ်ရင် Mongoose save operation ကို ရပ်တန့်ရန်
        // Error ကို re-throw ပြန်လုပ်
        console.error('Password hashing failed:', error);
        
        if (error instanceof Error) {
            throw error;
        }
        
        // Unhandled non-Error object တွေအတွက်
        throw new Error('Failed to hash user password.');
    }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    // Current document's password (this.password) is accessed via `this`
    // Since we set `select: false`, we must ensure password is explicitly selected in query before calling this.
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.getResetPasswordToken = function(): string {
    // Random bytes ထုတ်မယ် (Token အစစ်)
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash လုပ်ပြီး Database မှာသိမ်းမယ် (Security အတွက်)
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Expire time 10 minutes
    this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

    return resetToken;
};

const User: Model<IUserDocument> = mongoose.model<IUserDocument>('User', UserSchema);

export default User;