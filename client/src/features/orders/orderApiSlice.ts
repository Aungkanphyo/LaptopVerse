import { apiSlice } from "@/app/services/apiSlice";

export interface ICreateOrderRequest {
    shippingInfo: {
        address: string;
        city: string;
        phoneNo: string;
        postalCode: string;
        country: string;
    };
    orderItems: Array<{
        name: string;
        quantity: number;
        price: number;
        image: string;
        product: string;
    }>;
    paymentInfo: {
        id?: string;
        status: string;
    };
    itemsPrice: number;
    shippingPrice: number;
    totalPrice: number;
}

export interface ICreateOrderResponse {
    success: boolean;
    order: unknown;
}

export interface IOrder {
    _id: string;
    orderItems: Array<{
        name: string;
        quantity: number;
        price: number;
        image: string;
    }>;
    paymentInfo: {
        id?: string;
        status: 'pending' | 'succeeded' | 'failed';
    };
    totalPrice: number;
    orderStatus: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    createdAt: string;
}

// Admin Order Details Interface
export interface IAdminOrder extends IOrder {
    user: {
        _id: string;
        fullName?: string;
        name?: string;
        email: string;
    };
    shippingInfo: {
        address: string;
        city: string;
        phoneNo: string;
        postalCode: string;
        country: string;
    };
}

// Verify Payment Request Payload Interface
export interface IVerifyPaymentRequest {
    id: string;
    paymentStatus: 'succeeded' | 'failed';
    rejectionReason?: string;
}

export const orderApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createOrder: builder.mutation<ICreateOrderResponse, ICreateOrderRequest>({
            query: (body) => ({
                url: "/orders/new",
                method: "POST",
                body,
            }),
        }),
        getMyOrders: builder.query<{ success: boolean; orders: IOrder[] }, void>({
            query: () => "/orders/my/orders",
            providesTags: ["Order"],
        }),
        // Admin Endpoint - Get All Orders
        getAllOrdersAdmin: builder.query<{ success: boolean; count: number; totalAmount: number; orders: IAdminOrder[] }, { status?: string } | void>({
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
    }),
});

export const { 
    useCreateOrderMutation, 
    useGetMyOrdersQuery,
    useGetAllOrdersAdminQuery,
    useVerifyPaymentMutation
} = orderApiSlice;

