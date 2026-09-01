import type { ICartItem, ICartState, IShippingInfo } from "@/types/cart.types";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getCartKey, updateCart } from "./cartUtils";

const initialState: ICartState = {
    userId: undefined,
    cartItems: [],
    shippingInfo: null,
    itemsPrice: 0,
    shippingPrice: 0,
    totalPrice: 0
}

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        initializeCart: (state, action: PayloadAction<string | undefined>) => {
            const userId = action.payload;
            const cartKey = getCartKey(userId);
            const savedCart = localStorage.getItem(cartKey);
            
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);
                state.cartItems = parsedCart.cartItems || [];
                state.shippingInfo = parsedCart.shippingInfo || null;
                state.itemsPrice = parsedCart.itemsPrice || 0;
                state.shippingPrice = parsedCart.shippingPrice || 0;
                state.totalPrice = parsedCart.totalPrice || 0;
                state.paymentMethod = parsedCart.paymentMethod;
                state.manualTransferProvider = parsedCart.manualTransferProvider;
                state.manualTransferReference = parsedCart.manualTransferReference;
            } else {
                state.cartItems = [];
                state.shippingInfo = null;
                state.itemsPrice = 0;
                state.shippingPrice = 0;
                state.totalPrice = 0;
                state.paymentMethod = undefined;
                state.manualTransferProvider = undefined;
                state.manualTransferReference = undefined;
            }
            
            state.userId = userId;

            // Merge guest cart if user just logged in
            if (userId) {
                const guestCartJson = localStorage.getItem(getCartKey(undefined));
                if (guestCartJson) {
                    const guestCart: ICartState = JSON.parse(guestCartJson);
                    if (guestCart.cartItems && guestCart.cartItems.length > 0) {
                        guestCart.cartItems.forEach(guestItem => {
                            const existingItem = state.cartItems.find(item => item._id === guestItem._id);
                            if (existingItem) {
                                existingItem.qty += guestItem.qty;
                            } else {
                                state.cartItems.push(guestItem);
                            }
                        });
                        localStorage.removeItem(getCartKey(undefined));
                    }
                }
            }

            return updateCart(state);
        },       
        addToCart: (state, action: PayloadAction<ICartItem>) => {
            const item = action.payload;
            const existItem = state.cartItems.find((x) => x._id === item._id);

            if (existItem) {
                state.cartItems = state.cartItems.map((x) =>
                    x._id === existItem._id ? item : x
                );
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
            return updateCart(state);
        },
        saveManualTransferPayment: (
            state,
            action: PayloadAction<{ provider: string; reference: string }>
        ) => {
            state.paymentMethod = 'manual_transfer';
            state.manualTransferProvider = action.payload.provider;
            state.manualTransferReference = action.payload.reference;
            return updateCart(state);
        },
        resetCartState: () => initialState
    }
});

export const { addToCart, removeFromCart, clearCartItems, saveShippingInfo, saveManualTransferPayment, initializeCart, resetCartState } = cartSlice.actions;
export default cartSlice.reducer;