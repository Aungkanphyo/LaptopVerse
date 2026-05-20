import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { X, Upload, Loader2, Plus } from 'lucide-react';
import type { IProduct } from '@/types/product.types';

interface ProductFormProps {
    initialData?: IProduct;
    onSubmit: (formData: FormData) => Promise<void>;
    isLoading: boolean;
}

interface FormValues {
    name: string;
    description: string;
    price: number;
    category: string;
    brand: string;
    stock: number;
    processor: string;
    ram: string;
    storage: string;
    screenSize: number;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, isLoading }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
        defaultValues: initialData ? {
            name: initialData.name,
            description: initialData.description,
            price: initialData.price,
            category: initialData.category,
            brand: initialData.brand,
            stock: initialData.stock,
            processor: initialData.processor,
            ram: initialData.ram,
            storage: initialData.storage,
            screenSize: initialData.screenSize,
        } : undefined
    });

    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<{ public_id: string; url: string }[]>(initialData?.images || []);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + images.length + existingImages.length > 5) {
            alert('You can only upload up to 5 images in total.');
            return;
        }

        setImages((prev) => [...prev, ...files]);

        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setImagePreviews((prev) => [...prev, ...newPreviews]);
    };

    const removeNewImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        URL.revokeObjectURL(imagePreviews[index]);
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (public_id: string) => {
        setExistingImages((prev) => prev.filter((img) => img.public_id !== public_id));
        setImagesToDelete((prev) => [...prev, public_id]);
    };

    const onFormSubmit = async (data: FormValues) => {
        const formData = new FormData();
        
        // Append basic fields
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value.toString());
        });

        // Append new images
        images.forEach((image) => {
            formData.append('images', image);
        });

        // Append images to delete (for update)
        if (imagesToDelete.length > 0) {
            imagesToDelete.forEach((id) => {
                formData.append('imagesToDelete', id);
            });
        }

        await onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Information */}
                <Card className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
                    
                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input 
                            id="name" 
                            {...register('name', { required: 'Name is required' })} 
                            placeholder="e.g. MacBook Pro 14-inch"
                        />
                        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="brand">Brand</Label>
                            <Input id="brand" {...register('brand', { required: 'Brand is required' })} placeholder="Apple" />
                            {errors.brand && <p className="text-xs text-red-500">{errors.brand.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Input id="category" {...register('category', { required: 'Category is required' })} placeholder="Professional" />
                            {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price ($)</Label>
                            <Input 
                                id="price" 
                                type="number" 
                                step="0.01" 
                                {...register('price', { required: 'Price is required', min: 0 })} 
                            />
                            {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stock">Stock</Label>
                            <Input 
                                id="stock" 
                                type="number" 
                                {...register('stock', { required: 'Stock is required', min: 0 })} 
                            />
                            {errors.stock && <p className="text-xs text-red-500">{errors.stock.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                            id="description" 
                            rows={5} 
                            {...register('description', { required: 'Description is required' })} 
                            placeholder="Detailed product description..."
                        />
                        {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                    </div>
                </Card>

                {/* Technical Specifications */}
                <Card className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Technical Specifications</h3>
                    
                    <div className="space-y-2">
                        <Label htmlFor="processor">Processor</Label>
                        <Input id="processor" {...register('processor', { required: 'Processor is required' })} placeholder="M3 Pro, 11-core CPU" />
                        {errors.processor && <p className="text-xs text-red-500">{errors.processor.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="ram">RAM</Label>
                            <Input id="ram" {...register('ram', { required: 'RAM is required' })} placeholder="18GB" />
                            {errors.ram && <p className="text-xs text-red-500">{errors.ram.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="storage">Storage</Label>
                            <Input id="storage" {...register('storage', { required: 'Storage is required' })} placeholder="512GB SSD" />
                            {errors.storage && <p className="text-xs text-red-500">{errors.storage.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="screenSize">Screen Size (inches)</Label>
                        <Input 
                            id="screenSize" 
                            type="number" 
                            step="0.1" 
                            {...register('screenSize', { required: 'Screen size is required', min: 0 })} 
                        />
                        {errors.screenSize && <p className="text-xs text-red-500">{errors.screenSize.message}</p>}
                    </div>

                    {/* Image Upload Area */}
                    <div className="space-y-4 pt-4">
                        <Label>Product Images (Max 5)</Label>
                        <div className="grid grid-cols-5 gap-2">
                            {/* Existing Images */}
                            {existingImages.map((img) => (
                                <div key={img.public_id} className="relative aspect-square rounded border overflow-hidden group">
                                    <img src={img.url} alt="Preview" className="size-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(img.public_id)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="size-3" />
                                    </button>
                                </div>
                            ))}
                            
                            {/* New Image Previews */}
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="relative aspect-square rounded border overflow-hidden group">
                                    <img src={preview} alt="Preview" className="size-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="size-3" />
                                    </button>
                                </div>
                            ))}

                            {/* Upload Button */}
                            {existingImages.length + images.length < 5 && (
                                <label className="relative aspect-square rounded border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-blue-500">
                                    <Upload className="size-5" />
                                    <span className="text-[10px] font-medium">Upload</span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-400">Recommended size: 1000x1000px. JPG, PNG or WEBP.</p>
                    </div>
                </Card>
            </div>

            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => window.history.back()} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                    {isLoading ? (
                        <>
                            <Loader2 className="size-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Plus className="size-4 mr-2" />
                            {initialData ? 'Update Product' : 'Create Product'}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
};

export default ProductForm;
