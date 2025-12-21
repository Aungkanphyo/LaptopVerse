import { Router } from "express";
import * as authController from '../controllers/auth.controller';
import { loginSchema, registerSchema, validate, ValidationSource } from "../middlewares/validation";

const router = Router();

// Register Route
// POST /api/v1/auth/register
router.post(
    '/register',
    validate(registerSchema, ValidationSource.BODY), // validation
    authController.register // controller logic
);

// Login Route
// POST /api/v1/auth/login
router.post(
    '/login',
    validate(loginSchema, ValidationSource.BODY),
    authController.login
);

// Logout Route
// POST /api/v1/auth/logout
router.post(
    '/logout',
    authController.logout
);

// Forgot & Reset Password Routes
router.post('/forgotpassword', authController.forgotPassword);
router.put('/resetpassword/:resettoken', authController.resetPassword);

export default router;