"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CustomerProfile, CustomerProfileData } from "@/components/dashboard/customers/CustomerProfile";
import { CustomerBookingHistory } from "@/components/dashboard/customers/CustomerBookingHistory";
import { Booking } from "@/lib/database.types";
import { startConversation } from "@/lib/supabase-chat";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/BackButton";
import { BookingOverviewModal } from "@/components/booking/BookingOverviewModal";

export default function CustomerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();
    const customerId = params.id as string;

    const [profile, setProfile] = useState<CustomerProfileData | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    useEffect(() => {
        async function loadCustomerData() {
            if (!customerId) return;
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch bookings to verify relationship and get booking history
            const { data: bookingsData, error: bookingsError } = await supabase
                .from('bookings')
                .select('*')
                .eq('organizer_id', user.id)
                .eq('customer_id', customerId)
                .order('event_date', { ascending: false });

            if (bookingsError) {
                console.error("Error loading bookings:", bookingsError);
                return;
            }

            // 2. Fetch customer profile details
            // Note: Since we don't have a direct "customers" table with extra info, we rely on 'profiles'
            // or the first booking info for fallback.
            // 2. Fetch customer profile details
            const { data: profileData, error: profileError } = await supabase
                .from('customers')
                .select('*')
                .eq('id', customerId)
                .single();

            if (profileError && !bookingsData?.length) {
                console.error("Error loading profile:", profileError);
                // Handle 404
            }

            // Construct Profile Data
            const firstBooking = bookingsData?.[0]; // Most recent
            const profileSource = profileData || {};

            const customerProfile: CustomerProfileData = {
                id: customerId,
                name: profileSource.name || firstBooking?.customer_name || "Unknown Customer",
                email: profileSource.email || firstBooking?.customer_email || "",
                phone: undefined, // Phone not currently in customers table
                avatarUrl: undefined, // Avatar not currently in customers table
                createdAt: profileSource.created_at || new Date().toISOString(),
                totalBookings: bookingsData?.length || 0,
                lastBookingDate: firstBooking ? new Date(firstBooking.event_date) : undefined,
                location: profileSource.location // If exists
            };

            setProfile(customerProfile);
            setBookings(bookingsData as Booking[] || []);
            setIsLoading(false);
        }

        loadCustomerData();
    }, [customerId, supabase, router]);

    const handleMessage = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            // 1:1 consistent chat
            const conversationId = await startConversation(customerId, user.id, undefined);
            router.push(`/dashboard/messages?conversation=${conversationId}`);
        } catch (e) {
            console.error("Failed to start conversation", e);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading customer details...</div>;
    }

    if (!profile) {
        return <div className="p-8 text-center">Customer not found.</div>;
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center gap-4 mb-4">
                <BackButton />
                <h2 className="text-3xl font-bold tracking-tight">Customer Details</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_2fr] lg:grid-cols-[300px_1fr]">
                <div className="space-y-4">
                    <CustomerProfile profile={profile} onMessage={handleMessage} />
                </div>
                <div className="space-y-4">
                    <CustomerBookingHistory
                        bookings={bookings}
                        onViewBooking={(id) => {
                            const booking = bookings.find(b => b.id === id);
                            if (booking) {
                                setSelectedBooking(booking);
                                setIsBookingModalOpen(true);
                            }
                        }}
                    />
                </div>
            </div>

            <BookingOverviewModal
                booking={selectedBooking as any}
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                userRole="organizer"
            />
        </div>
    );
}
