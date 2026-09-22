import { useForm, type SubmitHandler } from "react-hook-form";
import { useAppDispatch } from "../../../hooks/redux.hooks";
import { Link, useNavigate } from "react-router-dom";
import { useLogin2FAMutation, useLoginMutation } from "../authApiSlice";
import { useState } from "react";
import { setCredentials } from "../authSlice";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { AuthInput } from "../components/AuthInput";
import { KeyRound, Lock, Mail } from "lucide-react";
import GoogleAuthButton from "../components/GoogleAuthButton";

interface ILoginForm {
    email: string;
    password: string;
}

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<ILoginForm>();

    // Redux & Router Setup
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [login, { isLoading }] = useLoginMutation();
    const [login2FA, { isLoading: is2FALoading }] = useLogin2FAMutation(); // 2FA Login Mutation Hook

    // Local States
    const [apiError, setApiError] = useState<string | null>(null);
    const [is2FARequired, setIs2FARequired] = useState<boolean>(false); // 2FA Form State
    const [userIdFor2FA, setUserIdFor2FA] = useState<string | null>(null);
    const [twoFactorCode, setTwoFactorCode] = useState<string>('');

    // Form submit logic (Email & Password Login)
    const onSubmit: SubmitHandler<ILoginForm> = async (data) => {
        try {
            setApiError(null);
            const response = await login(data).unwrap();

            // backend requests 2FA, it will transition to the 2FA step
            if (response.require2FA) {
                setIs2FARequired(true);
                setUserIdFor2FA(response.userId);
                return;
            }

            // Normal Login (For users who have not enabled 2FA)
            dispatch(setCredentials({
                user: response.user,
                accessToken: response.accessToken,
            }));
            navigate('/');
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'status' in err) {
                const fetchError = err as FetchBaseQueryError;
                const errorData = fetchError.data as { success?: boolean; message?: string };

                if (fetchError.status === 403 && errorData?.message?.includes('verify')) {
                    navigate('/verify-email', { state: { email: data.email } });
                    return;
                }

                setApiError(errorData?.message || 'Something went wrong. Please try again.');
            } else if (err instanceof Error) {
                setApiError(err.message);
            } else {
                setApiError('An unexpected error occurred.');
            }
        }
    };

    // 2FA Verification Submit Handler
    const handle2FASubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userIdFor2FA || !twoFactorCode) {
            setApiError('Please enter your 6-digit authentication code.');
            return;
        }

        try {
            setApiError(null);
            const response = await login2FA({
                userId: userIdFor2FA,
                token: twoFactorCode
            }).unwrap();

            // 2FA pass send user and token to redux and then redirect to home page
            dispatch(setCredentials({
                user: response.user,
                accessToken: response.accessToken,
            }));
            navigate('/');
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'data' in err) {
                const fetchError = err as { data?: { message?: string } };
                setApiError(fetchError.data?.message || 'Invalid 2FA code. Please try again.');
            } else {
                setApiError('2FA verification failed.');
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#070a13] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">

            {/* Top Tab Switcher */}
            <div className="mb-6 p-1 bg-[#0d1324] border border-slate-800/80 rounded-full flex items-center gap-1 shadow-md">
                <button
                    type="button"
                    className="px-6 py-2 text-xs font-semibold text-white bg-blue-600 rounded-full shadow-[0_0_12px_rgba(37,99,235,0.4)] transition-all"
                >
                    Sign In
                </button>
                <Link
                    to="/register"
                    className="px-6 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors rounded-full"
                >
                    Create Account
                </Link>
            </div>

            <div className="max-w-md w-full space-y-6 bg-[#0b0f1d] p-8 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-sm">
                <div className="text-center space-y-1.5">
                    <h2 className="text-2xl font-bold tracking-tight text-white">
                        {is2FARequired ? 'Two-Factor Authentication' : 'Welcome back'}
                    </h2>
                    <p className="text-xs text-slate-400">
                        {is2FARequired
                            ? 'Enter the 6-digit code from your authenticator app'
                            : 'Sign in to your account to continue'}
                    </p>
                </div>

                {apiError && (
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs">
                        {apiError}
                    </div>
                )}

                {is2FARequired ? (
                    <form className="space-y-4" onSubmit={handle2FASubmit}>
                        <AuthInput
                            label="6-Digit Authenticator Code"
                            type="text"
                            maxLength={6}
                            value={twoFactorCode}
                            onChange={(e) => setTwoFactorCode(e.target.value)}
                            placeholder="123456"
                            leftIcon={<KeyRound className="h-4 w-4 text-slate-400" />}
                            className="text-center tracking-widest font-bold text-base"
                            autoFocus
                            required
                        />

                        <button
                            type="submit"
                            disabled={is2FALoading}
                            className="w-full flex justify-center py-3 px-4 text-xs font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.35)] disabled:opacity-60 transition-all"
                        >
                            {is2FALoading ? 'Verifying...' : 'Verify Code & Sign In'}
                        </button>

                        <div className="text-center pt-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setIs2FARequired(false);
                                    setApiError(null);
                                }}
                                className="text-xs text-blue-500 hover:underline"
                            >
                                Back to Email/Password Login
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        <GoogleAuthButton text="Sign in with Google" />

                        <div className="relative my-4 flex items-center justify-center">
                            <div className="w-full border-t border-slate-800/80" />
                            <span className="absolute bg-[#0b0f1d] px-3 text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                                Or continue with
                            </span>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                            <div className="space-y-3.5">
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
                                            message: 'Invalid email address'
                                        }
                                    })}
                                />
                                <AuthInput
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                                    error={errors.password?.message}
                                    {...register('password', {
                                        required: 'Password is required'
                                    })}
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-3 px-4 text-xs font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.35)] disabled:opacity-60 transition-all"
                                >
                                    {isLoading ? 'Signing in...' : 'Sign In'}
                                </button>
                            </div>

                            <div className="flex items-center justify-center text-xs pt-2">
                                <span className="text-slate-400">Don't have an account?</span>
                                <Link to="/register" className="ml-1.5 font-semibold text-blue-500 hover:text-blue-400 transition-colors">
                                    Sign up here
                                </Link>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default Login;