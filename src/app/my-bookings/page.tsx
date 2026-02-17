"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Booking } from "@/lib/database.types";
import { startConversation } from "@/lib/supabase-chat";
import { BookingDetailModal } from "@/components/booking/BookingDetailModal";
import { customerConfirmCompletion } from "@/lib/booking-actions";
import { ReviewModal } from "@/components/reviews/ReviewModal";
import { Calendar, Clock, MapPin, MessageSquare, User, Loader2 } from "lucide-react";

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Review Modal State
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

    const router = useRouter();
    const supabase = createClient();

    const loadBookings = async () => {
        try {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }

            const { data, error } = await supabase
                .from("bookings")
                .select("*")
                .eq("customer_id", user.id)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching bookings:", error);
                toast.error("Failed to load your bookings");
                return;
            }

            setBookings(data as Booking[]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Load bookings on mount
        loadBookings();

        // Optional: Realtime subscription could go here
    }, []);

    const handleStatusChange = async (bookingId: string, newStatus: string) => {
        try {
            if (newStatus === "completed" || newStatus === "check_completion") {
                // Customer confirming completion
                const updatedBooking = await customerConfirmCompletion(bookingId);

                // Update local state
                setBookings(bookings.map(b => b.id === bookingId ? (updatedBooking as Booking) : b));
                toast.success("Service confirmed as completed");
                setIsDetailsOpen(false);

                // Open Review Modal immediatey
                const booking = bookings.find(b => b.id === bookingId);
                if (booking) {
                    setReviewBooking(booking);
                    setIsReviewOpen(true);
                }
            } else if (newStatus === "cancelled") {
                // Handle cancellation
                const { data, error } = await supabase
                    .from("bookings")
                    .update({ status: 'cancelled' })
                    .eq("id", bookingId)
                    .select()
                    .single();

                if (error) throw error;
                setBookings(bookings.map(b => b.id === bookingId ? (data as Booking) : b));
                toast.success("Booking cancelled");
                setIsDetailsOpen(false);
            }
        } catch (error) {
            console.error("Error updating booking:", error);
            toast.error("Failed to update booking status");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Bookings</h1>
                    <p className="text-slate-500">Manage your appointments and track status.</p>
                </div>

                <div className="grid gap-6">
                    {bookings.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg shadow border border-slate-100">
                            <h3 className="text-lg font-medium text-slate-900">No bookings found</h3>
                            <p className="text-slate-500 mt-2">You haven't made any bookings yet.</p>
                            <Button className="mt-4" onClick={() => router.push("/")}>
                                Browse Services
                            </Button>
                        </div>
                    ) : (
                        bookings.map((booking) => (
                            <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                <CardHeader className="bg-white border-b border-slate-50 pb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg font-semibold text-slate-900">
                                                {booking.service_name}
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-2 mt-1">
                                                <User className="h-4 w-4" /> {booking.organizer_name}
                                            </CardDescription>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className="px-3 py-1 font-medium capitalize"
                                        >
                                            {booking.status.replace("_", " ")}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 grid sm:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Calendar className="h-4 w-4 text-slate-400" />
                                        {new Date(booking.event_date).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Clock className="h-4 w-4 text-slate-400" />
                                        {booking.event_time}
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600 sm:col-span-2">
                                        <span className="font-medium text-slate-900">Total:</span>
                                        ${((booking as any).proposed_price || (booking as any).total_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-slate-50/50 border-t border-slate-100 flex gap-2 justify-end py-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={async () => {
                                            const convId = await startConversation(
                                                booking.customer_id,
                                                booking.organizer_id,
                                                booking.id
                                            );
                                            router.push(`/dashboard/messages?conversation=${convId}`);
                                        }}
                                    >
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Message
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            setSelectedBooking(booking);
                                            setIsDetailsOpen(true);
                                        }}
                                    >
                                        View Details
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            <BookingDetailModal
                booking={selectedBooking}
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                userRole="customer"
                onStatusChange={handleStatusChange}
                onMessage={async () => {
                    if (selectedBooking) {
                        const convId = await startConversation(selectedBooking.customer_id, selectedBooking.organizer_id, selectedBooking.id);
                        router.push(`/dashboard/messages?conversation=${convId}`);
                    }
                }}
            />

            {reviewBooking && (
                <ReviewModal
                    isOpen={isReviewOpen}
                    onClose={() => setIsReviewOpen(false)}
                    bookingId={reviewBooking.id}
                    serviceId={reviewBooking.service_id}
                    organizerId={reviewBooking.organizer_id}
                    serviceName={reviewBooking.service_name}
                />
            )}
        </div>
    );
}
