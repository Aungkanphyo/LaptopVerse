import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Check, Cpu, MemoryStick, HardDrive, GitCompare, ShoppingCart } from 'lucide-react';
import { Card } from "@/components/ui/card";
import type { IProduct } from "@/types/product.types"
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/redux.hooks";
import { addToCompare, removeFromCompare } from "@/features/compare/compareSlice";
import { addToCart } from "@/features/cart/cartSlice";
import { toast } from "sonner";

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
    const { cartItems } = useAppSelector((state) => state.cart);
    const isInCart = cartItems.some((item) => item._id === product._id);

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

    const handleAddToCart = () => {
        if (product.stock <= 0) {
            toast.error("Out of stock!");
            return;
        }
        dispatch(addToCart({ ...product, qty: 1 }));
        toast.success("Added to cart successfully", {
            description: `${product.name} (1 item)`,
            duration: 3000,
        });
    };

    const fallbackImage = 'https://via.placeholder.com/300x200?text=No+Image';
    const displayImage = product.images && product.images.length > 0 ? product.images[0].url : fallbackImage;

    const categoryName = typeof product.category === 'object' && product.category !== null
        ? product.category.name
        : (typeof product.brand === 'object' && product.brand !== null ? product.brand.name : 'Laptop');

    return (
        <Card className="group flex flex-col justify-between overflow-hidden border border-slate-800/80 bg-[#0d1222] p-4 shadow-xl transition-all duration-300 hover:border-indigo-500/50 hover:shadow-[0_0_25px_rgba(79,70,229,0.15)] rounded-2xl">

            {/* Image Container */}
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-[#070913] mb-4">
                
                {/* Neon Pill Tag */}
                <div className="absolute left-2.5 top-2.5 z-10">
                    <Badge variant="secondary" className="bg-indigo-600/90 text-white font-semibold px-2.5 py-0.5 rounded-lg text-[10px] backdrop-blur-md shadow-md border border-indigo-400/30">
                        {categoryName}
                    </Badge>
                </div>

                <img
                    src={displayImage}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />
            </div>

            {/* Product Title & Rating */}
            <div className="px-1 mb-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-base font-bold text-white tracking-tight line-clamp-1">
                        <Link to={`/products/${product._id}`} className="hover:text-blue-400 transition-colors">
                            {product.name}
                        </Link>
                    </h3>

                    {/* Rating Badge */}
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-400 shrink-0 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-800">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        <span>{product.ratings ? product.ratings.toFixed(1) : '0.0'}</span>
                    </div>
                </div>
            </div>

            {/* Hardware Specifications Panel */}
            <div className="bg-[#070913] rounded-xl p-3 space-y-1.5 mb-4 text-xs border border-slate-800/60">
                <div className="truncate flex items-center gap-2 text-slate-300">
                    <Cpu className="size-3.5 text-indigo-400 shrink-0" />
                    <span className="text-slate-400">{product.processor}</span>
                </div>
                <div className="truncate flex items-center gap-2 text-slate-300">
                    <MemoryStick className="size-3.5 text-indigo-400 shrink-0" />
                    <span className="text-slate-400">{product.ram}</span>
                </div>
                <div className="truncate flex items-center gap-2 text-slate-300">
                    <HardDrive className="size-3.5 text-indigo-400 shrink-0" />
                    <span className="text-slate-400">{product.storage}</span>
                </div>
            </div>

            {/* Price & Action CTA */}
            <div className="flex flex-col gap-3 px-1">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-500">Price</span>
                    <span className="text-lg font-black text-white tracking-tight">
                        {formatter.format(product.price)}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {/* Compare Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        className={`rounded-xl py-2 px-2 font-bold text-xs transition-all flex items-center justify-center gap-1.5 border-slate-800 cursor-pointer ${
                            isCompared
                                ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40 hover:bg-indigo-600/30'
                                : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white border-slate-700/80'
                        }`}
                        onClick={handleCompareToggle}
                    >
                        {isCompared ? (
                            <>
                                <Check className="size-3.5 text-indigo-400" />
                                <span>Compared</span>
                            </>
                        ) : (
                            <>
                                <GitCompare className="size-3.5 text-slate-400" />
                                <span>Compare</span>
                            </>
                        )}
                    </Button>

                    {/* Add to Cart Button */}
                    <Button
                        variant="default"
                        size="sm"
                        disabled={product.stock <= 0}
                        className={`rounded-xl py-2 px-2 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isInCart
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                        } ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handleAddToCart}
                    >
                        {isInCart ? (
                            <>
                                <Check className="size-3.5" />
                                <span>In Cart</span>
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="size-3.5" />
                                <span>Add Cart</span>
                            </>
                        )}
                    </Button>

                </div>
            </div>
        </Card>
    )
}
export default ProductCard