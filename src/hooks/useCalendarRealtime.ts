import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface CalendarEvent {
    id: string;
    date: string;
    title: string;
    type: 'booking' | 'blocked';
    status?: string;
    customerName?: string;
    serviceName?: string;
}

export function useCalendarRealtime(organizerId: string) {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        // Initial load
        async function loadEvents() {
            if (!organizerId) {
                setEvents([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                // Load bookings
                const { data: bookings, error: bError } = await supabase
                    .from('bookings')
                    .select('*')
                    .eq('organizer_id', organizerId);

                if (bError) throw bError;

                // Load blocked dates
                const { data: blocked, error: dError } = await supabase
                    .from('blocked_dates')
                    .select('*')
                    .eq('organizer_id', organizerId);

                if (dError) throw dError;

                const calendarEvents: CalendarEvent[] = [
                    ...(bookings || []).map(b => ({
                        id: b.id,
                        date: b.event_date,
                        title: b.service_name,
                        type: 'booking' as const,
                        status: b.status,
                        customerName: b.customer_name,
                        serviceName: b.service_name,
                    })),
                    ...(blocked || []).map(b => ({
                        id: b.id,
                        date: b.blocked_date,
                        title: b.reason || 'Unavailable',
                        type: 'blocked' as const,
                    })),
                ];

                setEvents(calendarEvents);
            } catch (error) {
                console.error('Error loading calendar events:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadEvents();

        // Set up real-time subscriptions
        const bookingsChannel = supabase
            .channel('bookings-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookings',
                    filter: `organizer_id=eq.${organizerId}`,
                },
                (payload) => {
                    console.log('Booking change:', payload);
                    loadEvents(); // Reload all events
                }
            )
            .subscribe();

        const blockedChannel = supabase
            .channel('blocked-dates-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'blocked_dates',
                    filter: `organizer_id=eq.${organizerId}`,
                },
                (payload) => {
                    console.log('Blocked date change:', payload);
                    loadEvents(); // Reload all events
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(bookingsChannel);
            supabase.removeChannel(blockedChannel);
        };
    }, [organizerId]);

    return { events, isLoading };
}
