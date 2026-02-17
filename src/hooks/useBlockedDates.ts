import { createClient } from '@/lib/supabase/client';

export async function getBlockedDates(organizerId: string): Promise<string[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('blocked_dates')
        .select('blocked_date')
        .eq('organizer_id', organizerId);

    if (error) {
        console.error('Error fetching blocked dates:', error);
        return [];
    }

    return (data || []).map(d => d.blocked_date);
}

export async function blockDate(
    organizerId: string,
    date: string,
    reason?: string
): Promise<boolean> {
    console.log('🔵 blockDate called with:', { organizerId, date, reason });

    const supabase = createClient();
    console.log('🔵 Supabase client created:', !!supabase);

    const insertData = {
        organizer_id: organizerId,
        blocked_date: date,
        reason: reason || 'Unavailable',
    };
    console.log('🔵 Attempting to insert:', insertData);

    const { data, error } = await supabase
        .from('blocked_dates')
        .insert(insertData)
        .select()
        .single();

    console.log('🔵 Insert result:', { data, error });

    if (error) {
        console.error('🔴 Error blocking date - DETAILED:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            full: JSON.stringify(error, null, 2)
        });
        return false;
    }

    console.log('✅ Date blocked successfully!', data);
    return true;
}

export async function unblockDate(blockedDateId: string): Promise<boolean> {
    console.log('🔵 unblockDate called with:', blockedDateId);

    const supabase = createClient();

    const { error } = await supabase
        .from('blocked_dates')
        .delete()
        .eq('id', blockedDateId);

    if (error) {
        console.error('🔴 Error unblocking date:', {
            message: error.message,
            code: error.code,
            full: error
        });
        return false;
    }

    console.log('✅ Date unblocked successfully!');
    return true;
}
