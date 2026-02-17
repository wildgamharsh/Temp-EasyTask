"use client";

import { useEffect, useState } from "react";
import { getServiceReviews } from "@/lib/review-actions";
import { Review } from "@/lib/database.types";
import { Star, User, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ReviewsSectionProps {
    serviceId: string;
}

export function ReviewsSection({ serviceId }: ReviewsSectionProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReviews() {
            try {
                const data = await getServiceReviews(serviceId);
                setReviews(data as Review[]);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        if (serviceId) fetchReviews();
    }, [serviceId]);

    if (loading) return <div className="py-8 text-center text-slate-400">Loading reviews...</div>;

    if (reviews.length === 0) {
        return (
            <div className="py-12 text-center bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-slate-500">No reviews yet. Be the first to share your experience!</p>
            </div>
        );
    }

    // Calculate average
    const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                    <span className="text-3xl font-bold text-slate-900">{averageRating.toFixed(1)}</span>
                    <div className="flex flex-col ml-2">
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < Math.round(averageRating) ? "fill-current" : "text-slate-200"}`} />
                            ))}
                        </div>
                        <span className="text-sm text-slate-500">{reviews.length} reviews</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-white border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 bg-slate-100 text-slate-500">
                                    <AvatarFallback>
                                        {(review.customer_name || 'A').charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-slate-900">{review.customer_name || "Anonymous"}</span>
                                        {review.is_verified && (
                                            <div className="flex items-center text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                                                <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex text-yellow-400 mt-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-current" : "text-slate-200"}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <span className="text-sm text-slate-400">
                                {format(new Date(review.created_at), "MMM d, yyyy")}
                            </span>
                        </div>
                        <h4 className="font-medium text-slate-900 mb-1">{review.title}</h4>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            {review.comment}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
