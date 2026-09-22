import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../authApiSlice';
import { useState } from 'react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { toast } from 'sonner';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { AuthInput } from '../components/AuthInput';
import { Lock, Mail, Shield, User } from 'lucide-react';

interface IRegisterForm {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface IValidationError {
    field: string;
    message: string;
}

interface IApiErrorResponse {
    success?: boolean;
    message?: string;
    errors?: IValidationError[];
}

const Register = () => {
    const {
        register,
        handleSubmit,
        getValues,
        setError,
        formState: { errors } }
        = useForm<IRegisterForm>();
    const navigate = useNavigate();
    const [registerUser, { isLoading }] = useRegisterMutation();
    const [apiError, setApiError] = useState<string | null>(null);

    const onSubmit: SubmitHandler<IRegisterForm> = async (data) => {
        try {
            setApiError(null);

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { confirmPassword, ...registerData } = data;

            const response = await registerUser(registerData).unwrap();
            toast.info(response.message || 'OTP Code sent to your email.');
            navigate('/verify-email', {
                state: { email: registerData.email }
            });
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'status' in err) {
                const fetchError = err as FetchBaseQueryError;
                const errorData = fetchError.data as IApiErrorResponse;
                if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
                    errorData.errors.forEach((valErr) => {
                        if (valErr.field) {
                            setError(valErr.field as keyof IRegisterForm, {
                                type: 'server',
                                message: valErr.message,
                            });
                        }
                    });
                    setApiError(errorData.errors[0].message);
                }
            } else if (err instanceof Error) {
                setApiError(err.message);
            } else {
                setApiError('An unexpected error occurred during registration.');
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#070a13] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">

            {/* Sign In / Create Account Tab Switcher */}
            <div className="mb-6 p-1 bg-[#0d1324] border border-slate-800/80 rounded-full flex items-center gap-1 shadow-md">
                <Link
                    to="/login"
                    className="px-6 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors rounded-full"
                >
                    Sign In
                </Link>
                <button
                    type="button"
                    className="px-6 py-2 text-xs font-semibold text-white bg-blue-600 rounded-full shadow-[0_0_12px_rgba(37,99,235,0.4)] transition-all"
                >
                    Create Account
                </button>
            </div>

            <div className="max-w-md w-full space-y-6 bg-[#0b0f1d] p-8 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-sm">

                {/* HEADER SECTION */}
                <div className="text-center space-y-1.5">
                    <h2 className="text-2xl font-bold tracking-tight text-white">
                        Create an account
                    </h2>
                    <p className="text-xs text-slate-400">
                        Join us to get the best tech gear
                    </p>
                </div>

                {/* GOOGLE AUTH BUTTON */}
                <div>
                    <GoogleAuthButton text="Sign up with Google" />
                </div>

                <div className="relative my-4 flex items-center justify-center">
                    <div className="w-full border-t border-slate-800/80" />
                    <span className="absolute bg-[#0b0f1d] px-3 text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                        Or continue with
                    </span>
                </div>

                {/* FORM SECTION */}
                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} autoComplete="off">

                    {/* 🎨 [MODIFIED]: Dark Red Error Alert Styling */}
                    {apiError && (
                        <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs">
                            {apiError}
                        </div>
                    )}

                    <div className="space-y-3.5">
                        {/* Full Name Input */}
                        <AuthInput
                            label="Full Name"
                            type="text"
                            placeholder="John Doe"
                            leftIcon={<User className="h-4 w-4 text-slate-400" />}
                            error={errors.fullName?.message}
                            {...register('fullName', {
                                required: 'Full name is required',
                                minLength: { value: 2, message: 'Full name must be at least 2 characters' }
                            })}
                        />

                        {/* Email Input */}
                        <AuthInput
                            label="Email Address"
                            type="email"
                            placeholder="you@example.com"
                            leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
                            error={errors.email?.message}
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email format'
                                }
                            })}
                        />

                        {/* Password Input */}
                        <AuthInput
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                            error={errors.password?.message}
                            {...register('password', {
                                required: 'Password is required',
                                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                                validate: {
                                    hasUppercase: (value) => /[A-Z]/.test(value) || 'Password requires at least one uppercase letter',
                                    hasLowercase: (value) => /[a-z]/.test(value) || 'Password requires at least one lowercase letter',
                                    hasNumber: (value) => /[0-9]/.test(value) || 'Password requires at least one number',
                                    hasSymbol: (value) => /[^a-zA-Z0-9]/.test(value) || 'Password requires at least one symbol',
                                }
                            })}
                        />

                        {/* Confirm Password Input */}
                        <AuthInput
                            label="Confirm Password"
                            type="password"
                            placeholder="••••••••"
                            leftIcon={<Shield className="h-4 w-4 text-slate-400" />}
                            error={errors.confirmPassword?.message}
                            {...register('confirmPassword', {
                                required: 'Please confirm your password',
                                validate: value => value === getValues('password') || 'Passwords do not match'
                            })}
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 text-xs font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.35)] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Creating account...
                                </span>
                            ) : 'Sign Up'}
                        </button>
                    </div>

                    {/* FOOTER LINK */}
                    <div className="flex items-center justify-center text-xs pt-2">
                        <span className="text-slate-400">Already have an account?</span>
                        <Link to="/login" className="ml-1.5 font-semibold text-blue-500 hover:text-blue-400 transition-colors">
                            Sign in here
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Register
