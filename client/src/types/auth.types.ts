export interface IAvatar {
    public_id: string;
    url: string;
}

export interface ISession {
    _id: string;
    userAgent: string;
    ip: string;
    lastActive: string;
}

// User Data format return from backend
export interface IUser {
    _id: string;
    fullName: string;
    email: string;
    role: 'user' | 'admin' | 'manager';
    isVerified: boolean;
    googleId?: string;
    avatar?: IAvatar;
    twoFactorEnabled?: boolean;
    sessions?: ISession[];
    createdAt?: string;
}

// Auth State format to be stored in Redux Store
export interface IAuthState {
    user: IUser | null;
    accessToken: string | null;
    isAuthenticated: boolean;
}

// Frontend Form Input & API Request Payloads
export interface IVerifyOtpPayload {
    email: string;
    otp: string;
}

export interface IResendOtpPayload {
    email: string;
}

export interface IUpdateProfilePayload {
    fullName: string;
    email: string;
}

export interface IUpdatePasswordPayload {
    oldPassword: string;
    newPassword: string;
}

export interface IVerify2FAPayload {
    token: string;
}

export interface ILogin2FAPayload {
    userId: string;
    token: string;
}

export interface ISetup2FAResponse {
    success: boolean;
    secret: string;
    otpauthUrl: string;
}