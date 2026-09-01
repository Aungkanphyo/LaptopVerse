import type { IResendOtpPayload, IUser, IVerifyOtpPayload } from "@/types/auth.types";
import { apiSlice } from "../../app/services/apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMe: builder.query<{ user: IUser; accessToken?: string }, void>({
            query: () => '/auth/me',
        }),
        login: builder.mutation({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: { ...credentials }
            }),
        }),
        register: builder.mutation({
            query: (userData) => ({
                url: '/auth/register',
                method: 'POST',
                body: { ...userData }
            }),
        }),
        // OTP Verification Endpoint
        verifyEmail: builder.mutation<{ user: IUser; accessToken: string; message: string }, IVerifyOtpPayload>({
            query: (data) => ({
                url: '/auth/verify-email',
                method: 'POST',
                body: data,
            }),
        }),
        // Resend OTP Endpoint
        resendOtp: builder.mutation<{ success: boolean; message: string }, IResendOtpPayload>({
            query: (data) => ({
                url: '/auth/resend-otp',
                method: 'POST',
                body: data,
            }),
        }),
        logout: builder.mutation({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
        }),
        // Change Password Endpoint
        updatePassword: builder.mutation<{ success: boolean; message: string }, { oldPassword: string; newPassword: string }>({
            query: (passwords) => ({
                url: '/auth/password/update',
                method: 'PUT',
                body: passwords,
            }),
        }),
    }),
});

export const {
    useGetMeQuery,
    useLazyGetMeQuery,
    useLoginMutation,
    useRegisterMutation,
    useVerifyEmailMutation,
    useResendOtpMutation,
    useLogoutMutation,
    useUpdatePasswordMutation,
} = authApiSlice;