import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { IReview } from '@/types/product.types'
import { format } from "date-fns"
import { Star } from 'lucide-react'

const ReviewCard = ({ review }: { review: IReview }) => {
    return (
        <div className="py-6 flex flex-col gap-3 border-b border-slate-800/80 last:border-0">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="size-10 border border-slate-800">
                        <AvatarFallback className="bg-indigo-600/20 text-indigo-400 font-bold text-sm">
                            {review.name ? review.name.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-bold text-white">{review.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {review.createdAt ? format(new Date(review.createdAt), "PPP") : "Recently"}
                        </p>
                    </div>
                </div>

                {/* Star Rating Indicator */}
                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`size-3.5 ${
                                i < review.rating 
                                    ? "fill-amber-400 text-amber-400" 
                                    : "text-slate-700 fill-slate-800/40"
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* User Review Comment Text */}
            <p className="text-slate-300 text-sm leading-relaxed italic pl-1">
                "{review.comment}"
            </p>
        </div>
    )
}

export default ReviewCard
