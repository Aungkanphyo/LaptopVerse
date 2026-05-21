import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/features/cart/cartSlice";
import { useAppDispatch } from "@/hooks/redux.hooks";
import type { IProduct } from "@/types/product.types";
import { ShieldCheck, ShoppingCart, Star, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
});

export const ProductInfo = ({ product }: { product: IProduct }) => {
    const [qty, setQty] = useState(1);
    const dispatch = useAppDispatch();

    const addToCartHandler = () => {
        dispatch(addToCart({ ...product, qty }));

        toast.success("Added to cart successfully", {
            description: `${product.name} (${qty} items)`,
            duration: 3000,
        });
    };
    
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h4 className="text-blue-600 font-semibold uppercase tracking-wider text-sm mb-2">{product.brand}</h4>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{product.name}</h1>
                <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                        <Star className="size-4 fill-amber-400 text-amber-500" />
                        <span className="font-bold text-amber-900">{product.ratings.toFixed(1)}</span>
                    </div>
                    <span className="text-gray-500 text-sm">{product.numOfReviews} Reviews</span>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-4xl font-black text-gray-950">{formatter.format(product.price)}</p>
                <Badge variant={product.stock > 0 ? "secondary" : "destructive"} className="text-sm">
                    {product.stock > 0 ? `In Stock (${product.stock} units left)` : "Out of Stock"}
                </Badge>
            </div>

            <p className="text-gray-600 leading-relaxed max-w-xl">{product.description}</p>

            <div className="flex items-center gap-4 mb-6">
                <span className="font-semibold">Quantity:</span>
                <select 
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="border rounded p-2"
                >
                    {[...Array(product.stock).keys()].map((x) => (
                        <option key={x+1} value={x+1}>{x+1}</option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
                <Button onClick={addToCartHandler} size="lg" className="flex-1 gap-2 h-14 text-lg shadow-lg shadow-blue-100" disabled={product.stock <= 0}>
                    <ShoppingCart className="size-5" /> Add to Cart
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 text-sm text-gray-500">
                <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" /> 1 Year Warranty</div>
                <div className="flex items-center gap-2"><Truck className="size-4 text-blue-500" /> Free Shipping</div>
            </div>
        </div>
    )
}