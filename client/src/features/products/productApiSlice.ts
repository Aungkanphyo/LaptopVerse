import { apiSlice } from "../../app/services/apiSlice";
import type { IProductQueryParams, IProductResponse, IReviewResponse, ISingleProductResponse } from "../../types/product.types";

export const productApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get All Products (Filter, Search, Pagination)
        getProducts: builder.query<IProductResponse, IProductQueryParams | void>({
            query: (params) => ({
                url: '/products',
                method: 'GET',
                params: params || {}, // keyword=xxx&category=xxx etc. will be automatically added to the URL by RTK Query.
            }),
            // If new data is added, the cache will be cleared
            providesTags: (result) =>
                result
                    ? [
                        ...result.products.map(({ _id }) => ({ type: 'Product' as const, id: _id })),
                        { type: 'Product', id: 'LIST' },
                    ]
                    : [{ type: 'Product', id: 'LIST'}]
        }),

        getSingleProduct: builder.query<ISingleProductResponse, string>({
            query: (id) => `/products/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Product', id }],
        }),

        createReview: builder.mutation<IReviewResponse, { rating: number; comment: string; productId: string }>({
            query: (body) => ({
                url: '/products/review',
                method: 'PUT',
                body,
            }),
            invalidatesTags: (_result, _error, { productId }) => [
                { type: 'Product', id: productId }
            ],
        }),

        // Admin-related mutations (Create, Update, Delete) will be added later in the Admin Panel
    })
});

export const {
    useGetProductsQuery,
    useGetSingleProductQuery,
    useCreateReviewMutation,
} = productApiSlice;