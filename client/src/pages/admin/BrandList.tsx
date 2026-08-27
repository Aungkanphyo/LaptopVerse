import { useState, useMemo } from 'react';
import { 
    useGetBrandsQuery, 
    useToggleBrandStatusMutation 
} from '@/features/products/productApiSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Plus, Search, Bookmark, CheckCircle2, XCircle, Power } from 'lucide-react';
import { toast } from 'sonner';
import { AddBrandModal } from '@/features/products/components/AddBrandModal';
import { EditBrandModal } from '@/features/products/components/EditBrandModal';
import type { IBrandItem } from '@/types/product.types';

const BrandList = () => {
    const [keyword, setKeyword] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<IBrandItem | null>(null);

    const { data, isLoading, isFetching } = useGetBrandsQuery();
    const [toggleStatus, { isLoading: isToggling }] = useToggleBrandStatusMutation();

    // Data Memoization
    const brands = useMemo(() => data?.brands || [], [data]);

    const filteredBrands = useMemo(() => {
        return brands.filter((b) => 
            b.name?.toLowerCase().includes(keyword.toLowerCase())
        );
    }, [brands, keyword]);

    // Stats Calculation Memoization
    const stats = useMemo(() => [
        { 
            label: 'Total Brands', 
            value: brands.length, 
            icon: Bookmark, 
            color: 'text-blue-600', 
            bg: 'bg-blue-50' 
        },
        { 
            label: 'Active', 
            value: brands.filter(b => b.isActive).length, 
            icon: CheckCircle2, 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-50' 
        },
        { 
            label: 'Inactive', 
            value: brands.filter(b => !b.isActive).length, 
            icon: XCircle, 
            color: 'text-rose-600', 
            bg: 'bg-rose-50' 
        },
    ], [brands]);

    const handleToggle = async (id: string) => {
        try {
            const res = await toggleStatus(id).unwrap();
            toast.success(`Brand ${res.brand.isActive ? 'activated' : 'deactivated'} successfully`);
        } catch (error: unknown) {
            const err = error as { data?: { message?: string } };
            toast.error(err?.data?.message || 'Failed to update status');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Brands</h1>
                    <p className="text-muted-foreground mt-1">Manage brand labels and active store listings.</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} className="rounded-full px-6">
                    <Plus className="size-4 mr-2" />
                    Add New Brand
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
                            placeholder="Search brands..."
                            className="pl-9 rounded-full bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Showing {filteredBrands.length} of {brands.length} brands
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-xs uppercase tracking-wider text-muted-foreground font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Brand Name</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading || isFetching ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-48"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-100 rounded w-20 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredBrands.length > 0 ? (
                                filteredBrands.map((brand) => (
                                    <tr key={brand._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 font-semibold text-gray-900">{brand.name}</td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground max-w-md truncate">
                                            {brand.description || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {brand.isActive ? (
                                                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100 shadow-none">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive" className="bg-rose-50 text-rose-700 hover:bg-rose-50 border-rose-100 shadow-none">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => setEditingBrand(brand)}
                                                    className="rounded-full hover:bg-blue-50 hover:text-blue-600"
                                                >
                                                    <Edit className="size-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleToggle(brand._id)}
                                                    disabled={isToggling}
                                                    className={`rounded-full ${
                                                        brand.isActive 
                                                            ? 'hover:bg-rose-50 hover:text-rose-600' 
                                                            : 'hover:bg-emerald-50 hover:text-emerald-600'
                                                    }`}
                                                >
                                                    <Power className="size-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="size-16 rounded-full bg-gray-50 flex items-center justify-center">
                                                <Bookmark className="size-8 text-gray-300" />
                                            </div>
                                            <div className="text-gray-500 font-medium">No brands found</div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <AddBrandModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
            <EditBrandModal isOpen={!!editingBrand} brand={editingBrand} onClose={() => setEditingBrand(null)} />
        </div>
    );
};

export default BrandList;