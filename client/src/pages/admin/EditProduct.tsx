import { useNavigate, useParams } from 'react-router-dom';
import { useGetSingleProductQuery, useUpdateProductMutation } from '../../features/products/productApiSlice';
import ProductForm from '../../features/products/components/ProductForm';
import { toast } from 'sonner';
import { Loader2, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EditProduct = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const { data, isLoading: isFetching } = useGetSingleProductQuery(id!);
    const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

    const handleSubmit = async (formData: FormData) => {
        try {
            await updateProduct({ id: id!, formData }).unwrap();
            toast.success('Product updated successfully');
            navigate('/admin/products');
        } catch (error: unknown) {
            const err = error as { data?: { message?: string } };
            toast.error(err?.data?.message || 'Failed to update product');
        }
    };

    if (isFetching) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!data?.product) {
        return (
            <div className="max-w-5xl mx-auto py-12 text-center space-y-4">
                <p className="text-muted-foreground">Product not found.</p>
                <Button variant="outline" onClick={() => navigate('/admin/products')}>
                    Go back to list
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col gap-4">
                <Button 
                    variant="ghost" 
                    className="w-fit -ml-2 text-muted-foreground hover:text-foreground"
                    onClick={() => navigate('/admin/products')}
                >
                    <ChevronLeft className="size-4 mr-1" />
                    Back to Products
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Edit Product</h1>
                    <p className="text-muted-foreground mt-1">Update the details for "{data.product.name}"</p>
                </div>
            </div>

            <ProductForm 
                key={data.product._id} 
                initialData={data.product} 
                onSubmit={handleSubmit} 
                isLoading={isUpdating} 
            />
        </div>
    );
};

export default EditProduct;
