import type { RootState } from '@/app/store';
import type { IProduct } from '@/types/product.types'
import { useSelector } from 'react-redux'
import ReviewCard from './ReviewCard';
import { MessageSquareOff } from 'lucide-react';
import { ReviewForm } from './ReviewForm';
import { Link } from 'react-router-dom';

const ProductReviews = ({ product }: { product: IProduct }) => {
    const { user } = useSelector((state: RootState) => state.auth);
    return (
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-gray-100 pt-12">
            <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    Customer Reviews
                    <span className="text-sm font-normal text-gray-500">({product.numOfReviews})</span>
                </h2>

                <div className="space-y-2">
                    {product.reviews && product.reviews.length > 0 ? (
                        product.reviews.map((review) => (
                            <ReviewCard key={review._id} review={review} />
                        ))
                    ) : (
                        <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed">
                            <MessageSquareOff className="size-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No reviews yet. Be the first to share your experience!</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="lg:col-span-1">
                {user ? (
                    <div className="sticky top-24">
                        <ReviewForm productId={product._id} />
                    </div>
                ) : (
                    <div className="bg-blue-50 mt-14 p-6 rounded-2xl border border-blue-100 text-center">
                        <p className="text-blue-900 font-medium mb-3">Want to review this product?</p>
                        <p className="text-sm text-blue-700 mb-4">Please log in to share your feedback with the community.</p>
                        <Link to="/login" className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                            Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProductReviews
