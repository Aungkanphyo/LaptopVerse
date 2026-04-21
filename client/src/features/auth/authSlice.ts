import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IAuthState, IUser } from "../../types/auth.types";

const getPersistedAuthState = (): IAuthState => {
    if (typeof window === 'undefined') return {
        user: null,
        accessToken: null,
        isAuthenticated: false,
    };

    try {
        const storedState = localStorage.getItem('authState');
        if (!storedState) return {
            user: null,
            accessToken: null,
            isAuthenticated: false,
        };

        return JSON.parse(storedState) as IAuthState;
    } catch {
        return {
            user: null,
            accessToken: null,
            isAuthenticated: false,
        };
    }
};

const initialState: IAuthState = getPersistedAuthState();

const saveAuthState = (state: IAuthState) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem('authState', JSON.stringify(state));
    } catch {
        // Ignore localStorage failures on unsupported browsers or private mode
    }
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Save User Data in Store after Login
        setCredentials: (state, action: PayloadAction<{ user: IUser; accessToken: string }>) => {
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.isAuthenticated = true;
            saveAuthState(state);
        },
        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.isAuthenticated = false;
            saveAuthState(state);
        }
    }
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;