import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { BookingPricingBreakdown, ServicePricingModel } from '@/lib/database.types';
import { calculateCartTotals } from "@/lib/pricing/server-pricing";

interface CreateBookingRequest {
    serviceId: string;
    serviceName: string;
    organizerId: string;
    organizerName: string;
    eventDate: string;
    startTime: string; // 24h format HH:mm
    endTime: string;   // 24h format HH:mm
    // guestCount removed
    // notes removed

    // Pricing details
    pricingModel: string; // Keep for legacy/logging, but engine ignores it
    selectionState?: Record<string, string[]>;
    stepQuantities?: Record<string, number>;

    // subtotal removed
    // taxAmount removed
    // totalAmount removed
    // discountAmount removed
    // promoCodeId removed
    // taxProvince removed

    // Draft ID to delete after creation
    draftId?: string;
    pricingDisplay?: boolean;
}
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = user.id;

        const body: CreateBookingRequest = await request.json();
        const {
            serviceId,
            serviceName,
            organizerId,
            organizerName,
            eventDate,
            startTime,
            endTime,
            pricingModel,
            selectionState,
            stepQuantities,
            draftId,
        } = body;

        // Validate required fields
        if (!serviceId || !organizerId || !eventDate || !startTime || !endTime) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if date is blocked
        const { data: blockedCheck } = await supabase
            .from('blocked_dates')
            .select('id')
            .eq('organizer_id', organizerId)
            .eq('blocked_date', eventDate)
            .single();

        if (blockedCheck) {
            return NextResponse.json(
                { error: 'This date is blocked by the organizer.' },
                { status: 409 }
            );
        }

        const calculationResult = await calculateCartTotals(
            [{
                service_id: serviceId,
                quantity: 1,
                selection_state: selectionState,
                stepQuantities: stepQuantities,
                pricing_model: pricingModel
            }],
        );

        if (!calculationResult.success || !calculationResult.data) {
            return NextResponse.json(
                { error: 'Price validation failed: ' + calculationResult.message },
                { status: 400 }
            );
        }

        const verifiedPricing = calculationResult.data; // Keep for reference if needed

        // Fetch Configuration Snapshot
        const { data: serviceData } = await supabase
            .from('services')
            .select('pricing_configuration_id')
            .eq('id', serviceId)
            .single();

        let configurationSnapshot = null;
        if (serviceData?.pricing_configuration_id) {
            const { data: config } = await supabase
                .from('pricing_configurations')
                .select('*')
                .eq('id', serviceData.pricing_configuration_id)
                .single();
            configurationSnapshot = config;
        }

        const bookingData = {
            customer_id: userId,
            customer_name: user.user_metadata?.full_name || user.email || userId,
            customer_email: user.email || "",
            service_id: serviceId,
            service_name: serviceName,
            organizer_id: organizerId,
            organizer_name: organizerName,
            event_date: eventDate,
            start_time: startTime,
            end_time: endTime,
            status: 'pending' as const,
            payment_status: 'pending' as const,

            selection_state: selectionState || {},
            step_quantities: stepQuantities || {},
            configuration_snapshot: configurationSnapshot,
            pricing_display: body.pricingDisplay ?? true,
        };

        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert(bookingData)
            .select()
            .single();

        if (bookingError) {
            console.error('Booking creation error:', bookingError);
            return NextResponse.json(
                { error: 'Failed to create booking', details: bookingError },
                { status: 500 }
            );
        }

        // Time slot creation removed (table dropped in migration 022)

        // Delete draft if provided
        if (draftId) {
            await supabase
                .from('draft_bookings')
                .delete()
                .eq('id', draftId)
                .eq('user_id', userId);
        }

        return NextResponse.json({
            success: true,
            booking: booking,
            bookingId: booking.id,
        });

    } catch (error) {
        console.error('Booking creation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
