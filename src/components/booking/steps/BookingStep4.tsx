"use client";

import { Booking, Service } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { createBooking } from "@/lib/supabase-data";
import { useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";

interface BookingStepProps {
    service: Service;
    bookingData: Partial<Booking>;
    onClose: () => void;
}

export function BookingStep4({ service, bookingData, onClose }: BookingStepProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);

    const handlePayment = async () => {
        setIsProcessing(true);
        try {
            // Mock payment delay
            await new Promise(r => setTimeout(r, 2000));

            // Create booking in DB
            /* 
               Note: `bookingData` is likely incomplete as per `LegacyBooking` type constraints 
               (missing customerId, etc. if not logged in). 
               Real implementation deals with authenticated user session.
               We'll mock the success for the interaction demo.
            */

            // await createBooking(bookingData as any); 

            setIsConfirmed(true);
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };

    if (isConfirmed) {
        return (
            <div className="text-center py-12 space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                    <CheckCircle className="w-10 h-10" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-800">Booking Confirmed!</h3>
                    <p className="text-slate-500">Your event has been successfully booked.</p>
                </div>
                <Button onClick={onClose} className="bg-brand-600 hover:bg-brand-700">
                    Done
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">Payment</h3>
                <p className="text-sm text-slate-500">Securely pay for your booking.</p>
            </div>

            <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-center">
                <p className="text-slate-500 mb-4">Payment Gateway Integration Placeholder</p>
                <div className="text-2xl font-bold text-slate-900 mb-2">
                    ${bookingData.total_price?.toFixed(2)}
                </div>
            </div>

            <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Processing...
                    </>
                ) : (
                    "Pay Now"
                )}
            </Button>
        </div>
    );
}
