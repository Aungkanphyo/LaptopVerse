import { Router } from "express";
import * as authController from '../controllers/auth.controller';
import { loginSchema, registerSchema, resendOtpSchema, validate, ValidationSource, verifyOtpSchema } from "../middlewares/validation";
import { authLimiter } from "../middlewares/rateLimiter.middleware";
import * as userController from '../controllers/user.controller';
import { protect } from "../middlewares/auth.middleware";
import { resendOTP } from '../services/auth.service';
import passport from "passport";

const router = Router();

// User Profile Routes (Protected)
router.get('/me', protect, userController.getUserProfile);
router.put('/me/update', protect, userController.updateProfile);


// Register & OTP Routes
router.post(
    '/register',
    authLimiter, // rate limiter to prevent brute-force attacks
    validate(registerSchema, ValidationSource.BODY), // validation
    authController.register // controller logic
);

router.post(
    '/verify-email',
    authLimiter,
    validate(verifyOtpSchema, ValidationSource.BODY),
    authController.verifyEmail
);

router.post(
    '/resend-otp',
    authLimiter,
    validate(resendOtpSchema, ValidationSource.BODY),
    authController.resendOTP
);

// Login Route
// POST /api/v1/auth/login
router.post(
    '/login',
    authLimiter, // rate limiter to prevent brute-force attacks
    validate(loginSchema, ValidationSource.BODY),
    authController.login
);

// Google OAuth Routes
router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login` }),
    authController.googleCallback
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