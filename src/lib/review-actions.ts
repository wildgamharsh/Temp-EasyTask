import { createClient } from "@/lib/supabase/client";
import { Review } from "./database.types";

export interface ReviewSubmission {
    booking_id?: string | null;
    service_id: string;
    organizer_id: string;
    rating: number; // 1-5
    comment: string; // > 100 chars
    title?: string;
}

export async function submitReview(reviewData: ReviewSubmission) {
    const supabase = createClient();

    // Validate length locally as well
    if (reviewData.comment.length < 100) {
        throw new Error("Review must be at least 100 characters long.");
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in to submit a review.");

    const payload = {
        customer_id: user.id,
        booking_id: reviewData.booking_id || null, // Ensure explicit null if undefined
        service_id: reviewData.service_id,
        organizer_id: reviewData.organizer_id,
        rating: reviewData.rating,
        comment: reviewData.comment,
        title: reviewData.title || '',
        // is_verified is handled by DB trigger based on booking_id presence
    };

    const { data, error } = await supabase
        .from('reviews')
        .insert(payload)
        .select()
        .single();

    if (error) {
        console.error("Error submitting review:", error);
        throw error;
    }

    return data as Review;
}

export async function getServiceReviews(serviceId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('reviews')
        .select(`
            *,
            customer_name:customers!customer_id(name)
        `)
        .eq('service_id', serviceId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function getOrganizerReviews(organizerId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('reviews')
        .select(`
            *,
            customer_name:customers!customer_id(name),
            service_name:services!service_id(title)
        `)
        .eq('organizer_id', organizerId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}
