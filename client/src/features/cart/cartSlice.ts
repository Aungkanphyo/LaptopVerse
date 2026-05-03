import type { ICartItem, ICartState, IShippingInfo } from "@/types/cart.types";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { updateCart } from "./cartUtils";

const initialState: ICartState = localStorage.getItem("cart")
    ? JSON.parse(localStorage.getItem("cart")!)
    : { cartItems: [], shippingInfo: null, itemsPrice: 0, shippingPrice: 0, taxPrice: 0, totalPrice: 0 };

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<ICartItem>) => {
            const item = action.payload;
            const existItem = state.cartItems.find((x) => x._id === item._id);

            if (existItem) {
                state.cartItems = state.cartItems.map((x) => x._id === existItem._id ? item : x);
            } else {
                state.cartItems = [...state.cartItems, item];
            }
            return updateCart(state);
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
            return updateCart(state);
        },
        clearCartItems: (state) => {
            state.cartItems = [];
            return updateCart(state);
        },
        saveShippingInfo: (state, action: PayloadAction<IShippingInfo>) => {
            state.shippingInfo = action.payload;
            localStorage.setItem("cart", JSON.stringify(state));
        },
        saveManualTransferPayment: (
            state,
            action: PayloadAction<{ provider: string; reference: string }>
        ) => {
            state.paymentMethod = 'manual_transfer';
            state.manualTransferProvider = action.payload.provider;
            state.manualTransferReference = action.payload.reference;
            localStorage.setItem("cart", JSON.stringify(state));
        },
    }
});

export const { addToCart, removeFromCart, clearCartItems, saveShippingInfo, saveManualTransferPayment } = cartSlice.actions;
export default cartSlice.reducer;