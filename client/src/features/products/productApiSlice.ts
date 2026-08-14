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

        // Admin-related mutations (Create, Update, Delete)
        createProduct: builder.mutation<ISingleProductResponse, FormData>({
            query: (formData) => ({
                url: '/products/admin',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: [{ type: 'Product', id: 'LIST' }],
        }),

        updateProduct: builder.mutation<ISingleProductResponse, { id: string; formData: FormData }>({
            query: ({ id, formData }) => ({
                url: `/products/admin/${id}`,
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Product', id },
                { type: 'Product', id: 'LIST' },
            ],
        }),

        deleteProduct: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/products/admin/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'Product', id: 'LIST' }],
        }),
    })
});

export const {
    useGetProductsQuery,
    useGetSingleProductQuery,
    useCreateReviewMutation,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
} = productApiSlice;