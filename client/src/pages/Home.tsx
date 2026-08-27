import { useSearchParams } from 'react-router-dom';
import { useGetProductsQuery } from '../features/products/productApiSlice';
import ProductCard from '../features/products/components/ProductCard';
import ProductSkeleton from '../features/products/components/ProductSkeleton';
import type { IProduct } from '@/types/product.types';
import Pagination from '@/components/common/Pagination';

const Home = () => {
    // Reading Query Parameters from a URL (e.g. ?keyword=macbook&category=gaming)
    const [searchParams, setSearchParams] = useSearchParams();
    const keyword = searchParams.get('keyword') || undefined;
    const category = searchParams.get('category') || undefined;
    const page = Number(searchParams.get('page')) || 1;

    const { data, isLoading, isError, isFetching } = useGetProductsQuery({
        keyword,
        category,
        page,
        limit: 8,
    });

    const showLoading = isLoading || isFetching;

    const handlePageChange = (newPage: number) => {
        setSearchParams((prev) => {
            prev.set('page', newPage.toString());
            return prev;
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    Explore Laptops
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                    Find the perfect machine for your work, gaming, and everyday use.
                </p>
            </div>

            {/* Error State */}
            {isError && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 mb-8 text-center">
                    <p className="font-semibold">Oops! Something went wrong.</p>
                    <p className="text-sm">Unable to fetch products at this time. Please try again later.</p>
                </div>
            )}

            {/* Product Grid Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {showLoading ? (
                    /* show 8 skeleton */
                    Array.from({ length: 8 }).map((_, index) => (
                        <ProductSkeleton key={index} />
                    ))
                ) : data?.products && data.products.length > 0 ? (
                    /* show product card if get data */
                    data.products.map((product: IProduct) => (
                        <ProductCard key={product._id} product={product} />
                    ))
                ) : !isError ? (
                    /* unstock show empty */
                    <div className="col-span-full py-12 text-center">
                        <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                    </div>
                ) : null}
            </div>

            {data && (
                <div className="mt-12 flex justify-center">
                    <Pagination
                        currentPage={page}
                        totalPages={data.totalPages || Math.ceil((data.total || 0) / 8)}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

        </div>
    );
};

export default Home;