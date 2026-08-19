import { useForm, type SubmitHandler } from 'react-hook-form';
import { useAppDispatch } from '../../../hooks/redux.hooks';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../authApiSlice';
import { useState } from 'react';
import { setCredentials } from '../authSlice';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

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

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [registerUser, { isLoading }] = useRegisterMutation();
    const [apiError, setApiError] = useState<string | null>(null);

    const onSubmit: SubmitHandler<IRegisterForm> = async (data) => {
        try {
            setApiError(null);

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { confirmPassword, ...registerData } = data;

            const response = await registerUser(registerData).unwrap();
            dispatch(setCredentials({
                user: response.user,
                accessToken: response.accessToken
            }));

            navigate('/');
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                {/* Header Section */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Create an account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join us to get the best tech gear
                    </p>
                </div>

                {/* Form Section */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                    {/* API Error Alert */}
                    {apiError && (
                        <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm border border-red-200">
                            {apiError}
                        </div>
                    )}

                    <div className="space-y-4 rounded-md shadow-sm">
                        {/* Full Name Input */}
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <input type="text" id="fullName" className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${errors.fullName ? 'border-red-300' : 'border-gray-300'
                                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors`} placeholder='John Doe' {...register('fullName', { required: 'Full name is required', minLength: { value: 2, message: 'Full name must be at least 2 characters' } })} />
                            {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
                        </div>

                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Eamil Address
                            </label>
                            <input type="email" id="email" className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'
                                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors`}
                                placeholder="you@example.com" {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email format" } })}
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'
                                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors`}
                                placeholder="••••••••"
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: { value: 8, message: "Password must be at least 8 characters" },
                                    validate: {
                                        // Uppercase check
                                        hasUppercase: (value) => /[A-Z]/.test(value) || "Password requires at least one uppercase letter",
                                        // Lowercase check
                                        hasLowercase: (value) => /[a-z]/.test(value) || "Password requires at least one lowercase letter",
                                        // Number check
                                        hasNumber: (value) => /[0-9]/.test(value) || "Password requires at least one number",
                                        // Symbol check
                                        hasSymbol: (value) => /[^a-zA-Z0-9]/.test(value) || "Password requires at least one symbol",
                                    }
                                })}
                            />
                            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                        </div>

                        {/* Confirm Password Input */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors`}
                                placeholder="••••••••"
                                {...register('confirmPassword', {
                                    required: 'Please confirm your password',
                                    validate: value => value === getValues('password') || "Passwords do not match"
                                })}
                            />
                            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Creating account...
                                </span>
                            ) : 'Sign Up'}
                        </button>
                    </div>

                    {/* Footer Links */}
                    <div className="flex items-center justify-center text-sm mt-4">
                        <span className="text-gray-600">Already have an account?</span>
                        <Link to="/login" className="ml-1 font-medium text-blue-600 hover:text-blue-500 transition-colors">
                            Sign in here
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Register
