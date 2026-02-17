"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Define Status locally
type QuoteStatus = 'pending' | 'finalizing' | 'completed' | 'cancelled' | 'rejected';

/**
 * Initiates a quote negotiation
 */
export async function requestQuote(
    serviceId: string,
    organizerId: string,
    selectionData: any,
    path: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User must be logged in to request a quote");
    }

    // 1. Check for existing OPEN quote
    const { data: existingQuote, error: fetchError } = await supabase
        .from('quotes')
        .select('id')
        .eq('customer_id', user.id)
        .eq('organizer_id', organizerId)
        .in('status', ['pending', 'finalizing'])
        .single();

    let quoteId: string;

    if (existingQuote) {
        // Reuse existing open quote, maybe update data?
        // For now, let's update with new selection data so search matches latest intent
        const { error: updateError } = await supabase
            .from('quotes')
            .update({
                quote_data: selectionData,
                last_message_at: new Date().toISOString()
            })
            .eq('id', existingQuote.id);

        if (updateError) {
            console.error("Error updating existing quote:", updateError);
            throw new Error("Failed to update quote request");
        }
        quoteId = existingQuote.id;
    } else {
        // Create New Quote
        const { data: newQuote, error: insertError } = await supabase
            .from('quotes')
            .insert({
                customer_id: user.id,
                organizer_id: organizerId,
                status: 'pending',
                quote_data: selectionData,
                last_message_at: new Date().toISOString()
            })
            .select()
            .single();

        if (insertError) {
            console.error("Error creating quote:", insertError);
            throw new Error("Failed to start quote request");
        }
        quoteId = newQuote.id;
    }

    // 2. Insert System Message
    const messageData = getQuoteRequestData(selectionData, user);
    const messageContent = JSON.stringify({
        type: 'quote_request',
        data: messageData
    });

    const { error: msgError } = await supabase
        .from('messages')
        .insert({
            quote_id: quoteId,
            sender_id: user.id,
            content: messageContent,
            is_read: false
        });

    if (msgError) console.error("Error sending initial quote message:", msgError);

    return { success: true, conversationId: quoteId }; // Returning as conversationId for frontend compatibility
}

// -----------------------------------------------------------------------------
// ORGANIZER ACTIONS
// -----------------------------------------------------------------------------

/**
 * Organizer sends a proposal (Price)
 */
export async function sendProposal(quoteId: string, price: number) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('quotes')
        .update({
            proposed_price: price,
            // status: 'finalizing', // Optional: Change status to indicate proposal sent
            last_message_at: new Date().toISOString()
        })
        .eq('id', quoteId);

    if (error) throw error;

    const content = JSON.stringify({
        type: "proposal",
        price: price,
        text: `Organizer has proposed a booking for $${price.toFixed(2)}. Do you accept?`
    });

    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('messages').insert({
        quote_id: quoteId,
        sender_id: user?.id,
        content: content
    });

    revalidatePath(`/dashboard/messages`);
    return { success: true };
}

/**
 * Organizer Confirms Booking (Without Price Negotiation or Finalizing)
 * This creates the booking immediately and closes the quote.
 */
export async function confirmBooking(quoteId: string) {
    const supabase = await createClient();

    // 1. Fetch Quote Data
    const { data: quote, error: fetchError } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .single();

    if (fetchError || !quote) throw new Error("Quote not found");

    // 2. Prepare Booking Data
    // We need to fetch customer/organizer details for denormalized fields
    const { data: customer } = await supabase.from('customers').select('name, email').eq('id', quote.customer_id).single();
    const { data: organizer } = await supabase.from('organizers').select('business_name, name').eq('id', quote.organizer_id).single();

    const quoteData = quote.quote_data as any;

    // Use proposed price if set, else 0 (since user said "not show zero either" implies we handle display logic elsewhere)
    // "booking created... must not display a price and must not show zero either" -> This suggests `pricing_display: false`?
    // User said: "Ensure this behavior only occurs when pricing_display is off, not when it is on."
    // So we set `pricing_display: false`.

    const bookingPayload = {
        customer_id: quote.customer_id,
        organizer_id: quote.organizer_id,
        service_id: quoteData.service_id,
        service_name: quoteData.service_name || "Custom Service",

        customer_name: customer?.name || "Customer",
        customer_email: customer?.email || "email@example.com",
        organizer_name: organizer?.business_name || organizer?.name || "Organizer",

        event_date: quoteData.event_date,
        // Parse times from quoteData or defaults
        start_time: (quoteData.start_time || quoteData.event_time || '00:00').split(' - ')[0],
        end_time: (quoteData.end_time || (quoteData.event_time?.includes(' - ') ? quoteData.event_time.split(' - ')[1] : '01:00')),

        status: 'confirmed', // Immediately confirmed
        payment_status: 'pending',

        // Metadata
        configuration_snapshot: quoteData.configuration_snapshot,
        selection_state: quoteData.selection_state,
        step_quantities: quoteData.step_quantities,

        proposed_price: quote.proposed_price || 0,
        pricing_display: false // Key requirement
    };

    // 3. Insert Booking
    const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingPayload)
        .select()
        .single();

    if (bookingError) throw new Error(`Booking creation failed: ${bookingError.message}`);

    // 4. Update Quote Status
    await supabase.from('quotes').update({
        status: 'completed',
        booking_id: booking.id,
        last_message_at: new Date().toISOString()
    }).eq('id', quoteId);

    // 5. Send System Message
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('messages').insert({
        quote_id: quoteId,
        sender_id: user?.id,
        content: "Booking Confirmed by Organizer. Quote closed."
    });

    revalidatePath(`/dashboard/messages`);
    revalidatePath(`/dashboard/bookings`);

    return { success: true, bookingId: booking.id };
}

// -----------------------------------------------------------------------------
// CUSTOMER ACTIONS
// -----------------------------------------------------------------------------

/**
 * Customer accepts proposal
 */
export async function acceptProposal(quoteId: string) {
    const supabase = await createClient();

    const { data: quote, error: fetchError } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .single();

    if (fetchError || !quote) throw new Error("Quote not found");

    // Reuse confirm logic or similar, but with price
    // ... (Implementation similar to previous acceptProposal but strictly for Quotes table)

    const quoteData = quote.quote_data as any;
    const price = quote.proposed_price || 0;

    const { data: customer } = await supabase.from('customers').select('name, email').eq('id', quote.customer_id).single();
    const { data: organizer } = await supabase.from('organizers').select('business_name, name').eq('id', quote.organizer_id).single();

    const bookingPayload = {
        customer_id: quote.customer_id,
        organizer_id: quote.organizer_id,
        service_id: quoteData.service_id,
        service_name: quoteData.service_name || "Service",

        customer_name: customer?.name || "Customer",
        customer_email: customer?.email || "email@example.com",
        organizer_name: organizer?.business_name || organizer?.name || "Organizer",

        event_date: quoteData.event_date,
        start_time: (quoteData.start_time || quoteData.event_time || '00:00').split(' - ')[0],
        end_time: (quoteData.end_time || (quoteData.event_time?.includes(' - ') ? quoteData.event_time.split(' - ')[1] : '01:00')),

        proposed_price: Number(price),
        status: 'confirmed',
        payment_status: 'pending',

        configuration_snapshot: quoteData.configuration_snapshot,
        selection_state: quoteData.selection_state,
        step_quantities: quoteData.step_quantities,

        pricing_display: true // Standard flow has pricing
    };

    const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingPayload)
        .select()
        .single();

    if (bookingError) throw new Error(bookingError.message);

    await supabase.from('quotes').update({
        status: 'completed',
        booking_id: booking.id,
        last_message_at: new Date().toISOString()
    }).eq('id', quoteId);

    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('messages').insert({
        quote_id: quoteId,
        sender_id: user?.id,
        content: "Proposal Accepted! Booking confirmed."
    });

    revalidatePath(`/dashboard/messages`);
    revalidatePath(`/dashboard/bookings`);
    return { success: true, bookingId: booking.id };
}

export async function rejectProposal(quoteId: string) {
    const supabase = await createClient();
    await supabase.from('quotes').update({ status: 'rejected', last_message_at: new Date().toISOString() }).eq('id', quoteId);

    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('messages').insert({
        quote_id: quoteId,
        sender_id: user?.id,
        content: "Proposal Rejected."
    });

    revalidatePath(`/dashboard/messages`);
    return { success: true };
}

export async function cancelQuote(quoteId: string) {
    const supabase = await createClient();
    await supabase.from('quotes').update({ status: 'cancelled', last_message_at: new Date().toISOString() }).eq('id', quoteId);

    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('messages').insert({
        quote_id: quoteId,
        sender_id: user?.id,
        content: "Quote request cancelled."
    });

    revalidatePath(`/dashboard/messages`);
    return { success: true };
}

// Helper (unchanged mostly, just kept for logic)
function getQuoteRequestData(selectionData: any, user: any) {
    const { service_name, event_date, event_time, configuration_snapshot, selection_state, step_quantities } = selectionData;
    const customerName = user.user_metadata?.full_name || user.email || "Customer";

    let steps = [];
    if (configuration_snapshot) {
        steps = configuration_snapshot.pricing_framework?.steps
            || configuration_snapshot.steps
            || configuration_snapshot.pricingModel?.steps
            || [];
    }

    const configuration = steps.flatMap((step: any) => {
        const selectedIds = selection_state?.[step.id];
        const idsToCheck = Array.isArray(selectedIds) ? selectedIds : (selectedIds ? [selectedIds] : []);
        if (idsToCheck.length === 0) return [];
        return idsToCheck.map((selectedOptionId: string) => {
            const option = step.options?.find((opt: any) => opt.id === selectedOptionId);
            if (!option) return null;
            return {
                stepTitle: step.name || step.title || "Step",
                optionTitle: option.label || option.title || "Option",
                quantity: step_quantities?.[step.id] || 1
            };
        });
    }).filter(Boolean);

    return {
        serviceName: service_name || "Service",
        eventDate: event_date,
        eventTime: event_time,
        customerName,
        configuration
    };
}
