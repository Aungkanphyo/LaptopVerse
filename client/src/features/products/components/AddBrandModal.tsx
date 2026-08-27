import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, X } from 'lucide-react';
import { useCreateBrandMutation } from '../productApiSlice';
import { toast } from 'sonner';

interface AddBrandModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (brandId: string) => void;
}

export const AddBrandModal: React.FC<AddBrandModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [createBrand, { isLoading }] = useCreateBrandMutation();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            const res = await createBrand({ name: name.trim() }).unwrap();
            toast.success('Brand added successfully');
            onSuccess?.(res.brand._id); // Send created Brand ID back to form
            setName('');
            onClose();
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            toast.error(error?.data?.message || 'Failed to add brand');
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
                    <h3 className="text-lg font-bold text-gray-900">Add New Brand</h3>
                    <p className="text-xs text-muted-foreground">Create a new brand to assign to products.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="brandName" className="text-xs font-semibold">Brand Name</Label>
                        <Input
                            id="brandName"
                            placeholder="e.g. Dell"
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
                            {isLoading ? <Loader2 className="size-4 animate-spin" /> : 'Add Brand'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};