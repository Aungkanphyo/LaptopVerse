import mongoose, { Schema, Model, Document } from "mongoose";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface ISession {
    _id: mongoose.Types.ObjectId;
    userAgent: string;
    ip: string;
    lastActive: Date;
}
export interface IUser {
    fullName: string;
    email: string;
    password?: string; // Google Auth users might not have a password initially
    role: 'admin' | 'manager' | 'user';
    isVerified: boolean;
    status: 'active' | 'banned' | 'deactivated';
    googleId?: string;
    avatar?: {
        public_id: string;
        url: string;
    };
    twoFactorEnabled: boolean;
    twoFactorSecret?: string;
    lastUsed2FAToken?: string;
    sessions: ISession[];
    verificationOTP?: string;
    otpExpires?: Date;
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
}

export interface IUserDocument extends IUser, Document {
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    getResetPasswordToken(): string;
    generateOTP(): string;
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
        avatar: {
            public_id: { type: String, default: "" },
            url: { type: String, default: "" }
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
        twoFactorEnabled: {
            type: Boolean,
            default: false
        },
        twoFactorSecret: {
            type: String,
            select: false
        },
        lastUsed2FAToken: {
            type: String,
            select: false
        },
        sessions: [
            {
                userAgent: { type: String, required: true },
                ip: { type: String, required: true },
                lastActive: { type: Date, default: Date.now }
            }
        ],
        googleId: {
            type: String,
            unique: true,
            sparse: true
        },
        verificationOTP: String,
        otpExpires: Date,
        resetPasswordToken: String,
        resetPasswordExpire: Date,
    },
    {
        timestamps: true,
    }
);

// Pre-save Hook (Hashing Password)
UserSchema.pre<IUserDocument>('save', async function (next) {
    // skip this unless you are setting or changing the password
    if(!this.isModified('password') || !this.password) {
        return;
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
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

// Method to generate a random 6-digit OTP and store it in the DB using SHA-256
UserSchema.methods.generateOTP = function(): string {
    const plainOTP = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit number

    this.verificationOTP = crypto
        .createHash('sha256')
        .update(plainOTP)
        .digest('hex');

    this.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // Valid for 10 mins

    return plainOTP; // Plain OTP returned to send to email
}

UserSchema.methods.getResetPasswordToken = function(): string {
    // Generate random bytes (actual token)
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and store in DB (for security)
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