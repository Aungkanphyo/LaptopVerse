import { useNavigate, useParams } from 'react-router-dom';
import { useGetSingleProductQuery, useUpdateProductMutation } from '../../features/products/productApiSlice';
import ProductForm from '../../features/products/components/ProductForm';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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
                <Loader2 className="size-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!data?.product) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-8 text-center">
                <p className="text-gray-500">Product not found.</p>
                <button onClick={() => navigate('/admin/products')} className="mt-4 text-blue-600 hover:underline">
                    Go back to list
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
                <p className="text-sm text-gray-500">Update the details for "{data.product.name}"</p>
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
