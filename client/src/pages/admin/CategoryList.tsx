import { useState, useMemo } from 'react';
import { 
    useGetCategoriesQuery, 
    useToggleCategoryStatusMutation 
} from '@/features/products/productApiSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Plus, Search, Tags, CheckCircle2, XCircle, Power, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AddCategoryModal } from '@/features/products/components/AddCategoryModal';
import { EditCategoryModal } from '@/features/products/components/EditCategoryModal';
import type { ICategoryItem } from '@/types/product.types';

const CategoryList = () => {
    const [keyword, setKeyword] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ICategoryItem | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const { data, isLoading, isFetching } = useGetCategoriesQuery();
    const [toggleStatus] = useToggleCategoryStatusMutation();

    const categories = useMemo(() => data?.categories || [], [data?.categories]);

    // Search Filtering Optimization
    const filteredCategories = useMemo(() => {
        const query = keyword.trim().toLowerCase();
        if (!query) return categories;
        return categories.filter((c) => c.name.toLowerCase().includes(query));
    }, [categories, keyword]);

    // Stats Calculation Optimization
    const stats = useMemo(() => [
        { 
            label: 'Total Categories', 
            value: categories.length, 
            icon: Tags, 
            color: 'text-blue-600', 
            bg: 'bg-blue-50' 
        },
        { 
            label: 'Active', 
            value: categories.filter(c => c.isActive).length, 
            icon: CheckCircle2, 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-50' 
        },
        { 
            label: 'Inactive', 
            value: categories.filter(c => !c.isActive).length, 
            icon: XCircle, 
            color: 'text-rose-600', 
            bg: 'bg-rose-50' 
        },
    ], [categories]);

    const handleToggle = async (id: string) => {
        try {
            setTogglingId(id);
            const res = await toggleStatus(id).unwrap();
            toast.success(`Category ${res.category.isActive ? 'activated' : 'deactivated'} successfully`);
        } catch (error: unknown) {
            const err = error as { data?: { message?: string } };
            toast.error(err?.data?.message || 'Failed to update status');
        } finally {
            setTogglingId(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Categories</h1>
                    <p className="text-muted-foreground mt-1">Organize products into active catalog categories.</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} className="rounded-full px-6">
                    <Plus className="size-4 mr-2" />
                    Add New Category
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

            {/* Main Table Card */}
            <Card className="border-none shadow-sm overflow-hidden bg-white">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <Input
                            placeholder="Search categories..."
                            className="pl-9 rounded-full bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Showing {filteredCategories.length} of {categories.length} categories
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-xs uppercase tracking-wider text-muted-foreground font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Category Name</th>
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
                            ) : filteredCategories.length > 0 ? (
                                filteredCategories.map((category) => (
                                    <tr key={category._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 font-semibold text-gray-900">{category.name}</td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground max-w-md truncate">
                                            {category.description || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {category.isActive ? (
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
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => setEditingCategory(category)}
                                                    className="rounded-full hover:bg-blue-50 hover:text-blue-600"
                                                    title="Edit Category"
                                                >
                                                    <Edit className="size-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleToggle(category._id)}
                                                    disabled={togglingId === category._id}
                                                    className={`rounded-full ${
                                                        category.isActive 
                                                            ? 'hover:bg-rose-50 hover:text-rose-600' 
                                                            : 'hover:bg-emerald-50 hover:text-emerald-600'
                                                    }`}
                                                    title={category.isActive ? 'Deactivate Category' : 'Activate Category'}
                                                >
                                                    {togglingId === category._id ? (
                                                        <Loader2 className="size-4 animate-spin text-gray-400" />
                                                    ) : (
                                                        <Power className="size-4" />
                                                    )}
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
                                                <Tags className="size-8 text-gray-300" />
                                            </div>
                                            <div className="text-gray-500 font-medium">No categories found</div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <AddCategoryModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
            <EditCategoryModal isOpen={!!editingCategory} category={editingCategory} onClose={() => setEditingCategory(null)} />
        </div>
    );
};

export default CategoryList;