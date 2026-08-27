import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, X } from 'lucide-react';
import { useCreateCategoryMutation } from '../productApiSlice';
import { toast } from 'sonner';

interface AddCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (categoryId: string) => void;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [createCategory, { isLoading }] = useCreateCategoryMutation();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            const res = await createCategory({ name: name.trim() }).unwrap();
            toast.success('Category added successfully');
            onSuccess?.(res.category._id); // Send created Category ID back to form
            setName('');
            onClose();
        } catch (err: unknown) {
            const error = err as {data?: {message?: string}};
            toast.error(error?.data?.message || 'Failed to add category');
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="size-4" />
                </button>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Add New Category</h3>
                    <p className="text-xs text-muted-foreground">Create a new product category.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="categoryName" className="text-xs font-semibold">Category Name</Label>
                        <Input
                            id="categoryName"
                            placeholder="e.g. Gaming"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !name.trim()}>
                            {isLoading ? <Loader2 className="size-4 animate-spin" /> : 'Add Category'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};