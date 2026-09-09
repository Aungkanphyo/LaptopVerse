import { useSearchParams } from 'react-router-dom';
import { useGetProductsQuery } from '../../products/productApiSlice';
import ProductCard from '../../products/components/ProductCard';
import ProductSkeleton from '../../products/components/ProductSkeleton';
import Pagination from '@/components/common/Pagination';
import type { IProduct } from '@/types/product.types';

const ProductExploreSection = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const keyword = searchParams.get('keyword') || undefined;
    const page = Number(searchParams.get('page')) || 1;

    const { data, isLoading, isError, isFetching } = useGetProductsQuery({
        keyword,
        page,
        limit: 8,
    });

    const showLoading = isLoading || isFetching;

    const handlePageChange = (newPage: number) => {
        setSearchParams((prev) => {
            prev.set('page', newPage.toString());
            return prev;
        });
        window.scrollTo({ top: 600, behavior: 'smooth' });
    };

    return (
        <section id="explore" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-black text-white tracking-tight">Explore Laptops</h2>
                <p className="text-xs text-slate-400 mt-1">
                    Search specific hardware specs or browse our laptop collection.
                </p>
            </div>

            {/* Error State */}
            {isError && (
                <div className="p-4 bg-red-950/40 border border-red-800/50 text-red-400 rounded-2xl mb-8 text-center text-sm">
                    Unable to fetch laptops. Please try again later.
                </div>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {showLoading ? (
                    Array.from({ length: 8 }).map((_, index) => (
                        <ProductSkeleton key={index} />
                    ))
                ) : data?.products && data.products.length > 0 ? (
                    data.products.map((product: IProduct) => (
                        <ProductCard key={product._id} product={product} />
                    ))
                ) : !isError ? (
                    <div className="col-span-full py-16 text-center text-slate-400">
                        No products found matching your criteria.
                    </div>
                ) : null}
            </div>

            {/* Pagination */}
            {data && (
                <div className="mt-12 flex justify-center">
                    <Pagination
                        currentPage={page}
                        totalPages={data.totalPages || Math.ceil((data.total || 0) / 8)}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </section>
    );
};

export default ProductExploreSection;