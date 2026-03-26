// User Data format return from backend
export interface IUser {
    _id: string;
    fullName: string;
    email: string;
    role: 'user' | 'admin';
    createdAt: string;
}

// Auth State format to be stored in Redux Store
export interface IAuthState {
    user: IUser | null;
    accessToken: string | null;
    isAuthenticated: boolean;
}