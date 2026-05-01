import type { ICartState } from "@/types/cart.types";

export const addDecimals = (num: number): number => {
    return Math.round(num * 100) / 100;
}

export const updateCart = (state: ICartState) => {
    // calculate items price
    state.itemsPrice = addDecimals(state.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0));

    // calculate shipping price
    state.shippingPrice = addDecimals(state.itemsPrice > 1000 ? 0 : 25);

    // calculate tax price
    state.taxPrice = addDecimals(Number((0.15 * state.itemsPrice).toFixed(2)));

    // calculate total price
    state.totalPrice = addDecimals(state.itemsPrice + state.shippingPrice + state.taxPrice);

    // save to localStorage
    localStorage.setItem("cart", JSON.stringify(state));

    return state;
}