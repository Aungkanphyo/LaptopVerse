import { useAppDispatch } from "@/hooks/redux.hooks";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { useResendOtpMutation, useVerifyEmailMutation } from "../authApiSlice";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { setCredentials } from "../authSlice";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface IVerifyOtpForm {
    otp: string;
}

const VerifyOtp = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // Retrieve the email that was sent from the Register page (if not received, you will be redirected to Login)
    const email = location.state?.email || '';
    const { register, handleSubmit, formState: { errors } } = useForm<IVerifyOtpForm>();
    const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
    const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

    const [apiError, setApiError] = useState<string | null>(null);
    const [timer, setTimer] = useState<number>(60); // 60 seconds cooldown for resend

    useEffect(() => {
        if (!email) {
            toast.error('Email address is missing. Please register again.');
            navigate('/register');
        }
    }, [email, navigate]);

    // Resend OTP Cooldown Timer logic
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const onSubmit: SubmitHandler<IVerifyOtpForm> = async (data) => {
        try {
            setApiError(null);
            const response = await verifyEmail({ email, otp: data.otp }).unwrap();

            dispatch(setCredentials({
                user: response.user,
                accessToken: response.accessToken,
            }));

            toast.success('Email verified successfully!');
            navigate('/');
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'status' in error) {
                const fetchError = error as FetchBaseQueryError;
                const errorData = fetchError.data as { message?: string };
                setApiError(errorData?.message || 'Invalid or expired OTP code.');
            } else {
                setApiError('Verification failed. Please try again.');
            }
        }
    };

    const handleResendOtp = async () => {
        if (timer > 0) return;
        try {
            setApiError(null);
            const res = await resendOtp({ email }).unwrap();
            toast.success(res.message || 'New OTP sent to your email!');
            setTimer(60); // Reset timer to 60s
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error: unknown) {
            toast.error('Failed to resend OTP. Please try again later.');
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Verify Your Email</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        We have sent a 6-digit verification code to <br />
                        <span className="font-semibold text-gray-800">{email}</span>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {apiError && (
                        <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm border border-red-200">
                            {apiError}
                        </div>
                    )}

                    <div>
                        <label htmlFor="otp" className="block text-sm font-medium text-gray-700 text-left mb-1">
                            Enter 6-Digit OTP Code
                        </label>
                        <input
                            type="text"
                            id="otp"
                            maxLength={6}
                            className={`appearance-none block w-full px-3 py-3 border ${errors.otp ? 'border-red-300' : 'border-gray-300'
                                } placeholder-gray-400 text-gray-900 rounded-md tracking-widest text-center text-xl font-mono focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                            placeholder="123456"
                            {...register('otp', {
                                required: 'OTP code is required',
                                pattern: {
                                    value: /^\d{6}$/,
                                    message: 'OTP must be exactly 6 digits'
                                }
                            })}
                        />
                        {errors.otp && <p className="mt-1 text-xs text-red-500 text-left">{errors.otp.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isVerifying}
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                    >
                        {isVerifying ? 'Verifying...' : 'Verify Email'}
                    </button>
                </form>

                <div className="mt-4 text-sm text-gray-600">
                    Didn't receive the code?{' '}
                    <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={timer > 0 || isResending}
                        className="font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isResending ? 'Sending...' : timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default VerifyOtp
