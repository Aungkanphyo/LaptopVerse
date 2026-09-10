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
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-slate-100">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                    <X className="size-4" />
                </button>

                <div>
                    <h3 className="text-lg font-bold text-white">Add New Category</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Create a new product category.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="categoryName" className="text-xs font-semibold text-slate-300">
                            Category Name <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                            id="categoryName"
                            placeholder="e.g. Gaming"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-xl"
                            autoFocus
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={onClose} 
                            disabled={isLoading}
                            className="text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isLoading || !name.trim()}
                            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="size-4 animate-spin" /> : 'Add Category'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};