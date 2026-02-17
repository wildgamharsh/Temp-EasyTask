import { createClient } from "@/lib/supabase/client";
import { BookingStatus } from "./database.types";
import { toast } from "sonner";

export async function updateBookingStatus(
    bookingId: string,
    newStatus: string,
    extraUpdates: Record<string, any> = {}
) {
    const supabase = createClient();

    // Validate status if needed, but usually UI handles this based on role
    // We map 'completion_pending_organizer' etc to actual DB values here if needed, 
    // but the component usually does that. 
    // Let's standardise: this function takes the FINAL db status.

    const { data, error } = await supabase
        .from('bookings')
        .update({
            status: newStatus as BookingStatus,
            ...extraUpdates
        })
        .eq('id', bookingId)
        .select()
        .single();

    if (error) {
        console.error("Error updating booking status:", error);
        throw error;
    }

    return data;
}


export async function rejectBooking(bookingId: string) {
    return updateBookingStatus(bookingId, 'rejected');
}

export async function confirmBooking(bookingId: string) {
    return updateBookingStatus(bookingId, 'confirmed');
}

export async function organizerMarkCompleted(bookingId: string) {
    // Simple direct completion as per new flow
    const updates: any = {
        organizer_completed_at: new Date().toISOString(),
        customer_completed_at: new Date().toISOString() // Assuming organizer completion implies full completion in this simplified flow
    };

    return updateBookingStatus(bookingId, 'completed', updates);
}

export async function customerConfirmCompletion(bookingId: string) {
    // Same logic as organizer completion for simplified flow
    const updates: any = {
        organizer_completed_at: new Date().toISOString(),
        customer_completed_at: new Date().toISOString()
    };

    return updateBookingStatus(bookingId, 'completed', updates);
}

export async function cancelBooking(bookingId: string) {
    return updateBookingStatus(bookingId, 'cancelled');
}
