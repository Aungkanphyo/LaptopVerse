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
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-slate-800/80 pt-8">
            <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                    Customer Reviews
                    <span className="text-sm font-normal text-slate-400">({product.numOfReviews || 0})</span>
                </h2>

                <div className="space-y-2">
                    {product.reviews && product.reviews.length > 0 ? (
                        product.reviews.map((review) => (
                            <ReviewCard key={review._id} review={review} />
                        ))
                    ) : (
                        // empty card that when show not reviews
                        <div className="py-12 text-center bg-[#0e1322] rounded-2xl border border-dashed border-slate-800">
                            <MessageSquareOff className="size-10 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm">No reviews yet. Be the first to share your experience!</p>
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
                    // show not login
                    <div className="bg-[#0e1322] mt-14 p-6 rounded-2xl border border-slate-800 text-center">
                        <p className="text-white font-medium mb-2">Want to review this product?</p>
                        <p className="text-xs text-slate-400 mb-5 leading-relaxed">Please log in to share your feedback with the community.</p>
                        <Link 
                            to="/login" 
                            className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm py-2.5 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                        >
                            Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProductReviews
