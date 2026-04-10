import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cpu, MemoryStick, HardDrive, Star, ShoppingCart, GitCompare } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { IProduct } from "@/types/product.types"
import { Link } from "react-router-dom";

interface ProductCardProps {
    product: IProduct;
};

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const ProductCard = ({ product }: ProductCardProps) => {
    const fallbackImage = 'https://via.placeholder.com/300x200?text=No+Image';
    const displayImage = product.images && product.images.length > 0 ? product.images[0].url : fallbackImage;

    return (
        <Card className="group flex flex-col justify-between overflow-hidden border-none bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2 rounded-2xl">
            {/* Photos and Badges */}
            <div className="relative aspect-video overflow-hidden bg-gray-100">
                <img
                    src={displayImage}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />
                <div className="absolute left-2 top-2 flex flex-col gap-1">
                    {product.stock > 0 ? (
                        <Badge variant="secondary" className="bg-white/90 text-blue-600 hover:bg-white">
                            In Stock
                        </Badge>
                    ) : (
                        <Badge variant="destructive">
                            Out of Stock
                        </Badge>
                    )}
                </div>
            </div>

            {/* Product info */}
            <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {product.brand}
                    </span>
                    <div className="flex items-center gap-1 text-sm font-bold text-gray-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                        <Star className="size-4 text-amber-500 fill-amber-400" />
                        {product.ratings ? product.ratings.toFixed(1) : '0.0'}
                    </div>
                </div>
                <CardTitle className="line-clamp-2 text-base leading-snug">
                    <Link to={`/products/${product._id}`} className="hover:text-blue-600 transition-colors">
                        {product.name}
                    </Link>
                </CardTitle>
            </CardHeader>

            <CardContent className="p-4 pt-0 grow">
                {/* 👉 Specs များကို Icons များဖြင့် ပိုမိုဆွဲဆောင်မှုရှိအောင် ပြုလုပ်ခြင်း */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg mb-4 border border-gray-100">
                    <div className="flex items-center gap-1.5">
                        <Cpu className="size-3.5 text-blue-500" />
                        <span className="truncate">{product.processor}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MemoryStick className="size-3.5 text-blue-500" />
                        <span>{product.ram}</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                        <HardDrive className="size-3.5 text-blue-500" />
                        <span className="truncate">{product.storage}</span>
                    </div>
                </div>
                
                {/* ဈေးနှုန်း */}
                <div className="text-2xl font-extrabold text-gray-950 tracking-tight">
                    {formatter.format(product.price)}
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => console.log('Add to compare:', product._id)}
                >
                    <GitCompare className="size-3.5" /> Compare
                </Button>
                <Button 
                    variant="default"
                    size="sm"
                    className="w-full text-xs"
                    disabled={product.stock <= 0}
                    onClick={() => console.log('Add to cart:', product._id)}
                >
                    <ShoppingCart className="size-3.5" /> Add to Cart
                </Button>
            </CardFooter>
        </Card>
    )
}

export default ProductCard
