import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DraftBooking } from '@/lib/database.types';

/**
 * GET /api/bookings/draft
 * Retrieve draft booking for current user and service
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = user.id;

        const { searchParams } = new URL(request.url);
        const serviceId = searchParams.get('serviceId');

        if (!serviceId) {
            return NextResponse.json({ error: 'Service ID required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('draft_bookings')
            .select('*')
            .eq('user_id', userId)
            .eq('service_id', serviceId)
            .gt('expires_at', new Date().toISOString())
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error('Error fetching draft:', error);
            return NextResponse.json({ error: 'Failed to fetch draft' }, { status: 500 });
        }

        return NextResponse.json({ draft: data });
    } catch (error) {
        console.error('Draft GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/bookings/draft
 * Create or update draft booking
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = user.id;

        const body = await request.json();
        const {
            serviceId,
            organizerId,
            pricingModel,
            selectedPackageId,
            selectedAddonIds,
            guestCount,
            subtotal,
            taxAmount,
            totalAmount,
            eventDate,
            eventTime,
            startTime,
            endTime,
            promoCodeId,
            discountAmount,
            notes,
            currentStep,
        } = body;

        if (!serviceId || !organizerId || !pricingModel) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check for existing draft
        const { data: existing } = await supabase
            .from('draft_bookings')
            .select('id')
            .eq('user_id', userId)
            .eq('service_id', serviceId)
            .gt('expires_at', new Date().toISOString())
            .maybeSingle();

        const draftData = {
            user_id: userId,
            service_id: serviceId,
            organizer_id: organizerId,
            pricing_model: pricingModel,
            selected_package_id: selectedPackageId || null,
            selected_addon_ids: selectedAddonIds || [],
            guest_count: guestCount || null,
            subtotal: subtotal || null,
            tax_amount: taxAmount || null,
            total_amount: totalAmount || null,
            event_date: eventDate || null,
            start_time: startTime || (eventTime?.split(' - ')[0]) || null,
            end_time: endTime || (eventTime?.includes(' - ') ? eventTime.split(' - ')[1] : null) || null,
            promo_code_id: promoCodeId || null,
            discount_amount: discountAmount || 0,
            notes: notes || null,
            current_step: currentStep || 1,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        };

        let result;
        if (existing) {
            // Update existing draft
            const { data, error } = await supabase
                .from('draft_bookings')
                .update(draftData)
                .eq('id', existing.id)
                .select()
                .single();

            if (error) throw error;
            result = data;
        } else {
            // Create new draft
            const { data, error } = await supabase
                .from('draft_bookings')
                .insert(draftData)
                .select()
                .single();

            if (error) throw error;
            result = data;
        }

        return NextResponse.json({ draft: result });
    } catch (error) {
        console.error('Draft POST error:', error);
        return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
    }
}

/**
 * DELETE /api/bookings/draft
 * Delete draft booking
 */
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = user.id;

        const { searchParams } = new URL(request.url);
        const draftId = searchParams.get('draftId');

        if (!draftId) {
            return NextResponse.json({ error: 'Draft ID required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('draft_bookings')
            .delete()
            .eq('id', draftId)
            .eq('user_id', userId);

        if (error) {
            console.error('Error deleting draft:', error);
            return NextResponse.json({ error: 'Failed to delete draft' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Draft DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
