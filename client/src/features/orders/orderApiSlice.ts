import { apiSlice } from "@/app/services/apiSlice";
import type { ICreateOrderRequest, ICreateOrderResponse, IGetAllOrdersAdminParams, IGetAllOrdersAdminResponse, IOrder, ITrackOrderRequest, IUpdateOrderStatusRequest, IVerifyPaymentRequest } from "@/types/order.types";

export const orderApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createOrder: builder.mutation<ICreateOrderResponse, ICreateOrderRequest>({
            query: (data) => {
                const { slipFile, ...orderData } = data;
                if (slipFile) {
                    const formData = new FormData();
                    formData.append("slipFile", slipFile);
                    // Dynamic looping - will work automatically even if new fields are added
                    Object.entries(orderData).forEach(([key, value]) => {
                        if (value !== undefined && value !== null) {
                            if (typeof value === "object") {
                                formData.append(key, JSON.stringify(value));
                            } else {
                                formData.append(key, String(value));
                            }
                        }
                    });
                    return {
                        url: "/orders/new",
                        method: "POST",
                        body: formData,
                    };
                }
                return {
                    url: "/orders/new",
                    method: "POST",
                    body: orderData,
                };
            },
            invalidatesTags: [
                { type: "Product", id: "LIST" },
                { type: "Product", id: "STATS" },
                "Product",
                "Order",
            ],
        }),
        getMyOrders: builder.query<{ success: boolean; orders: IOrder[] }, void>({
            query: () => "/orders/my/orders",
            providesTags: ["Order"],
        }),
        // Admin Endpoint - Get All Orders
        getAllOrdersAdmin: builder.query<IGetAllOrdersAdminResponse, IGetAllOrdersAdminParams | void>({
            query: (params) => ({
                url: "/orders/admin/all",
                method: "GET",
                params: params ? params : undefined,
            }),
            providesTags: ["Order"],
        }),
        // Admin Endpoint - Verify Payment Status (Approve/Reject)
        verifyPayment: builder.mutation<{ success: boolean; message: string; order: IOrder }, IVerifyPaymentRequest>({
            query: ({ id, ...body }) => ({
                url: `/orders/admin/${id}/verify-payment`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Order"],
        }),
        // Admin Update Order Status Endpoint
        updateOrderStatusAdmin: builder.mutation<{ success: boolean; message: string; data: IOrder }, IUpdateOrderStatusRequest>({
            query: ({ id, ...body }) => ({
                url: `/orders/admin/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Order"],
        }),
        // Guest Order Tracking API
        trackOrder: builder.query<{ success: boolean; order: IOrder }, ITrackOrderRequest>({
            query: ({ orderCode, phoneNo }) => ({
                url: "/orders/track",
                method: "POST",
                body: { orderCode, phoneNo },
            }),
        }),
    }),
});

export const {
    useCreateOrderMutation,
    useGetMyOrdersQuery,
    useGetAllOrdersAdminQuery,
    useVerifyPaymentMutation,
    useUpdateOrderStatusAdminMutation,
    useTrackOrderQuery,
} = orderApiSlice;

