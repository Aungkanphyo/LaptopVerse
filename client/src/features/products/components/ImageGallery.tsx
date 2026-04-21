import { cn } from "@/lib/utils";
import type { IProductImage } from "@/types/product.types"
import { useState } from "react"

interface ImageGalleryProps {
    images: IProductImage[]
};

const ImageGallery = ({ images }: ImageGalleryProps) => {
    const [selectedImage, setSelectedImage] = useState(images[0]);

    if (!images || images.length === 0) {
        return (
            <div className="aspect-square bg-gray-100 rounded-3xl flex items-center justify-center">
                <p className="text-gray-400">No images available</p>
            </div>
        );
    }
    return (
        <div className="flex flex-col gap-4">
            {/* Main image Stage */}
            <div className="relative aspect-square bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm group">
                <img src={selectedImage.url} alt="Product stage" className="w-full h-full object-contain p-8 transition-all duration-500 ease-in-out group-hover:scale-110" />
            </div>

            {/* Thumbnail list */}
            <div className="flex flex-wrap gap-3 mt-2">
                {images.map((img, index) => (
                    <button
                        key={img.public_id || index}
                        onClick={() => setSelectedImage(img)}
                        onMouseEnter={() => setSelectedImage(img)}
                        className={cn(
                            "relative size-20 rounded-xl overflow-hidden border-2 transition-all bg-white p-1",
                            selectedImage.public_id === img.public_id
                            ? "border-blue-500 ring-2 ring-blue-100"
                            : "border-gray-100 hover:border-blue-300"
                        )}
                    >
                        <img src={img.url} alt={`Thumbnail ${index}`} className="w-full h-full object-contain" />
                    </button>
                ))}
            </div>
        </div>
    )
}

export default ImageGallery
