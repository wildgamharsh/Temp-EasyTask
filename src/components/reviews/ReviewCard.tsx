"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Star, CheckCircle2, Quote } from "lucide-react";
import { Review } from "@/lib/database.types";

interface ReviewCardProps {
    review: Review;
    compact?: boolean;
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-CA", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
    const starSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`${starSize} ${star <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-muted text-muted"
                        }`}
                />
            ))}
        </div>
    );
}

export function ReviewCard({ review, compact = false }: ReviewCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className={compact ? "p-4" : "p-6"}>
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`rounded-full bg-primary/10 flex items-center justify-center ${compact ? "h-8 w-8" : "h-10 w-10"}`}>
                            <span className={`font-bold text-primary ${compact ? "text-xs" : "text-sm"}`}>
                                {review.customer_name?.charAt(0) || "A"}
                            </span>
                        </div>
                        <div>
                            <p className={`font-semibold ${compact ? "text-sm" : ""}`}>
                                {review.customer_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatDate(review.created_at)}
                            </p>
                        </div>
                    </div>
                    <StarRating rating={review.rating} size={compact ? "sm" : "md"} />
                </div>

                {review.title && (
                    <h4 className={`font-semibold mb-2 ${compact ? "text-sm" : ""}`}>
                        {review.title}
                    </h4>
                )}

                {review.comment && (
                    <p className={`text-muted-foreground leading-relaxed ${compact ? "text-xs line-clamp-2" : "text-sm"}`}>
                        <Quote className={`inline-block mr-1 text-primary/50 ${compact ? "h-3 w-3" : "h-4 w-4"}`} />
                        {review.comment}
                    </p>
                )}

                {review.is_verified && (
                    <p className={`text-muted-foreground mt-3 flex items-center gap-1 ${compact ? "text-[10px]" : "text-xs"}`}>
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        Verified booking{review.service_name ? ` for ${review.service_name}` : ""}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
