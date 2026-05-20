import { useSearchParams, Link } from 'react-router-dom';
import { useGetProductsQuery, useDeleteProductMutation } from '../../features/products/productApiSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Pagination from '@/components/common/Pagination';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

const ProductList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;
    const keyword = searchParams.get('keyword') || '';

    const { data, isLoading, isFetching } = useGetProductsQuery({
        page,
        keyword,
        limit: 10,
    });

    const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchParams((prev) => {
            if (value) {
                prev.set('keyword', value);
            } else {
                prev.delete('keyword');
            }
            prev.set('page', '1');
            return prev;
        });
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(id).unwrap();
                toast.success('Product deleted successfully');
            } catch (error: unknown) {
                const err = error as { data?: { message?: string } };
                toast.error(err?.data?.message || 'Failed to delete product');
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
                    <p className="text-sm text-gray-500">View, edit, and delete your store products.</p>
                </div>
                <Button asChild>
                    <Link to="/admin/products/new">
                        <Plus className="size-4 mr-2" />
                        Add New Product
                    </Link>
                </Button>
            </div>

            <Card className="overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <Input
                            placeholder="Search products..."
                            className="pl-9"
                            value={keyword}
                            onChange={handleSearch}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading || isFetching ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : data?.products && data.products.length > 0 ? (
                                data.products.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded border border-gray-100 overflow-hidden shrink-0 bg-gray-50">
                                                    {product.images?.[0] ? (
                                                        <img src={product.images[0].url} alt={product.name} className="size-full object-contain" />
                                                    ) : (
                                                        <div className="size-full flex items-center justify-center text-gray-400 text-[10px]">No Image</div>
                                                    )}
                                                </div>
                                                <div className="font-medium text-gray-900 line-clamp-1">{product.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{product.category}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">${product.price.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {product.stock} in stock
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link to={`/admin/products/${product._id}/edit`}>
                                                        <Edit className="size-4 text-blue-600" />
                                                    </Link>
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleDelete(product._id)}
                                                    disabled={isDeleting}
                                                >
                                                    <Trash2 className="size-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No products found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {data && <Pagination totalItems={data.total} itemsPerPage={10} />}
        </div>
    );
};

export default ProductList;
