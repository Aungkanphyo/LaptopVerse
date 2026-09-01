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
    taxPrice: number;
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
    }),
});

export const { useCreateOrderMutation, useGetMyOrdersQuery } = orderApiSlice;

