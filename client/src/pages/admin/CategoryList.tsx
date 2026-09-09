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

    // Data Memoization
    const categories = useMemo(() => data?.categories || [], [data?.categories]);

    // Search Filtering Optimization
    const filteredCategories = useMemo(() => {
        const query = keyword.trim().toLowerCase();
        if (!query) return categories;
        return categories.filter((c) => 
            c.name?.toLowerCase().includes(query)
        );
    }, [categories, keyword]);

    // Stats Calculation Memoization
    const stats = useMemo(() => [
        { 
            label: 'Total Categories', 
            value: categories.length, 
            icon: Tags, 
            color: 'text-blue-400', 
            bg: 'bg-blue-500/10' 
        },
        { 
            label: 'Active', 
            value: categories.filter(c => c.isActive).length, 
            icon: CheckCircle2, 
            color: 'text-emerald-400', 
            bg: 'bg-emerald-500/10' 
        },
        { 
            label: 'Inactive', 
            value: categories.filter(c => !c.isActive).length, 
            icon: XCircle, 
            color: 'text-rose-400', 
            bg: 'bg-rose-500/10' 
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
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    {/* 🟢 FIXED: Dark background ပေါ်မှာ စာသားမြင်ရအောင် text-white ပြောင်းထားပါသည် */}
                    <h1 className="text-3xl font-bold tracking-tight text-white">Categories</h1>
                    <p className="text-slate-400 mt-1">Organize products into active catalog categories.</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} className="rounded-full px-6 bg-blue-600 hover:bg-blue-500 text-white">
                    <Plus className="size-4 mr-2" />
                    Add New Category
                </Button>
            </div>

            {/* Stats Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, idx) => (
                    /* 🟢 FIXED: Dark surface ရရှိရန် bg-slate-900/80 နှင့် border-slate-800 သုံးထားပါသည် */
                    <Card key={idx} className="border border-slate-800 shadow-sm bg-slate-900/80 overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className={`size-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                                    <stat.icon className={`size-6 ${stat.color}`} />
                                </div>
                                <div>
                                    {/* 🟢 FIXED: Contrast မှန်စေရန် text-slate-400 နှင့် text-white ပြောင်းထားသည် */}
                                    <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                                    <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Table Card */}
            <Card className="border border-slate-800 shadow-sm overflow-hidden bg-slate-900/80">
                <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        {/* 🟢 FIXED: Search Input ကို dark style ပြောင်းထားသည် */}
                        <Input
                            placeholder="Search categories..."
                            className="pl-9 rounded-full bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-blue-500"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>
                    <div className="text-sm text-slate-400">
                        Showing {filteredCategories.length} of {categories.length} categories
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        {/* 🟢 FIXED: Table Header Text မပျောက်စေရန် text-slate-400 ပြောင်းထားပါသည် */}
                        <thead className="bg-slate-800/40 text-xs uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4">Category Name</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {isLoading || isFetching ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-48"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-20"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-8 bg-slate-800 rounded w-20 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredCategories.length > 0 ? (
                                filteredCategories.map((category) => (
                                    <tr key={category._id} className="hover:bg-slate-800/50 transition-colors group">
                                        {/* 🟢 FIXED: Category Name ကို တောက်လျှောက် မြင်သာအောင် text-white သုံးထားသည် */}
                                        <td className="px-6 py-4 font-semibold text-white">{category.name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-400 max-w-md truncate">
                                            {category.description || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {/* 🟢 FIXED: Dark Theme နှင့် ကိုက်ညီသော Badge colors များ */}
                                            {category.isActive ? (
                                                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-none hover:bg-emerald-500/20">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-none hover:bg-rose-500/20">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => setEditingCategory(category)}
                                                    className="rounded-full text-slate-400 hover:bg-slate-800 hover:text-white"
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
                                                            ? 'text-slate-400 hover:bg-rose-500/10 hover:text-rose-400' 
                                                            : 'text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400'
                                                    }`}
                                                    title={category.isActive ? 'Deactivate Category' : 'Activate Category'}
                                                >
                                                    {togglingId === category._id ? (
                                                        <Loader2 className="size-4 animate-spin text-slate-400" />
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
                                            <div className="size-16 rounded-full bg-slate-800/50 flex items-center justify-center">
                                                <Tags className="size-8 text-slate-500" />
                                            </div>
                                            <div className="text-slate-400 font-medium">No categories found</div>
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