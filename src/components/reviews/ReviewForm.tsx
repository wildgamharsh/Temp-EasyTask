"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { submitReview, ReviewSubmission } from "@/lib/review-actions";

interface ReviewFormProps {
    bookingId?: string | null;
    serviceId: string;
    organizerId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function ReviewForm({ bookingId, serviceId, organizerId, onSuccess, onCancel }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [title, setTitle] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error("Please select a star rating.");
            return;
        }

        if (comment.length < 100) {
            toast.error(`Please write at least 100 characters. Currently: ${comment.length}`);
            return;
        }

        setIsSubmitting(true);

        try {
            const submission: ReviewSubmission = {
                booking_id: bookingId,
                service_id: serviceId,
                organizer_id: organizerId,
                rating,
                comment,
                title
            };

            await submitReview(submission);
            toast.success("Review submitted successfully!");
            if (onSuccess) onSuccess();
        } catch (error: any) {
            toast.error(error.message || "Failed to submit review");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className={cn(
                                "p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50",
                                (hoverRating || rating) >= star ? "text-yellow-400" : "text-slate-200"
                            )}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                        >
                            <Star className="h-8 w-8 fill-current" />
                        </button>
                    ))}
                    <span className="ml-2 text-sm text-slate-500 font-medium">
                        {rating > 0 ? `${rating} out of 5` : "Select a rating"}
                    </span>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                    id="title"
                    placeholder="Brief summary of your experience"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="comment">
                    Review <span className="text-red-500">*</span>
                    <span className="text-xs font-normal text-slate-500 ml-2">
                        (Minimum 100 characters)
                    </span>
                </Label>
                <Textarea
                    id="comment"
                    placeholder="Share details of your own experience at this place..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[150px]"
                />
                <div className="flex justify-end">
                    <span className={cn(
                        "text-xs",
                        comment.length < 100 ? "text-orange-500" : "text-green-600"
                    )}>
                        {comment.length} / 100 characters
                    </span>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={isSubmitting || comment.length < 100 || rating === 0}>
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
            </div>
        </form>
    );
}
