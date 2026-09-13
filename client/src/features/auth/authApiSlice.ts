import type { 
    IResendOtpPayload, 
    IUser, 
    IVerifyOtpPayload, 
    IUpdateProfilePayload, 
    IUpdatePasswordPayload, 
    ISetup2FAResponse, 
    IVerify2FAPayload, 
    ILogin2FAPayload, 
    ISession 
} from "@/types/auth.types";
import { apiSlice } from "../../app/services/apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMe: builder.query<{ user: IUser; accessToken?: string }, void>({
            query: () => '/auth/me',
            providesTags: ['User'],
        }),
        login: builder.mutation({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: { ...credentials }
            }),
            invalidatesTags: ['User'],
        }),
        login2FA: builder.mutation<{ success: boolean; user: IUser; accessToken: string; message: string }, ILogin2FAPayload>({
            query: (payload) => ({
                url: '/auth/login/2fa',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: ['User'],
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
            invalidatesTags: ['User'],
        }),
        // Resend OTP Endpoint
        resendOtp: builder.mutation<{ success: boolean; message: string }, IResendOtpPayload>({
            query: (data) => ({
                url: '/auth/resend-otp',
                method: 'POST',
                body: data,
            }),
        }),
        updateProfile: builder.mutation<{ success: boolean; message: string; user: IUser }, IUpdateProfilePayload>({
            query: (data) => ({
                url: '/auth/me/update',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['User'],
        }),
        uploadAvatar: builder.mutation<{ success: boolean; message: string; avatar: { public_id: string; url: string } }, FormData>({
            query: (formData) => ({
                url: '/auth/avatar/upload',
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: ['User'],
        }),
        deleteAvatar: builder.mutation<{ success: boolean; message: string; avatar: { public_id: string; url: string } }, void>({
            query: () => ({
                url: '/auth/avatar',
                method: 'DELETE',
            }),
            invalidatesTags: ['User'],
        }),
        updatePassword: builder.mutation<{ success: boolean; message: string }, IUpdatePasswordPayload>({
            query: (passwords) => ({
                url: '/auth/password/update',
                method: 'PUT',
                body: passwords,
            }),
        }),
        setup2FA: builder.mutation<ISetup2FAResponse, void>({
            query: () => ({
                url: '/auth/2fa/setup',
                method: 'POST',
            }),
        }),
        verify2FA: builder.mutation<{ success: boolean; message: string }, IVerify2FAPayload>({
            query: (data) => ({
                url: '/auth/2fa/verify',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['User'],
        }),
        disable2FA: builder.mutation<{ success: boolean; message: string }, IVerify2FAPayload>({
            query: (data) => ({
                url: '/auth/2fa/disable',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['User'],
        }),
        getSessions: builder.query<{ success: boolean; sessions: ISession[] }, void>({
            query: () => '/auth/sessions',
            providesTags: ['Sessions'],
        }),
        revokeSession: builder.mutation<{ success: boolean; message: string }, string>({
            query: (sessionId) => ({
                url: `/auth/sessions/${sessionId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Sessions'],
        }),
        logout: builder.mutation({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
            invalidatesTags: ['User', 'Sessions'],
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
    useUpdateProfileMutation,
    useUploadAvatarMutation,
    useDeleteAvatarMutation,
    useUpdatePasswordMutation,
    useSetup2FAMutation,
    useVerify2FAMutation,
    useDisable2FAMutation,
    useGetSessionsQuery,
    useRevokeSessionMutation,
    useLogoutMutation,
} = authApiSlice;