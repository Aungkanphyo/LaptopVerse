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
            color: 'text-blue-400',
            bg: 'bg-blue-500/10 border-blue-500/20'
        },
        {
            label: 'In Stock',
            value: statsData?.stats?.inStock || 0,
            icon: CheckCircle2,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10 border-emerald-500/20'
        },
        {
            label: 'Out of Stock',
            value: statsData?.stats?.outOfStock || 0,
            icon: AlertTriangle,
            color: 'text-rose-400',
            bg: 'bg-rose-500/10 border-rose-500/20'
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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white">Products</h1>
                    <p className="text-slate-400 mt-1 text-sm">Manage your catalog, inventory and product information.</p>
                </div>
                <Button asChild className="rounded-full px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-[0_0_15px_rgba(37,99,235,0.35)] transition-all cursor-pointer">
                    <Link to="/admin/products/new">
                        <Plus className="size-4 mr-2" />
                        Add New Product
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, idx) => (
                    <Card key={idx} className="border border-slate-800/80 bg-[#0e1322] shadow-xl overflow-hidden rounded-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className={`size-12 rounded-2xl ${stat.bg} border flex items-center justify-center`}>
                                    <stat.icon className={`size-6 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                    <h3 className="text-2xl font-black text-white mt-0.5">{stat.value}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table Container Card */}
            <Card className="border border-slate-800/80 shadow-2xl overflow-hidden bg-[#0e1322] rounded-3xl">
                <div className="p-6 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Search Input Box */}
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                        <Input
                            placeholder="Search by name or category..."
                            className="pl-10 h-11 rounded-full bg-[#070913] border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                            value={keyword}
                            onChange={handleSearch}
                        />
                    </div>
                    {/* Show Limit Select */}
                    <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                        <span>Show</span>
                        <select
                            value={limit}
                            onChange={handleLimitChange}
                            className="h-10 rounded-xl border border-slate-800 bg-[#070913] px-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
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
                        <thead className="bg-[#070913]/60 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800/80">
                            <tr>
                                <th className="px-6 py-4">Product Details</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Brand</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Stock Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {isLoading || isFetching ? (
                                Array.from({ length: limit }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-12 rounded-xl bg-slate-800/60"></div>
                                                <div className="h-4 bg-slate-800/60 rounded w-48"></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-800/60 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-800/60 rounded w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-800/60 rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-800/60 rounded w-20"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-8 bg-slate-800/60 rounded w-20 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : data?.products && data.products.length > 0 ? (
                                data.products.map((product) => (
                                    <tr key={product._id} className="hover:bg-slate-800/40 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {/* Product Image Box */}
                                                <div className="size-12 rounded-xl border border-slate-800 overflow-hidden shrink-0 bg-[#070913] flex items-center justify-center p-1">
                                                    {product.images?.[0] ? (
                                                        <img src={product.images[0].url} alt={product.name} className="size-full object-contain" />
                                                    ) : (
                                                        <Package className="size-5 text-slate-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white line-clamp-1 group-hover:text-blue-400 transition-colors">{product.name}</div>
                                                    <div className="text-xs font-mono text-slate-500 mt-0.5">ID: {product._id.slice(-6).toUpperCase()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="font-semibold bg-slate-800/80 text-slate-300 border-slate-700/80">
                                                {typeof product.category === 'object' && product.category !== null
                                                    ? product.category.name
                                                    : product.category}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="secondary" className="font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                                                {typeof product.brand === 'object' && product.brand !== null
                                                    ? product.brand.name
                                                    : product.brand || '-'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-black text-white">${product.price.toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.stock > 0 ? (
                                                <div className="flex flex-col gap-1">
                                                    <Badge className="w-fit bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-none font-semibold">
                                                        In Stock
                                                    </Badge>
                                                    <span className="text-[10px] text-slate-500 font-medium ml-1">{product.stock} units left</span>
                                                </div>
                                            ) : (
                                                <Badge variant="destructive" className="bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-none font-semibold">
                                                    Out of Stock
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" asChild className="rounded-xl text-slate-400 hover:bg-blue-500/10 hover:text-blue-400">
                                                    <Link to={`/admin/products/${product._id}/edit`}>
                                                        <Edit className="size-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(product._id)}
                                                    disabled={isDeleting}
                                                    className="rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400"
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
                                            <div className="size-16 rounded-2xl bg-slate-800/50 border border-slate-800 flex items-center justify-center">
                                                <Package className="size-8 text-slate-600" />
                                            </div>
                                            <div className="text-slate-400 font-semibold">No products found</div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Pagination */}
                <div className="p-6 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-sm font-semibold text-slate-400">
                        Show {startItem} to {endItem} of {totalItems} products
                    </div>

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
