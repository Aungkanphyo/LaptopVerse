import z from "zod";
import { loginSchema, registerSchema } from "../middlewares/validation";

// Zod Schema တွေကနေ Types တွေကို ဆွဲထုတ်လိုက်ခြင်း
export type IRegisterInput = z.infer<typeof registerSchema>;
export type ILoginInput = z.infer<typeof loginSchema>;