import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { X, Upload, Loader2 } from 'lucide-react';
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Basic Information */}
                <Card className="lg:col-span-2 border-none shadow-sm p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 tracking-tight">Basic Information</h3>
                        <p className="text-sm text-muted-foreground">General details about the product.</p>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold">Product Name</Label>
                        <Input 
                            id="name" 
                            {...register('name', { required: 'Name is required' })} 
                            placeholder="e.g. MacBook Pro 14-inch"
                            className="rounded-xl border-gray-100 bg-gray-50/30 focus-visible:ring-primary/20"
                        />
                        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="brand" className="text-sm font-semibold">Brand</Label>
                            <Input 
                                id="brand" 
                                {...register('brand', { required: 'Brand is required' })} 
                                placeholder="Apple" 
                                className="rounded-xl border-gray-100 bg-gray-50/30 focus-visible:ring-primary/20"
                            />
                            {errors.brand && <p className="text-xs text-red-500">{errors.brand.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-sm font-semibold">Category</Label>
                            <Input 
                                id="category" 
                                {...register('category', { required: 'Category is required' })} 
                                placeholder="Professional" 
                                className="rounded-xl border-gray-100 bg-gray-50/30 focus-visible:ring-primary/20"
                            />
                            {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-sm font-semibold">Price ($)</Label>
                            <Input 
                                id="price" 
                                type="number" 
                                step="0.01" 
                                {...register('price', { required: 'Price is required', min: 0 })} 
                                className="rounded-xl border-gray-100 bg-gray-50/30 focus-visible:ring-primary/20"
                            />
                            {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stock" className="text-sm font-semibold">Stock Quantity</Label>
                            <Input 
                                id="stock" 
                                type="number" 
                                {...register('stock', { required: 'Stock is required', min: 0 })} 
                                className="rounded-xl border-gray-100 bg-gray-50/30 focus-visible:ring-primary/20"
                            />
                            {errors.stock && <p className="text-xs text-red-500">{errors.stock.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                        <Textarea 
                            id="description" 
                            rows={6} 
                            {...register('description', { required: 'Description is required' })} 
                            placeholder="Detailed product description..."
                            className="rounded-2xl border-gray-100 bg-gray-50/30 focus-visible:ring-primary/20 resize-none"
                        />
                        {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                    </div>
                </Card>

                {/* Sidebar of the form: Specs and Images */}
                <div className="space-y-8">
                    {/* Technical Specifications */}
                    <Card className="border-none shadow-sm p-6 space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Specifications</h3>
                            <p className="text-sm text-muted-foreground">Technical hardware details.</p>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="processor" className="text-sm font-semibold">Processor</Label>
                            <Input 
                                id="processor" 
                                {...register('processor', { required: 'Processor is required' })} 
                                placeholder="M3 Pro, 11-core CPU" 
                                className="rounded-xl border-gray-100 bg-gray-50/30 focus-visible:ring-primary/20"
                            />
                            {errors.processor && <p className="text-xs text-red-500">{errors.processor.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="ram" className="text-sm font-semibold">RAM</Label>
                                <Input 
                                    id="ram" 
                                    {...register('ram', { required: 'RAM is required' })} 
                                    placeholder="18GB" 
                                    className="rounded-xl border-gray-100 bg-gray-50/30 focus-visible:ring-primary/20"
                                />
                                {errors.ram && <p className="text-xs text-red-500">{errors.ram.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="storage" className="text-sm font-semibold">Storage</Label>
                                <Input 
                                    id="storage" 
                                    {...register('storage', { required: 'Storage is required' })} 
                                    placeholder="512GB SSD" 
                                    className="rounded-xl border-gray-100 bg-gray-50/30 focus-visible:ring-primary/20"
                                />
                                {errors.storage && <p className="text-xs text-red-500">{errors.storage.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="screenSize" className="text-sm font-semibold">Screen Size (inches)</Label>
                            <Input 
                                id="screenSize" 
                                type="number" 
                                step="0.1" 
                                {...register('screenSize', { required: 'Screen size is required', min: 0 })} 
                                className="rounded-xl border-gray-100 bg-gray-50/30 focus-visible:ring-primary/20"
                            />
                            {errors.screenSize && <p className="text-xs text-red-500">{errors.screenSize.message}</p>}
                        </div>
                    </Card>

                    {/* Image Upload Area */}
                    <Card className="border-none shadow-sm p-6 space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Images</h3>
                            <p className="text-sm text-muted-foreground">Up to 5 product photos.</p>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {/* Existing Images */}
                            {existingImages.map((img) => (
                                <div key={img.public_id} className="relative aspect-square rounded-xl border border-gray-100 overflow-hidden group">
                                    <img src={img.url} alt="Preview" className="size-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(img.public_id)}
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="size-5 text-white" />
                                    </button>
                                </div>
                            ))}
                            
                            {/* New Image Previews */}
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="relative aspect-square rounded-xl border border-gray-100 overflow-hidden group">
                                    <img src={preview} alt="Preview" className="size-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(index)}
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="size-5 text-white" />
                                    </button>
                                </div>
                            ))}

                            {/* Upload Button */}
                            {existingImages.length + images.length < 5 && (
                                <label className="relative aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-primary">
                                    <Upload className="size-6" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Add</span>
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
                        <p className="text-[10px] text-muted-foreground text-center">JPG, PNG or WEBP. Max 5 images.</p>
                    </Card>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
                <Button type="button" variant="ghost" onClick={() => window.history.back()} disabled={isLoading} className="rounded-full px-8">
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="rounded-full px-10 min-w-40 shadow-md shadow-primary/20">
                    {isLoading ? (
                        <>
                            <Loader2 className="size-4 mr-2 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            {initialData ? 'Save Changes' : 'List Product'}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
};

export default ProductForm;