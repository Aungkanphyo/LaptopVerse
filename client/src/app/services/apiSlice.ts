import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import { logout, setCredentials } from "@/features/auth/authSlice";
import type { IUser } from "@/types/auth.types";

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.accessToken;

        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

// Added for Silent Refresh Flow: Interceptor to handle 401 errors & token refresh
const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        const refreshResult = await baseQuery(
            { url: '/auth/refresh', method: 'POST' },
            api,
            extraOptions
        );

        if (refreshResult.data) {
            const data = refreshResult.data as { accessToken: string; user: IUser };

            // The new Access Token will be updated in the Redux Store
            api.dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));

            result = await baseQuery(args, api, extraOptions);
        } else {
            // If the refresh token expires, you will be logged out
            api.dispatch(logout());
        }
    }

    return result;
};

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth, // Modified: Replaced baseQuery with baseQueryWithReauth
    tagTypes: ['Product', 'Order', 'User', 'Category', 'Brand'],
    endpoints: () => ({}),
});