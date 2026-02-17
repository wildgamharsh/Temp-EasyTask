"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getOrganizerReviews } from "@/lib/review-actions";
import { Review } from "@/lib/database.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star, Loader2, User } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function loadReviews() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const data = await getOrganizerReviews(user.id);
                setReviews(data as Review[]);
            } catch (error) {
                console.error("Failed to load reviews:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadReviews();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pt-2">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Reviews & Ratings</h1>
                <p className="text-slate-500">
                    Manage and view feedback from your customers.
                </p>
            </div>

            <div className="grid gap-4">
                {reviews.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                            <Star className="h-12 w-12 text-slate-200 mb-4" />
                            <p>No reviews received yet.</p>
                        </CardContent>
                    </Card>
                ) : (
                    reviews.map((review) => (
                        <Card key={review.id}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="font-semibold text-slate-900">{review.title || "Review"}</span>
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {format(new Date(review.created_at), "MMM d, yyyy")}
                                    </span>
                                </div>
                                <CardDescription className="flex items-center gap-2 mt-1">
                                    <User className="h-4 w-4" />
                                    {review.customer_name || "Anonymous"}
                                    {review.is_verified && (
                                        <Badge variant="secondary" className="text-[10px] h-5 ml-2 bg-green-50 text-green-700 hover:bg-green-50">
                                            Verified Customer
                                        </Badge>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                                    "{review.comment}"
                                </p>
                                <div className="mt-4 text-xs text-slate-400">
                                    Service: <span className="font-medium text-slate-600">{review.service_name}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
