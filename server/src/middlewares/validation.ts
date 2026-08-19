import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError, ZodTypeAny, z } from "zod";

export enum ValidationSource {
    BODY = 'body',
    QUERY = 'query',
    PARAMS = 'params',
}

/**
 * --------------------------------------------------------------------------
 * Reusable Validation Middleware (Higher-Order Function)
 * --------------------------------------------------------------------------
 */
export const validate = (
    schema: ZodTypeAny, 
    source: ValidationSource = ValidationSource.BODY
) => (req: Request, res: Response, next: NextFunction) => {
    
    let dataToValidate: any;

    switch(source) {
        case ValidationSource.BODY:
            dataToValidate = req.body;
            break;
        case ValidationSource.QUERY:
            dataToValidate = req.query;
            break;
        case ValidationSource.PARAMS:
            dataToValidate = req.params;
            break;
        default:
            dataToValidate = {};
    }

    try {
        // Validation and transformation with Zod
        const parsedData = schema.parse(dataToValidate);

        // Replacing the data in the request object with the sanitized data allows that data to be used subsequently in the controller
        switch (source) {
            case ValidationSource.BODY:
                req.body = parsedData;
                break;
            case ValidationSource.QUERY:
                req.query = parsedData as any;
                break;
            case ValidationSource.PARAMS:
                req.params = parsedData as any;
                break;
        }
        next();
    } catch (error) {
        if(error instanceof ZodError) {
            // Error တွေကို Frontend က နားလည်လွယ်တဲ့ format ပြောင်းပေးခြင်း
            const errors = error.errors.map((err) => ({
                // err.path က Array ဖြစ်သောကြောင့် join ဖြင့် string ပြန်ပေါင်း
                field: err.path.join('.'),
                message: err.message,
            }));

            // 400 Bad Request with validation details
            res.status(400).json({ 
                message: 'Validation Error', 
                errors 
            });
            return;
        }
        next(error);
    };
}

/**
 * --------------------------------------------------------------------------
 * Auth Schemas
 * --------------------------------------------------------------------------
 */

// Register Schema
export const registerSchema = z.object({
    fullName: z
    .string({ required_error: "Full name is required" })
    .min(2, "Full name must be at least 2 characters")
    .trim(),

    email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .trim()
    .toLowerCase(),

    password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password requires at least one uppercase letter")
    .regex(/[a-z]/, "Password requires at least one lowercase letter")
    .regex(/[0-9]/, "Password requires at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password requires at least one symbol")
});

// Login Schema
export const loginSchema = z.object({
    email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address")
    .trim()
    .toLowerCase(),

    password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
    // Login မှာ password length မစစ်တာက Security Best Practice ပါ (User Enumeration ကာကွယ်ရန်)
    // ဒါပေမဲ့ required ဖြစ်တာကိုတော့ စစ်ရပါမယ်။
});

/**
 * --------------------------------------------------------------------------
 * Manual Payment Settings Schemas (Admin)
 * --------------------------------------------------------------------------
 */
export const manualPaymentSettingsSchema = z.object({
    enabled: z.boolean(),
    instructions: z
        .string()
        .trim()
        .min(1, "Instructions are required")
        .max(2000, "Instructions must be at most 2000 characters"),
    accounts: z
        .array(
            z.object({
                provider: z.enum(["KPay", "AYA Pay", "Wave Money", "UAB Pay", "CB Pay", "Other"]),
                accountName: z.string().trim().min(1, "Account name is required").max(120),
                accountNumber: z.string().trim().min(1, "Account number is required").max(64),
                phoneNumber: z.string().trim().max(32).optional(),
                note: z.string().trim().max(200).optional(),
                isActive: z.boolean().default(true),
                sortOrder: z.number().int().min(0).max(1000).default(0),
            })
        )
        .max(50, "Too many accounts"),
});
