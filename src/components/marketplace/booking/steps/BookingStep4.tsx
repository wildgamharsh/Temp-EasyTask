"use client";

import { Booking, Service, TaxRate } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
// import { createBooking } from "@/lib/supabase-data"; // Removed
import { useState, useEffect } from "react";
import { Loader2, CheckCircle, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PricingBreakdown } from "../PricingBreakdown";

interface BookingStepProps {
    service: any;
    pricingConfig?: any; // Added
    bookingData: Partial<Booking>;
    onClose: () => void;
    isQuoteMode?: boolean;
}

export function BookingStep4({ service, pricingConfig, bookingData, onClose, isQuoteMode }: BookingStepProps) {
    // ... (lines 19-97 unchanged)
    // Actually I can only replace the props and the usages.
    // Let's replace the whole top part of function if needed or just chunks.
    // I will replace the Interface and component signature first.

    const [isProcessing, setIsProcessing] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    // const [userProfile, setUserProfile] = useState<{ name: string; email: string } | null>(null); // Removed unused
    const [fetchedOrganizerName, setFetchedOrganizerName] = useState<string | null>(null);
    const [bookingId, setBookingId] = useState<string | null>(null);



    useEffect(() => {
        const loadData = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                // Try fetching from customers first as they are the ones booking
                const { data: userProf } = await supabase
                    .from('customers')
                    .select('name, email')
                    .eq('id', user.id)
                    .single();

                if (userProf) {
                    // setUserProfile({ name: userProf.name, email: userProf.email });
                } else {
                    // Check if they are an organizer (shouldn't book, but for name display)
                    const { data: orgProf } = await supabase.from('organizers').select('name').eq('id', user.id).single();
                }
            }

            if (service.organizerId) {
                const { data: profile } = await supabase
                    .from('organizers')
                    .select('business_name, name')
                    .eq('id', service.organizerId)
                    .single();

                if (profile) {
                    setFetchedOrganizerName(profile.business_name || profile.name);
                }
            }
        };
        loadData();
    }, [service.organizerId]);

    const handlePayment = async () => {
        console.log("Starting handlePayment...");
        setIsProcessing(true);
        try {
            console.log("Debug: Checking preconditions...");

            if (!bookingData.service_id || !service.organizerId) {
                console.error("Debug Error: Missing info", { serviceId: bookingData.service_id, organizerId: service.organizerId });
                throw new Error("Missing required booking information.");
            }
            if (!userId) {
                console.error("Debug Error: No userId");
                throw new Error("You must be logged in to create a booking.");
            }
            if (userId === service.organizerId) {
                console.error("Debug Error: Self-booking");
                throw new Error("Organizers cannot book their own services.");
            }

            const supabase = createClient();

            // Verify user is a customer
            const { data: customer, error: profileError } = await supabase
                .from('customers')
                .select('id')
                .eq('id', userId)
                .single();

            if (profileError || !customer) {
                console.error("Debug Error: Not a customer", profileError);
                throw new Error("Only customers can create bookings.");
            }

            if (isQuoteMode) {
                // --- QUOTE PATH ---
                const { requestQuote } = await import("@/lib/quote-actions");

                // Prepare simpler payload for quote snapshot
                const quotePayload = {
                    service_id: bookingData.service_id || service.id,
                    service_name: bookingData.service_name || service.title,
                    event_date: bookingData.event_date,
                    event_time: bookingData.event_time, // Kept for compat
                    start_time: bookingData.start_time, // Added for range display
                    end_time: bookingData.end_time,     // Added for range display
                    organizer_id: service.organizerId,

                    // Specifics
                    selection_state: bookingData.selection_state || {},
                    step_quantities: bookingData.step_quantities || {},

                    // Snapshot needed for reconstruction. 
                    // Use the fetched pricingConfig which contains the steps.
                    configuration_snapshot: pricingConfig || service
                };

                const result = await requestQuote(
                    bookingData.service_id || service.id,
                    service.organizerId,
                    quotePayload,
                    window.location.pathname
                );

                if (result.success && result.conversationId) {
                    setBookingId(result.conversationId); // Use conversionId as ref
                    setIsConfirmed(true);
                } else {
                    throw new Error("Failed to start quote request.");
                }

            } else {
                // --- BOOKING PATH ---
                const payload = {
                    serviceId: bookingData.service_id || service.id,
                    serviceName: bookingData.service_name || service.title,
                    organizerId: service.organizerId,
                    organizerName: fetchedOrganizerName || "Provider",
                    eventDate: bookingData.event_date,
                    startTime: bookingData.start_time,
                    endTime: bookingData.end_time,
                    location: bookingData.location,
                    // guestCount removed
                    // notes removed

                    // Pricing details for initial context (API will validate)
                    pricingModel: service.pricing_model || "fixed",
                    pricingDisplay: !isQuoteMode, // Pass the display preference

                    // New Schema Fields
                    selectionState: bookingData.selection_state || {},
                    stepQuantities: bookingData.step_quantities || {},

                    draftId: (bookingData as Partial<Booking> & { draftId?: string }).draftId
                };

                const response = await fetch('/api/bookings/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Failed to create booking");
                }

                if (result.success && result.bookingId) {
                    setBookingId(result.bookingId);
                    setIsConfirmed(true);
                } else {
                    throw new Error("Failed to create booking.");
                }
            }
        } catch (e: unknown) {
            console.error("Booking failed exception:", e);
            const errorMessage = e instanceof Error ? e.message : "Something went wrong.";
            alert(`Error: ${errorMessage}`);
        } finally {
            setIsProcessing(false);
        }
    };

    if (isConfirmed) {
        return (
            <div className="text-center py-10 space-y-6">
                <div className={`w-20 h-20 ${isQuoteMode ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'} rounded-full flex items-center justify-center mx-auto shadow-inner`}>
                    <CheckCircle className="w-10 h-10" />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                        {isQuoteMode ? "Quote Requested!" : "Booking Requested!"}
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">
                        {isQuoteMode
                            ? "Negotiation started. Check your messages."
                            : "Your request is pending organizer approval."}
                    </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 max-w-sm mx-auto flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {isQuoteMode ? "Chat ID" : "Reference ID"}
                    </span>
                    <code className="text-sm font-black text-primary bg-primary/5 px-3 py-1 rounded-lg border border-primary/10">
                        {bookingId?.split('-')[0].toUpperCase()}
                    </code>
                </div>
                <div className="flex flex-col gap-3 max-w-xs mx-auto pt-4">
                    {isQuoteMode ? (
                        <Button asChild className="bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 text-white rounded-2xl h-12 font-bold transition-all">
                            {/* Redirect to dashboard/messages because storefront messages might differ by subdomain logic, 
                                but safe bet is usually /dashboard/messages for Customer? 
                                Actually for Storefront flow, it's usually /storefront/[subdomain]/customer/messages 
                                But we don't have subdomain easily here. 
                                Let's assume generic Customer Dashboard for robust redirect or use window.location logic above in button? 
                                'View My Requests' links to /customer/bookings.
                                Quote should link to /customer/messages or relevant path.
                             */}
                            <a href={`/customer/messages?conversation=${bookingId}`}>Go to Chat</a>
                        </Button>
                    ) : (
                        <Button asChild className="bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 rounded-2xl h-12 font-bold transition-all">
                            <a href="/customer/bookings">View My Requests</a>
                        </Button>
                    )}

                    <Button variant="ghost" onClick={onClose} className="rounded-2xl h-12 text-slate-400 hover:text-slate-900 font-bold">
                        Return to Market
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pt-2">
                <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">{isQuoteMode ? "Request Quote" : "Request Booking"}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                        {isQuoteMode ? "Start Negotiation" : "Send Request to Organizer"}
                    </p>
                </div>
                <ShieldCheck className="h-8 w-8 text-primary" />
            </div>

            {/* Premium Pricing Breakdown Removed */}

            {/* Secure Promise */}
            <div className="p-5 border border-primary/10 bg-primary/5 rounded-2xl flex items-start gap-3 shadow-inner shadow-primary/5">
                <div className="bg-primary/20 p-2 rounded-xl text-primary">
                    <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                    <h5 className="text-sm font-bold text-primary">Booking Verification</h5>
                    <p className="text-[11px] text-primary/70 mt-0.5 leading-relaxed font-medium">
                        {isQuoteMode
                            ? "You are starting a price negotiation. No charge will be made until you accept a final proposal."
                            : "Your booking request will be sent to the organizer. You will be notified once they confirm or decline."
                        }
                    </p>
                </div>
            </div>

            <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 rounded-2xl text-primary-foreground group transition-all active:scale-[0.98]"
            >
                {isProcessing ? (
                    <div className="flex items-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Sending Request...</span>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2">
                        {isQuoteMode ? "Send Quote Request" : "Send Booking Request"}
                        <div className="h-1 w-1 rounded-full bg-white/40 animate-pulse" />
                    </div>
                )}
            </Button>

            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                By clicking "Send Request", you agree to the EasyTask Terms of Service
            </p>
        </div>
    );
}
