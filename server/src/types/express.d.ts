import { IUserDocument } from "../models/user.model";

// Global declaration for Express types
declare global {
    namespace Express {
        interface User extends IUserDocument {}
        interface Request {
            user?: IUserDocument; // Logged-in user document (from DB)
            userId?: string; // User ID from JWT
            role?: string; // User role from JWT
        }
    }
}