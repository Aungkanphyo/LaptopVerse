import type { ICartState } from "@/types/cart.types";

export const getCartKey = (userId: string | undefined): string => {
    return userId ? `cart_${userId}` : "cart_guest";
}

export const addDecimals = (num: number): number => {
    return Math.round(num * 100) / 100;
}

export const updateCart = (state: ICartState) => {
    // calculate items price
    state.itemsPrice = addDecimals(state.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0));

    // calculate total price
    state.totalPrice = state.itemsPrice;

    const cartKey = getCartKey(state.userId);
    // save to localStorage
    localStorage.setItem(cartKey, JSON.stringify(state));

    return state;
}