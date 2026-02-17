import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const organizerId = searchParams.get('organizerId');
        // month is 1-indexed (1=Jan) coming from frontend
        const month = parseInt(searchParams.get('month') || '0');
        const year = parseInt(searchParams.get('year') || '0');

        if (!organizerId || !month || !year) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Calculate date range for the month
        // We want to fetch everything for this month.
        // JS Date(year, monthIndex) -> monthIndex is 0-based.
        // So passed month 1 -> 0.
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // Last day of specific month

        // Adjust to strings for Supabase comparison to avoid TZ issues
        // YYYY-MM-DD
        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];

        // 1. Fetch Blocked Dates
        const { data: blockedDatesData, error: blockedError } = await supabase
            .from('blocked_dates')
            .select('blocked_date')
            .eq('organizer_id', organizerId)
            .gte('blocked_date', startStr)
            .lte('blocked_date', endStr);

        if (blockedError) {
            console.error("Error fetching blocked dates", blockedError);
        }

        // 2. Fetch Existing Bookings (Confirmed/Pending)
        const { data: bookingsData, error: bookingsError } = await supabase
            .from('bookings')
            .select('event_date, start_time, end_time')
            .eq('organizer_id', organizerId)
            // Filter out cancelled/rejected
            .neq('status', 'cancelled')
            .neq('status', 'rejected')
            // Date range
            .gte('event_date', startStr)
            .lte('event_date', endStr);

        if (bookingsError) {
            console.error("Error fetching bookings", bookingsError);
        }

        const blockedDates = blockedDatesData?.map(b => b.blocked_date) || [];

        return NextResponse.json({
            blockedDates, // Array of "YYYY-MM-DD"
            bookings: bookingsData || [],
        });

    } catch (error) {
        console.error('Availability GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
