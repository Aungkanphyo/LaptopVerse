import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { X, Upload, Loader2, Plus } from 'lucide-react';
import type { IProduct } from '@/types/product.types';
import { useGetBrandsQuery, useGetCategoriesQuery } from '../productApiSlice';
import { AddBrandModal } from './AddBrandModal';
import { AddCategoryModal } from './AddCategoryModal';

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
    // API Hooks for Brands & Categories
    const { data: brandsData } = useGetBrandsQuery();
    const { data: categoriesData } = useGetCategoriesQuery();

    // Separate Modal Visibility States
    const [showBrandModal, setShowBrandModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    const { register, handleSubmit, setValue,formState: { errors } } = useForm<FormValues>({
        defaultValues: initialData ? {
            name: initialData.name,
            description: initialData.description,
            price: initialData.price,
            category: typeof initialData.category === 'object' ? (initialData.category as { _id: string })._id : initialData.category,
            brand: typeof initialData.brand === 'object' ? (initialData.brand as { _id: string })._id : initialData.brand,
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
        <>
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Basic Information Section */}
                    <Card className="lg:col-span-2 bg-slate-900/80 border border-slate-800 shadow-sm p-6 space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-white tracking-tight">Basic Information</h3>
                            <p className="text-sm text-slate-400">General details about the product.</p>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-semibold text-slate-300">Product Name</Label>
                            <Input 
                                id="name" 
                                {...register('name', { required: 'Name is required' })} 
                                placeholder="e.g. MacBook Pro 14-inch"
                                className="rounded-xl border-slate-700 bg-slate-800/60 text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                            />
                            {errors.name && <p className="text-xs text-rose-400">{errors.name.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* BRAND SELECT */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="brand" className="text-sm font-semibold text-slate-300">Brand</Label>
                                    <button
                                        type="button"
                                        onClick={() => setShowBrandModal(true)}
                                        className="text-xs text-blue-400 font-semibold hover:text-blue-300 hover:underline flex items-center gap-0.5 transition-colors"
                                    >
                                        <Plus className="size-3" /> Add New Brand
                                    </button>
                                </div>
                                <select 
                                    id="brand" 
                                    {...register('brand', { required: 'Brand is required' })}
                                    className="w-full h-10 px-3 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                >
                                    <option value="" className="bg-slate-900 text-slate-400">Select Brand</option>
                                    {brandsData?.brands.map((b) => (
                                        <option key={b._id} value={b._id} className="bg-slate-900 text-white">{b.name}</option>
                                    ))}
                                </select>
                                {errors.brand && <p className="text-xs text-rose-400">{errors.brand.message}</p>}
                            </div>

                            {/* CATEGORY SELECT */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="category" className="text-sm font-semibold text-slate-300">Category</Label>
                                    <button
                                        type="button"
                                        onClick={() => setShowCategoryModal(true)}
                                        className="text-xs text-blue-400 font-semibold hover:text-blue-300 hover:underline flex items-center gap-0.5 transition-colors"
                                    >
                                        <Plus className="size-3" /> Add New Category
                                    </button>
                                </div>
                                <select 
                                    id="category" 
                                    {...register('category', { required: 'Category is required' })}
                                    className="w-full h-10 px-3 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                >
                                    <option value="" className="bg-slate-900 text-slate-400">Select Category</option>
                                    {categoriesData?.categories.map((c) => (
                                        <option key={c._id} value={c._id} className="bg-slate-900 text-white">{c.name}</option>
                                    ))}
                                </select>
                                {errors.category && <p className="text-xs text-rose-400">{errors.category.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="price" className="text-sm font-semibold text-slate-300">Price ($)</Label>
                                <Input 
                                    id="price" 
                                    type="number" 
                                    step="0.01" 
                                    {...register('price', { required: 'Price is required', min: 0 })} 
                                    className="rounded-xl border-slate-700 bg-slate-800/60 text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                                />
                                {errors.price && <p className="text-xs text-rose-400">{errors.price.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stock" className="text-sm font-semibold text-slate-300">Stock Quantity</Label>
                                <Input 
                                    id="stock" 
                                    type="number" 
                                    {...register('stock', { required: 'Stock is required', min: 0 })} 
                                    className="rounded-xl border-slate-700 bg-slate-800/60 text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                                />
                                {errors.stock && <p className="text-xs text-rose-400">{errors.stock.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-semibold text-slate-300">Description</Label>
                            <Textarea 
                                id="description" 
                                rows={6} 
                                {...register('description', { required: 'Description is required' })} 
                                placeholder="Detailed product description..."
                                className="rounded-2xl border-slate-700 bg-slate-800/60 text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 resize-none"
                            />
                            {errors.description && <p className="text-xs text-rose-400">{errors.description.message}</p>}
                        </div>
                    </Card>

                    {/* Specifications & Images Side Section */}
                    <div className="space-y-8">
                        {/* Specifications Card */}
                        <Card className="bg-slate-900/80 border border-slate-800 shadow-sm p-6 space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-white tracking-tight">Specifications</h3>
                                <p className="text-sm text-slate-400">Technical hardware details.</p>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="processor" className="text-sm font-semibold text-slate-300">Processor</Label>
                                <Input 
                                    id="processor" 
                                    {...register('processor', { required: 'Processor is required' })} 
                                    placeholder="M3 Pro, 11-core CPU" 
                                    className="rounded-xl border-slate-700 bg-slate-800/60 text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                                />
                                {errors.processor && <p className="text-xs text-rose-400">{errors.processor.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ram" className="text-sm font-semibold text-slate-300">RAM</Label>
                                    <Input 
                                        id="ram" 
                                        {...register('ram', { required: 'RAM is required' })} 
                                        placeholder="18GB" 
                                        className="rounded-xl border-slate-700 bg-slate-800/60 text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                                    />
                                    {errors.ram && <p className="text-xs text-rose-400">{errors.ram.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="storage" className="text-sm font-semibold text-slate-300">Storage</Label>
                                    <Input 
                                        id="storage" 
                                        {...register('storage', { required: 'Storage is required' })} 
                                        placeholder="512GB SSD" 
                                        className="rounded-xl border-slate-700 bg-slate-800/60 text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                                    />
                                    {errors.storage && <p className="text-xs text-rose-400">{errors.storage.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="screenSize" className="text-sm font-semibold text-slate-300">Screen Size (inches)</Label>
                                <Input 
                                    id="screenSize" 
                                    type="number" 
                                    step="0.1" 
                                    {...register('screenSize', { required: 'Screen size is required', min: 0 })} 
                                    className="rounded-xl border-slate-700 bg-slate-800/60 text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                                />
                                {errors.screenSize && <p className="text-xs text-rose-400">{errors.screenSize.message}</p>}
                            </div>
                        </Card>

                        {/* Images Upload Card */}
                        <Card className="bg-slate-900/80 border border-slate-800 shadow-sm p-6 space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-white tracking-tight">Images</h3>
                                <p className="text-sm text-slate-400">Up to 5 product photos.</p>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {existingImages.map((img) => (
                                    <div key={img.public_id} className="relative aspect-square rounded-xl border border-slate-700 bg-slate-800/40 overflow-hidden group">
                                        <img src={img.url} alt="Preview" className="size-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(img.public_id)}
                                            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="size-5 text-rose-400 hover:text-rose-300" />
                                        </button>
                                    </div>
                                ))}
                                
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative aspect-square rounded-xl border border-slate-700 bg-slate-800/40 overflow-hidden group">
                                        <img src={preview} alt="Preview" className="size-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(index)}
                                            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="size-5 text-rose-400 hover:text-rose-300" />
                                        </button>
                                    </div>
                                ))}

                                {existingImages.length + images.length < 5 && (
                                    <label className="relative aspect-square rounded-xl border-2 border-dashed border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-blue-400">
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
                            <p className="text-[10px] text-slate-500 text-center">JPG, PNG or WEBP. Max 5 images.</p>
                        </Card>
                    </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => window.history.back()} 
                        disabled={isLoading} 
                        className="rounded-full px-8 text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={isLoading} 
                        className="rounded-full px-10 min-w-40 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="size-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>{initialData ? 'Save Changes' : 'List Product'}</>
                        )}
                    </Button>
                </div>
            </form>

            {/* EXTRACTED MODAL COMPONENTS */}
            <AddBrandModal 
                isOpen={showBrandModal} 
                onClose={() => setShowBrandModal(false)} 
                onSuccess={(newBrandId) => setValue('brand', newBrandId)}
            />

            <AddCategoryModal 
                isOpen={showCategoryModal} 
                onClose={() => setShowCategoryModal(false)} 
                onSuccess={(newCategoryId) => setValue('category', newCategoryId)}
            />
        </>
    );
};

export default ProductForm;