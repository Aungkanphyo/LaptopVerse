import { useNavigate, useParams } from "react-router-dom"
import { useGetSingleProductQuery } from "../productApiSlice";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductInfo } from "../components/ProductInfo";
import SpecGrid from "../components/SpecGrid";
import ImageGallery from "../components/ImageGallery";
import ProductReviews from "../components/ProductReviews";


const ProductDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data, isLoading, isError } = useGetSingleProductQuery(id || '');

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="animate-spin size-10 text-blue-500" />
            </div>
        );
    }

    if (isError || !data?.product) {
        return (
            <div className="container py-20 text-center">
                <h2 className="text-2xl font-bold">Product not found.</h2>
                <Button onClick={() => navigate("/")} variant="link">Return Home</Button>
            </div>
        );
    }

    const { product } = data;
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Button
                variant="ghost"
                className="mb-6 gap-2 hover:bg-gray-100"
                onClick={() => navigate(-1)}
            >
                <ChevronLeft className="size-4" /> Back to explore
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Left Side: Image Display */}
                <div className="lg:sticky lg:top-24 h-auto lg:h-[calc(100vh-6rem)] overflow-y-auto">
                    <ImageGallery images={product.images} />
                </div>

                {/* Right Side: Content */}
                <div className="space-y-8">
                    <ProductInfo product={product} />
                    <SpecGrid product={product} />
                </div>
            </div>

            <ProductReviews product={product}/>
        </div>
    )
}

export default ProductDetails
