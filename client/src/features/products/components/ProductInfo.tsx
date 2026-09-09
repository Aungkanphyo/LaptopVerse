import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/features/cart/cartSlice";
import { useAppDispatch } from "@/hooks/redux.hooks";
import type { IProduct } from "@/types/product.types";
import { formatPrice } from "@/utils/formatCurrency";
import { Cpu, HardDrive, MemoryStick, Monitor, ShieldCheck, ShoppingCart, Star, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const ProductInfo = ({ product }: { product: IProduct }) => {
    const [qty, setQty] = useState(1);
    const dispatch = useAppDispatch();

    const brandName = typeof product.brand === 'object' && product.brand !== null
        ? product.brand.name
        : (product.brand || '');

    const addToCartHandler = () => {
        dispatch(addToCart({ ...product, qty }));

        toast.success("Added to cart successfully", {
            description: `${product.name} (${qty} items)`,
            duration: 3000,
        });
    };

    return (
        <div className="flex flex-col gap-6 text-slate-100">
            {/* Brand Name, Title & Rating Section */}
            <div>
                <h4 className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-2">
                    {brandName || 'Laptop'}
                </h4>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                    {product.name}
                </h1>

                <div className="flex items-center gap-4 mt-3">
                    {/* Dark Styled Rating Badge */}
                    <div className="flex items-center gap-1.5 bg-slate-900/90 text-amber-400 px-2.5 py-1 rounded-lg border border-slate-800 text-xs font-bold shadow-sm">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        <span>{product.ratings ? product.ratings.toFixed(1) : '0.0'}</span>
                    </div>
                    <span className="text-slate-400 text-xs font-medium">
                        {product.numOfReviews || 0} Reviews
                    </span>
                </div>
            </div>

            {/* Price & Neon Stock Badge Section */}
            <div className="space-y-3">
                <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {formatPrice(product.price)}
                </p>
                <div>
                    <Badge
                        variant="outline"
                        className={`text-xs font-semibold px-3 py-1 rounded-lg border uppercase tracking-wider ${product.stock > 0
                                ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-[0_0_10px_rgba(79,70,229,0.2)]"
                                : "bg-rose-500/20 text-rose-400 border-rose-500/40"
                            }`}
                    >
                        {product.stock > 0 ? `IN STOCK (${product.stock} UNITS LEFT)` : "OUT OF STOCK"}
                    </Badge>
                </div>
            </div>

            {/* Product Description */}
            <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                {product.description || "No description available for this laptop."}
            </p>

            {/* Quantity Selector (Dark Dropdown Input) */}
            <div className="flex items-center gap-4">
                <span className="font-semibold text-xs text-slate-300">Quantity:</span>
                <select
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    disabled={product.stock <= 0}
                    className="bg-[#070913] border border-slate-800 text-white text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer transition-all disabled:opacity-50"
                >
                    {product.stock > 0 ? (
                        [...Array(product.stock).keys()].map((x) => (
                            <option key={x + 1} value={x + 1} className="bg-[#0e1322] text-white">
                                {x + 1}
                            </option>
                        ))
                    ) : (
                        <option value={0} className="bg-[#0e1322] text-white">0</option>
                    )}
                </select>
            </div>

            {/* Add to Cart CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button
                    onClick={addToCartHandler}
                    size="lg"
                    disabled={product.stock <= 0}
                    className="flex-1 gap-2 h-12 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] border-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ShoppingCart className="size-4" /> Add to Cart
                </Button>
            </div>

            {/* Warranty & Shipping Info */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                    <span>1 Year Warranty</span>
                </div>
                <div className="flex items-center gap-2">
                    <Truck className="size-4 text-indigo-400 shrink-0" />
                    <span>Free Shipping</span>
                </div>
            </div>

            {/* Hardware Specs Panel */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#0e1322] border border-slate-800/80 text-xs mt-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#070913] border border-slate-800 text-indigo-400 shrink-0">
                        <Cpu className="size-4" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Processor</p>
                        <p className="font-bold text-white truncate">{product.processor || 'N/A'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#070913] border border-slate-800 text-indigo-400 shrink-0">
                        <MemoryStick className="size-4" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Memory</p>
                        <p className="font-bold text-white truncate">{product.ram || 'N/A'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#070913] border border-slate-800 text-indigo-400 shrink-0">
                        <HardDrive className="size-4" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Storage</p>
                        <p className="font-bold text-white truncate">{product.storage || 'N/A'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#070913] border border-slate-800 text-indigo-400 shrink-0">
                        <Monitor className="size-4" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Display</p>
                        <p className="font-bold text-white truncate">{product.screenSize ? `${product.screenSize}" Display` : 'N/A'}</p>
                    </div>
                </div>
            </div>

        </div>
    )
}