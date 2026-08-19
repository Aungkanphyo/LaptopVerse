// User Data format return from backend
export interface IUser {
    _id: string;
    fullName: string;
    email: string;
    role: 'user' | 'admin' | 'manager';
    isVerified: boolean;
    googleId?: string;
    createdAt: string;
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