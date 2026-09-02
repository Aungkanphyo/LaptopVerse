import { apiSlice } from "../../app/services/apiSlice";
import type { IBrandItem, ICategoryItem, IProductQueryParams, IProductResponse, IReviewResponse, ISingleProductResponse } from "../../types/product.types";

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
                    : [{ type: 'Product', id: 'LIST' }]
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

        getProductStats: builder.query<{ stats: { totalProducts: number; inStock: number; outOfStock: number } }, void>({
            query: () => '/products/admin/stats',
            providesTags: [{ type: 'Product', id: 'STATS' }],
        }),

        // Admin-related mutations (Create, Update, Delete)
        createProduct: builder.mutation<ISingleProductResponse, FormData>({
            query: (formData) => ({
                url: '/products/admin',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: [
                { type: 'Product', id: 'LIST' },
                { type: 'Product', id: 'STATS' }
            ],
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

        // Categories Endpoints
        getCategories: builder.query<{ categories: ICategoryItem[] }, void>({
            query: () => '/admin/categories',
            providesTags: ['Category'],
        }),
        createCategory: builder.mutation<{ category: ICategoryItem }, { name: string; description?: string }>({
            query: (body) => ({
                url: '/admin/categories',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Category'],
        }),
        updateCategory: builder.mutation<{ category: ICategoryItem }, { id: string; name: string; description?: string }>({
            query: ({ id, ...body }) => ({
                url: `/admin/categories/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Category'],
        }),
        toggleCategoryStatus: builder.mutation<{ category: ICategoryItem }, string>({
            query: (id) => ({
                url: `/admin/categories/${id}/toggle-status`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Category'],
        }),

        // Brands Endpoints
        getBrands: builder.query<{ brands: IBrandItem[] }, void>({
            query: () => '/admin/brands',
            providesTags: ['Brand'],
        }),
        createBrand: builder.mutation<{ brand: IBrandItem }, { name: string; description?: string }>({
            query: (body) => ({
                url: '/admin/brands',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Brand'],
        }),
        updateBrand: builder.mutation<{ brand: IBrandItem }, { id: string; name: string; description?: string }>({
            query: ({ id, ...body }) => ({
                url: `/admin/brands/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Brand'],
        }),
        toggleBrandStatus: builder.mutation<{ brand: IBrandItem }, string>({
            query: (id) => ({
                url: `/admin/brands/${id}/toggle-status`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Brand'],
        }),
    })
});

export const {
    useGetProductsQuery,
    useGetProductStatsQuery,
    useGetSingleProductQuery,
    useCreateReviewMutation,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useGetCategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useToggleCategoryStatusMutation,
    useGetBrandsQuery,
    useCreateBrandMutation,
    useUpdateBrandMutation,
    useToggleBrandStatusMutation,
} = productApiSlice;