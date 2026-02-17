"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CustomersTable, CustomerSummary } from "@/components/dashboard/customers/CustomersTable";
import { BookingStatus } from "@/lib/database.types";
import { startConversation } from "@/lib/supabase-chat";

export default function CustomersPage() {
    const [customers, setCustomers] = useState<CustomerSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        async function loadCustomers() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch customers for this organizer directly
            const { data: customersData, error } = await supabase
                .from('customers')
                .select(`
                    id,
                    email,
                    name,
                    created_at,
                    organizer_id,
                    bookings (
                        id,
                        status,
                        event_date
                    )
                `)
                .eq('organizer_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error loading bookings:", error);
                setIsLoading(false);
                return;
            }

            // Map data to summary
            const summaries: CustomerSummary[] = (customersData || []).map((customer: any) => {
                const bookings = customer.bookings || [];
                const statusBreakdown = {
                    pending: 0,
                    confirmed: 0,
                    completed: 0,
                    cancelled: 0,
                    rejected: 0,
                    in_progress: 0,
                    completion_pending: 0
                };

                let lastBookingDate: Date | undefined = undefined;

                bookings.forEach((b: any) => {
                    // Update stats
                    const status = b.status as BookingStatus;
                    if ((statusBreakdown as any)[status] !== undefined) {
                        (statusBreakdown as any)[status]++;
                    }

                    // Update last booking date
                    const date = new Date(b.event_date);
                    if (!lastBookingDate || date > lastBookingDate) {
                        lastBookingDate = date;
                    }
                });

                return {
                    id: customer.id,
                    name: customer.name,
                    email: customer.email,
                    totalBookings: bookings.length,
                    statusBreakdown,
                    lastBookingDate,
                    createdAt: customer.created_at
                };
            });

            setCustomers(summaries);
            setIsLoading(false);
        }

        loadCustomers();
    }, [supabase]);

    const handleViewCustomer = (id: string) => {
        router.push(`/dashboard/customers/${id}`);
    };

    const handleMessageCustomer = async (id: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            // Start or get persistent chat (no booking_id linked to make it general)
            // Note: startConversation usually takes bookingId optionally. 
            // We pass undefined for bookingId to create/get a general chat or find existing.
            const conversationId = await startConversation(id, user.id, undefined);
            router.push(`/dashboard/messages?conversation=${conversationId}`);
        } catch (e) {
            console.error("Failed to start conversation", e);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading customers...</div>;
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
            </div>
            <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
                <CustomersTable
                    data={customers}
                    onViewCustomer={handleViewCustomer}
                    onMessageCustomer={handleMessageCustomer}
                />
            </div>
        </div>
    );
}
