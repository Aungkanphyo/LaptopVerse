export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface IShippingInfo {
    address: string;
    city: string;
    phoneNo: string;
    postalCode: string;
    country: string;
}
export interface IOrderItem {
    name: string;
    quantity: number;
    price: number;
    image: string;
    product?: string;
}
export interface ICreateOrderRequest {
    shippingInfo: IShippingInfo;
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
        slipUrl?: string;
    };
    itemsPrice: number;
    totalPrice: number;
    slipFile?: File | null;
}
export interface IOrder {
    _id: string;
    orderCode: string;
    shippingInfo: IShippingInfo;
    orderItems: IOrderItem[];
    paymentInfo: {
        id?: string;
        status: 'pending' | 'succeeded' | 'failed';
        slipUrl?: string;
        slipPublicId?: string;
    };
    itemsPrice?: number;
    totalPrice: number;
    orderStatus: OrderStatus;
    deliveredAt?: string;
    trackingInfo?: {
        courierName?: string;
        trackingNumber?: string;
    };
    cancellationReason?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface ICreateOrderResponse {
    success: boolean;
    order: IOrder;
}

// Admin Order Details Interface
export interface IAdminOrder extends IOrder {
    user: {
        _id: string;
        fullName?: string;
        name?: string;
        email: string;
    };
}
// Verify Payment Request Payload Interface
export interface IVerifyPaymentRequest {
    id: string;
    paymentStatus: 'succeeded' | 'failed';
    rejectionReason?: string;
}

export interface IUpdateOrderStatusRequest {
    id: string;
    status: OrderStatus;
    courierName?: string;
    trackingNumber?: string;
    cancellationReason?: string;
}

// Get All Orders Admin Query Parameters
export interface IGetAllOrdersAdminParams {
    page?: number;
    limit?: number;
    keyword?: string;
    status?: string;
    paymentStatus?: string;
}

// Paginated Response Interface
export interface IGetAllOrdersAdminResponse {
    success: boolean;
    count: number;
    total: number;
    totalPages: number;
    page: number;
    limit: number;
    totalAmount: number;
    orders: IAdminOrder[];
}

export interface ITrackOrderRequest {
    orderCode: string;
    phoneNo: string;
}