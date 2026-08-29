import type { IProduct } from "@/types/product.types";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface CompareState {
    compareItems: IProduct[];
}

const itemsFromStorage: IProduct[] = localStorage.getItem('compareItems')
    ? JSON.parse(localStorage.getItem('compareItems')!)
    : [];

const initialState: CompareState = {
    compareItems: itemsFromStorage,
};

const compareSlice = createSlice({
    name: 'compare',
    initialState,
    reducers: {
        addToCompare: (state, action: PayloadAction<IProduct>) => {
            const exists = state.compareItems.some((item) => item._id === action.payload._id);
            if (!exists && state.compareItems.length < 2) {
                state.compareItems.push(action.payload);
                localStorage.setItem('compareItems', JSON.stringify(state.compareItems));
            }
        },
        removeFromCompare: (state, action: PayloadAction<string>) => {
            state.compareItems = state.compareItems.filter((item) => item._id !== action.payload);
            localStorage.setItem('compareItems', JSON.stringify(state.compareItems));
        },
        clearCompare: (state) => {
            state.compareItems = [];
            localStorage.removeItem('compareItems');
        },
    },
});

export const { addToCompare, removeFromCompare, clearCompare } = compareSlice.actions;
export default compareSlice.reducer;