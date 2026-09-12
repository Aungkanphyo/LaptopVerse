import { apiSlice } from "@/app/services/apiSlice";
import type { IGetInquiriesParams, IInquiryResponse, ISubmitInquiryRequest, IUpdateInquiryRequest } from "@/types/inquiry.types";

export interface IContactSettings {
    email: string;
    phone: string;
    address: string;
    workingHours?: string;
}

export const contactApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getContactSettings: builder.query<{ success: boolean; settings: IContactSettings }, void>({
            query: () => "/contact-settings",
            providesTags: ["ContactSettings"],
        }),
        updateContactSettingsAdmin: builder.mutation<{ success: boolean; message: string }, IContactSettings>({
            query: (data) => ({ url: "/admin/contact-settings", method: "PUT", body: data }),
            invalidatesTags: ["ContactSettings"],
        }),
        // --- Inquiry Endpoints ---
        submitInquiry: builder.mutation<{ success: boolean; message: string }, ISubmitInquiryRequest>({
            query: (data) => ({
                url: "/inquiries",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Inquiries"],
        }),
        getInquiriesAdmin: builder.query<IInquiryResponse, IGetInquiriesParams>({
            query: (params) => ({
                url: "/inquiries",
                method: "GET",
                params,
            }),
            providesTags: ["Inquiries"],
        }),
        updateInquiryStatusAdmin: builder.mutation<{ success: boolean; message: string }, IUpdateInquiryRequest>({
            query: ({ id, ...body }) => ({
                url: `/inquiries/${id}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["Inquiries"],
        }),
        replyInquiryAdmin: builder.mutation<{ success: boolean; message: string }, { id: string; replyMessage: string }>({
            query: ({ id, replyMessage }) => ({
                url: `/inquiries/${id}/reply`,
                method: "POST",
                body: { replyMessage },
            }),
            invalidatesTags: ["Inquiries"],
        }),
        deleteInquiryAdmin: builder.mutation<{ success: boolean; message: string }, string>({
            query: (id) => ({
                url: `/inquiries/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Inquiries"],
        }),
    }),
});

export const {
    useGetContactSettingsQuery,
    useUpdateContactSettingsAdminMutation,
    useSubmitInquiryMutation,
    useGetInquiriesAdminQuery,
    useUpdateInquiryStatusAdminMutation,
    useReplyInquiryAdminMutation,
    useDeleteInquiryAdminMutation,
} = contactApiSlice;