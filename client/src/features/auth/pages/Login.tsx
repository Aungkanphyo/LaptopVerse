import { useForm, type SubmitHandler } from "react-hook-form";
import { useAppDispatch } from "../../../hooks/redux.hooks";
import { Link, useNavigate } from "react-router-dom";
import { useLoginMutation } from "../authApiSlice";
import { useState } from "react";
import { setCredentials } from "../authSlice";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

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

    // Local Error State (to display errors returned from the backend)
    const [apiError, setApiError] = useState<string | null>(null);

    // Form submit logic
    const onSubmit: SubmitHandler<ILoginForm> = async (data) => {
        try {
            setApiError(null);
            const response = await login(data).unwrap();

            // Saving to Redux Store
            dispatch(setCredentials({
                user: response.user,
                accessToken: response.accessToken,
            }));
            navigate('/');
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'status' in err) {
                const fetchError = err as FetchBaseQueryError;

                const errorData = fetchError.data as { success?: boolean; message?: string };
                setApiError(errorData?.message || 'Something went wrong. Please try again.');
            } else if (err instanceof Error) {
                setApiError(err.message);
            } else {
                setApiError('An unexpected error occurred.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                {/* Header section */}
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to your account to continue
                    </p>
                </div>

                {/* Form section */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {/* API Error Alert */}
                    {apiError && (
                        <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm border border-red-200">
                            {apiError}
                        </div>
                    )}

                    <div className="space-y-4 rounded-md shadow-sm">
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input type="email" id="email" className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'
                                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors`} placeholder="you@example.com"
                                {...register('email', {
                                    required: 'Email is required', pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input type="password" id="password" className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'
                                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors`}
                                placeholder="••••••••" {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters'
                                    }
                                })}
                            />
                            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                        </div>
                    </div>

                    {/* Submit button */}
                    <div>
                        <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all">
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </div>

                    {/* Fotter links */}
                    <div className="flex items-center justify-center text-sm mt-4">
                        <span className="text-gray-600">Don't have an account?</span>
                        <Link to="/register" className="ml-1 font-medium text-blue-600 hover:text-blue-500 transition-colors">
                            Sign up here
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
};

export default Login;