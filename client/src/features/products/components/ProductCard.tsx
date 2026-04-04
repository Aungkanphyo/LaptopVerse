import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { IProduct } from "@/types/product.types"
import { Link } from "react-router-dom";

interface ProductCardProps {
    product: IProduct;
};

const ProductCard = ({ product }: ProductCardProps) => {
    const fallbackImage = 'https://via.placeholder.com/300x200?text=No+Image';
    const displayImage = product.images && product.images.length > 0 ? product.images[0].url : fallbackImage;

    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(product.price);

    return (
        <Card className="group flex flex-col justify-between overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
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
                    <span className="text-sm font-semibold text-gray-900">
                        ⭐ {product.ratings ? product.ratings.toFixed(1) : 'N/A'}
                    </span>
                </div>
                <CardTitle className="line-clamp-2 text-base leading-snug">
                    <Link to={`/products/${product._id}`} className="hover:text-blue-600 transition-colors">
                        {product.name}
                    </Link>
                </CardTitle>
            </CardHeader>

            <CardContent className="p-4 pt-0 grow">
                <ul className="text-xs text-gray-600 space-y-1 mb-3">
                    <li className="flex items-center gap-1">
                        <span className="font-medium text-gray-900">CPU:</span> {product.processor}
                    </li>
                    <li className="flex items-center gap-1">
                        <span className="font-medium text-gray-900">RAM:</span> {product.ram}
                    </li>
                    <li className="flex items-center gap-1">
                        <span className="font-medium text-gray-900">Storage:</span> {product.storage}
                    </li>
                </ul>
                <div className="text-lg font-bold text-gray-900">
                    {formattedPrice}
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => console.log('Add to compare:', product._id)}
                >
                    ➕ Compare
                </Button>
                <Button 
                    variant="default"
                    size="sm"
                    className="w-full text-xs"
                    disabled={product.stock <= 0}
                    onClick={() => console.log('Add to cart:', product._id)}
                >
                    🛒 Cart
                </Button>
            </CardFooter>
        </Card>
    )
}

export default ProductCard
