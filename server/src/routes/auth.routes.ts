import { Router } from "express";
import * as authController from '../controllers/auth.controller';
import { loginSchema, registerSchema, validate, ValidationSource } from "../middlewares/validation";
import { authLimiter } from "../middlewares/rateLimiter.middleware";
import * as userController from '../controllers/user.controller';
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// User Profile Routes (Protected)
router.get('/me', protect, userController.getUserProfile);
router.put('/me/update', protect, userController.updateProfile);


// Register Route
// POST /api/v1/auth/register
router.post(
    '/register',
    authLimiter, // rate limiter to prevent brute-force attacks
    validate(registerSchema, ValidationSource.BODY), // validation
    authController.register // controller logic
);

// Login Route
// POST /api/v1/auth/login
router.post(
    '/login',
    authLimiter, // rate limiter to prevent brute-force attacks
    validate(loginSchema, ValidationSource.BODY),
    authController.login
);

// Forgot & Reset Password Routes
router.post('/forgotpassword', authLimiter, authController.forgotPassword);
router.put('/resetpassword/:resettoken', authLimiter, authController.resetPassword);

// Logout Route
// POST /api/v1/auth/logout
router.post(
    '/logout',
    authController.logout
);

export default router;