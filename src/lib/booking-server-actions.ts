"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function completeBookingWithDetails(
    bookingId: string,
    eventDetails: {
        event_date: string;
        customer_name: string;
        organizer_name: string;
        services_taken: string;
        images: Array<{
            url: string;
            heading: string;
            caption: string;
        }>;
    }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User must be logged in");
    }

    // 1. Verify Authorization (via RLS or explicit check)
    // We'll trust RLS on insert, but explicit check doesn't hurt
    const { data: booking, error: bookingCheckError } = await supabase
        .from('bookings')
        .select('organizer_id')
        .eq('id', bookingId)
        .single();

    if (bookingCheckError || !booking) {
        throw new Error("Booking not found");
    }

    if (booking.organizer_id !== user.id) {
        throw new Error("Unauthorized: Only the organizer can complete this booking");
    }

    // 2. Insert or Update Event Details (Upsert to handle retries)
    const { error: insertError } = await supabase
        .from('event_details')
        .upsert({
            booking_id: bookingId,
            event_date: eventDetails.event_date,
            customer_name: eventDetails.customer_name,
            organizer_name: eventDetails.organizer_name,
            services_taken: eventDetails.services_taken,
            images: eventDetails.images
        }, { onConflict: 'booking_id' });

    if (insertError) {
        console.error("Error inserting/updating event details:", insertError);
        throw new Error(`Failed to save event details: ${insertError.message}`);
    }

    // 3. Update Booking Status to Completed
    // Note: We only set organizer_completed_at. Requires RLS to allow status update.
    const { error: updateError } = await supabase
        .from('bookings')
        .update({
            status: 'completed',
            organizer_completed_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

    if (updateError) {
        console.error("Error updating booking status:", updateError);
        // Note: Event details were inserted. We might want to rollback but Supabase doesn't support multi-table transactions easily in client lib logic without RPC.
        // We'll throw. The user can retry completion (which might fail on unique constraint of event_details).
        // To handle retry, "INSERT ... ON CONFLICT (booking_id) UPDATE" would be better in step 2.
        throw new Error("Failed to update booking status");
    }

    revalidatePath(`/dashboard/bookings`);
    revalidatePath(`/dashboard/messages`);

    return { success: true };
}
