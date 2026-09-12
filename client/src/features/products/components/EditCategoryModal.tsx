import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateCategoryMutation } from '../productApiSlice';
import type { ICategoryItem } from '@/types/product.types';

interface EditCategoryModalProps {
    isOpen: boolean;
    category: ICategoryItem | null;
    onClose: () => void;
}

const EditCategoryForm: React.FC<{ category: ICategoryItem; onClose: () => void }> = ({ category, onClose }) => {
    const [name, setName] = useState(category.name);
    const [description, setDescription] = useState(category.description || '');
    const [updateCategory, { isLoading }] = useUpdateCategoryMutation();

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    const isValid = trimmedName.length > 0;

    const hasChanged =
        trimmedName !== (category.name || '').trim() ||
        trimmedDescription !== (category.description || '').trim();

    const isSaveDisabled = !isValid || !hasChanged || isLoading;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isValid) {
            toast.error('Category name is required');
            return;
        }

        try {
            await updateCategory({
                id: category._id,
                name: trimmedName,
                description: trimmedDescription,
            }).unwrap();

            toast.success('Category updated successfully');
            onClose();
        } catch (error: unknown) {
            const err = error as { data?: { message?: string } };
            toast.error(err?.data?.message || 'Failed to update category');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="edit-cat-name" className="text-sm font-semibold text-slate-200">
                    Category Name
                </Label>
                <Input
                    id="edit-cat-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter category name"
                    required
                    className="rounded-xl bg-slate-800/60 border-slate-700/80 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="edit-cat-desc" className="text-sm font-semibold text-slate-200">
                    Description
                </Label>
                <Textarea
                    id="edit-cat-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter category description"
                    rows={3}
                    className="rounded-xl bg-slate-800/60 border-slate-700/80 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none transition-all"
                />
            </div>
            <div className="flex justify-end gap-3 pt-5 border-t border-slate-800">
                <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={onClose} 
                    className="rounded-xl text-slate-300 hover:text-white hover:bg-slate-800"
                >
                    Cancel
                </Button>
                <Button 
                    type="submit" 
                    disabled={isSaveDisabled} 
                    className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-6 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                    Save Changes
                </Button>
            </div>
        </form>
    );
};

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({ isOpen, category, onClose }) => {
    if (!isOpen || !category) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 text-slate-100">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <h2 className="text-xl font-bold text-white">Edit Category</h2>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={onClose} 
                        className="rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <X className="size-5" />
                    </Button>
                </div>
                <EditCategoryForm key={category._id} category={category} onClose={onClose} />
            </div>
        </div>
    );
};