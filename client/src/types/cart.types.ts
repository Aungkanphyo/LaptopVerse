import type { IProduct } from "./product.types";

export interface ICartItem extends IProduct {
    qty: number;
}

export interface IShippingInfo {
    address: string;
    city: string;
    phoneNo: string;
    zipCode: string;
    country: string;
}

export interface ICartState {
    cartItems: ICartItem[];
    shippingInfo: IShippingInfo | null;
    itemsPrice: number;
    shippingPrice: number;
    taxPrice: number;
    totalPrice: number;
}