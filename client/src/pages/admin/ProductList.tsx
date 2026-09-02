import { useSearchParams, Link } from 'react-router-dom';
import { useGetProductsQuery, useDeleteProductMutation, useGetProductStatsQuery } from '../../features/products/productApiSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/common/Pagination';
import { Edit, Trash2, Plus, Search, Package, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const ProductList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;
    const keyword = searchParams.get('keyword') || '';
    const limit = Number(searchParams.get('limit')) || 5;

    const { data, isLoading, isFetching } = useGetProductsQuery({
        page,
        keyword,
        limit
    });

    const { data: statsData } = useGetProductStatsQuery();
    const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

    // Calculate stats (in a real app, these might come from a separate API)
    const stats = [
        {
            label: 'Total Products',
            value: statsData?.stats?.totalProducts || 0,
            icon: Package,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            label: 'In Stock',
            value: statsData?.stats?.inStock || 0,
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        {
            label: 'Out of Stock',
            value: statsData?.stats?.outOfStock || 0,
            icon: AlertTriangle,
            color: 'text-rose-600',
            bg: 'bg-rose-50'
        },
    ];

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

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLimit = e.target.value;
        setSearchParams((prev) => {
            prev.set('limit', newLimit);
            prev.set('page', '1');
            return prev;
        });
    };

    const handlePageChange = (newPage: number) => {
        setSearchParams((prev) => {
            prev.set('page', newPage.toString());
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

    const totalItems = data?.total || 0;
    const startItem = totalItems > 0 ? (page - 1) * limit + 1 : 0;
    const endItem = Math.min(page * limit, totalItems);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Products</h1>
                    <p className="text-muted-foreground mt-1">Manage your catalog, inventory and product information.</p>
                </div>
                <Button asChild className="rounded-full px-6">
                    <Link to="/admin/products/new">
                        <Plus className="size-4 mr-2" />
                        Add New Product
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, idx) => (
                    <Card key={idx} className="border-none shadow-sm bg-white overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className={`size-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                                    <stat.icon className={`size-6 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-none shadow-sm overflow-hidden bg-white">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <Input
                            placeholder="Search by name or category..."
                            className="pl-9 rounded-full bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                            value={keyword}
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <span>Show</span>
                        <select
                            value={limit}
                            onChange={handleLimitChange}
                            className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <span>entries</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-xs uppercase tracking-wider text-muted-foreground font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Product Details</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Brand</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Stock Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading || isFetching ? (
                                Array.from({ length: limit }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-lg bg-gray-100"></div>
                                                <div className="h-4 bg-gray-100 rounded w-48"></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-100 rounded w-20 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : data?.products && data.products.length > 0 ? (
                                data.products.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-12 rounded-xl border border-gray-100 overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center">
                                                    {product.images?.[0] ? (
                                                        <img src={product.images[0].url} alt={product.name} className="size-full object-contain p-1" />
                                                    ) : (
                                                        <Package className="size-5 text-gray-300" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">{product.name}</div>
                                                    <div className="text-xs text-muted-foreground mt-0.5">ID: {product._id.slice(-6).toUpperCase()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="font-medium bg-gray-50/50">
                                                {typeof product.category === 'object' && product.category !== null
                                                    ? product.category.name
                                                    : product.category}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="secondary" className="font-medium bg-blue-50/50 text-blue-700 border-blue-100">
                                                {typeof product.brand === 'object' && product.brand !== null
                                                    ? product.brand.name
                                                    : product.brand || '-'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">${product.price.toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.stock > 0 ? (
                                                <div className="flex flex-col gap-1">
                                                    <Badge className="w-fit bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100 shadow-none">
                                                        In Stock
                                                    </Badge>
                                                    <span className="text-[10px] text-muted-foreground ml-1">{product.stock} units left</span>
                                                </div>
                                            ) : (
                                                <Badge variant="destructive" className="bg-rose-50 text-rose-700 hover:bg-rose-50 border-rose-100 shadow-none">
                                                    Out of Stock
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-blue-50 hover:text-blue-600">
                                                    <Link to={`/admin/products/${product._id}/edit`}>
                                                        <Edit className="size-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(product._id)}
                                                    disabled={isDeleting}
                                                    className="rounded-full hover:bg-rose-50 hover:text-rose-600"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="size-16 rounded-full bg-gray-50 flex items-center justify-center">
                                                <Package className="size-8 text-gray-300" />
                                            </div>
                                            <div className="text-gray-500 font-medium">No products found</div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Bottom-Left Range Text */}
                    <div className="text-sm font-medium text-gray-600">
                        Show {startItem} to {endItem} of {totalItems} products
                    </div>

                    {/* Bottom-Right Pagination Controls */}
                    {data && (
                        <Pagination
                            currentPage={page}
                            totalPages={data.totalPages || Math.ceil(totalItems / limit)}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ProductList;
