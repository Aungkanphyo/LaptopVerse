import { apiSlice } from "@/app/services/apiSlice";

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
  }),
});

export const { useGetContactSettingsQuery, useUpdateContactSettingsAdminMutation } = contactApiSlice;