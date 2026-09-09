import React, { useState } from 'react'
import { useCreateReviewMutation } from '../productApiSlice';
import { toast } from "sonner";
import { Loader2, Send, Star } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export const ReviewForm = ({ productId }: { productId: string }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [hover, setHover] = useState(0);

    const [createReview, { isLoading }] = useCreateReviewMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0 || comment.trim() === "") return toast.error("Please select a rating");

        try {
            await createReview({ productId, rating, comment }).unwrap();
            toast.success("Review submitted successfully.");
            setRating(0);
            setComment("");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to submit review";
            toast.error(message);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="bg-[#0e1322] p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-base">Write a Review</h3>

            <div className="flex gap-1.5 py-1">
                {[...Array(5)].map((_, star) => {
                    const ratingValue = star + 1;
                    return (
                        <button
                            key={star}
                            type="button"
                            className="focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                            onClick={() => setRating(ratingValue)}
                            onMouseEnter={() => setHover(ratingValue)}
                            onMouseLeave={() => setHover(0)}
                        >
                            <Star className={`size-6 ${ratingValue <= (hover || rating)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-700 fill-slate-800/30"
                                }`}
                            />
                        </button>
                    );
                })}
            </div>

            <Textarea
                placeholder="Share your thoughts about this laptop..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="bg-[#070913] border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500 min-h-[110px] rounded-xl text-sm"
                required
            />

            <Button
                disabled={isLoading}
                className="w-full gap-2 h-11 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all cursor-pointer disabled:opacity-50"
            >
                {isLoading ? <Loader2 className="animate-spin size-4" /> : <Send className="size-4" />}
                Submit Review
            </Button>
        </form>
    )
}
