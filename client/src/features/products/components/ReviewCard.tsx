import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { IReview } from '@/types/product.types'
import { format } from "date-fns"
import { Star } from 'lucide-react'

const ReviewCard = ({ review }: { review: IReview }) => {
    return (
        <div className="py-6 flex flex-col gap-4 border-b border-gray-100 last:border-0">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="size-10 border border-gray-200">
                        <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">
                            {review.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-bold text-gray-900">{review.name}</p>
                        <p className="text-xs text-gray-500">
                            {review.createdAt ? format(new Date(review.createdAt), "PPP") : "Recently"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`size-3.5 ${
                                i <= review.rating ? "fill-amber-400 text-amber-500" : "text-gray-200"
                            }`}
                        />
                    ))}
                </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed italic">
                "{review.comment}"
            </p>
        </div>
    )
}

export default ReviewCard
