import { useNavigate } from 'react-router-dom';
import { useCreateProductMutation } from '../../features/products/productApiSlice';
import ProductForm from '../../features/products/components/ProductForm';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CreateProduct = () => {
    const navigate = useNavigate();
    const [createProduct, { isLoading }] = useCreateProductMutation();

    const handleSubmit = async (formData: FormData) => {
        try {
            await createProduct(formData).unwrap();
            toast.success('Product created successfully');
            navigate('/admin/products');
        } catch (error: unknown) {
            const err = error as { data?: { message?: string } };
            toast.error(err?.data?.message || 'Failed to create product');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 p-6 text-slate-100 pb-12">
            <div className="flex flex-col gap-2">
                <Button 
                    variant="ghost" 
                    size="sm"
                    className="w-fit -ml-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
                    onClick={() => navigate('/admin/products')}
                >
                    <ChevronLeft className="size-4 mr-1" />
                    Back to Products
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Add New Product</h1>
                    <p className="text-slate-400 mt-1 text-sm">Fill in the details to list a new laptop in your store.</p>
                </div>
            </div>

            <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
    );
};

export default CreateProduct;
