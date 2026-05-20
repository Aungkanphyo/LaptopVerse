import { useNavigate } from 'react-router-dom';
import { useCreateProductMutation } from '../../features/products/productApiSlice';
import ProductForm from '../../features/products/components/ProductForm';
import { toast } from 'sonner';

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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
                <p className="text-sm text-gray-500">Fill in the details to list a new laptop.</p>
            </div>

            <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
    );
};

export default CreateProduct;
