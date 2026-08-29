import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Check, Plus } from 'lucide-react';
import { Card } from "@/components/ui/card";
import type { IProduct } from "@/types/product.types"
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/redux.hooks";
import { addToCompare, removeFromCompare } from "@/features/compare/compareSlice";

interface ProductCardProps {
    product: IProduct;
};

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const ProductCard = ({ product }: ProductCardProps) => {
    const dispatch = useAppDispatch();
    const { compareItems } = useAppSelector((state) => state.compare);
    const isCompared = compareItems.some((item) => item._id === product._id);

    const handleCompareToggle = () => {
        if (isCompared) {
            dispatch(removeFromCompare(product._id));
        } else {
            if (compareItems.length >= 2) {
                alert('A maximum of 2 laptops can compete at the same time.');
                return;
            }
            dispatch(addToCompare(product));
        }
    };

    const fallbackImage = 'https://via.placeholder.com/300x200?text=No+Image';
    const displayImage = product.images && product.images.length > 0 ? product.images[0].url : fallbackImage;

    const categoryName = typeof product.category === 'object' && product.category !== null
        ? product.category.name
        : (typeof product.brand === 'object' && product.brand !== null ? product.brand.name : 'Laptop');

    return (
        <Card className="group flex flex-col justify-between overflow-hidden border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg rounded-3xl">

            {/* Image & Top Badge Wrapper */}
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-gray-50 mb-4">
                {/* Top-Left Pill Badge */}
                <div className="absolute left-3 top-3 z-10">
                    <Badge variant="secondary" className="bg-slate-100/90 backdrop-blur-md text-slate-700 font-medium px-3 py-1 rounded-xl text-xs border border-gray-200/50 shadow-sm">
                        {categoryName}
                    </Badge>
                </div>

                <img
                    src={displayImage}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />
            </div>

            {/* Title and Rating Section */}
            <div className="px-1 mb-3">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight line-clamp-1 mb-1">
                    <Link to={`/products/${product._id}`} className="hover:text-blue-600 transition-colors">
                        {product.name}
                    </Link>
                </h3>

                {/* Single Rating Star & Score */}
                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                    <Star className="size-4 text-amber-400 fill-amber-400" />
                    <span>{product.ratings ? product.ratings.toFixed(1) : '0.0'}</span>
                </div>
            </div>

            {/* Specifications Box Container */}
            <div className="bg-slate-50/80 rounded-2xl p-4 space-y-1.5 mb-1 text-sm">
                <div className="truncate">
                    <span className="font-bold text-slate-900">CPU: </span>
                    <span className="text-slate-600">{product.processor}</span>
                </div>
                <div className="truncate">
                    <span className="font-bold text-slate-900">RAM: </span>
                    <span className="text-slate-600">{product.ram}</span>
                </div>
                <div className="truncate">
                    <span className="font-bold text-slate-900">Storage: </span>
                    <span className="text-slate-600">{product.storage}</span>
                </div>
            </div>

            {/* Divider Line */}
            <div className="border-t border-gray-400 mb-4" />

            {/* Price & Action Button Footer */}
            <div className="flex flex-col gap-3 px-1">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">Price</span>
                    <span className="text-xl font-extrabold text-blue-600 tracking-tight">
                        {formatter.format(product.price)}
                    </span>
                </div>

                <Button
                    variant="default"
                    size="sm"
                    className={`w-full rounded-full py-2.5 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 ${
                        isCompared 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : 'bg-[#0B132B] hover:bg-slate-800 text-white'
                    }`}
                    onClick={handleCompareToggle}
                >
                    {isCompared ? (
                        <>
                            <Check className="size-3.5" />
                            <span>Compared</span>
                        </>
                    ) : (
                        <>
                            <Plus className="size-3.5" />
                            <span>Compare</span>
                        </>
                    )}
                </Button>
            </div>
        </Card>
    )
}

export default ProductCard
