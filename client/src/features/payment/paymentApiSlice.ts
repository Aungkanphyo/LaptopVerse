import { apiSlice } from "@/app/services/apiSlice";
import type {
  IAdminManualPaymentSettingsResponse,
  IPublicManualPaymentInfoResponse,
  IManualPaymentAccount,
} from "@/types/payment.types";

export const paymentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPublicManualPaymentInfo: builder.query<IPublicManualPaymentInfoResponse, void>({
      query: () => ({
        url: "/payment/manual-info",
        method: "GET",
      }),
    }),

    getAdminManualPaymentSettings: builder.query<IAdminManualPaymentSettingsResponse, void>({
      query: () => ({
        url: "/admin/manual-payment",
        method: "GET",
      }),
    }),

    updateAdminManualPaymentSettings: builder.mutation<IAdminManualPaymentSettingsResponse, { enabled: boolean; instructions: string; accounts: IManualPaymentAccount[] }>({
      query: (body) => ({
        url: "/admin/manual-payment",
        method: "PUT",
        body,
      }),
    }),
  }),
});

export const {
  useGetPublicManualPaymentInfoQuery,
  useGetAdminManualPaymentSettingsQuery,
  useUpdateAdminManualPaymentSettingsMutation,
} = paymentApiSlice;

