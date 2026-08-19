import z from "zod";
import { loginSchema, registerSchema, resendOtpSchema, verifyOtpSchema, } from "../middlewares/validation";

// Extracting Types from Zod Schemas
export type IRegisterInput = z.infer<typeof registerSchema>;
export type ILoginInput = z.infer<typeof loginSchema>;
export type IVerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type IResendOtpInput = z.infer<typeof resendOtpSchema>;