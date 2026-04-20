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
    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
      <h3 className="font-bold text-gray-900">Write a Review</h3>

      <div className="flex gap-1">
        {[...Array(5)].map((_, star) => (
          <button
          key={star}
          type="button"
          className="focus:outline-none transition-transform hover:scale-110"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          >
            <Star className={`size-6 ${
              star <= (hover || rating) ? "fill-amber-400 text-amber-500" : "text-gray-300"
              }`}/>
          </button>
        ))}
      </div>

      <Textarea
        placeholder="Share your thoughts about this laptop..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="bg-white border-gray-200 focus-visible:ring-blue-500 min-h-[100px]"
        required
      />

      <Button disabled={isLoading} className="w-full gap-2" >
        {isLoading ? <Loader2 className="animate-spin size-4" /> : <Send className="size-4"/>}
        Submit Review
      </Button>
    </form>
  )
}
