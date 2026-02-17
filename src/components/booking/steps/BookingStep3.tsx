"use client";

import { Booking, Service } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface BookingStepProps {
    service: Service;
    bookingData: Partial<Booking>;
    onNext: (data: Partial<Booking>) => void;
    onBack: () => void;
}

export function BookingStep3({ service, bookingData, onNext, onBack }: BookingStepProps) {
    // Mock calculations or use passed total
    const total = bookingData.total_price || 0;
    const gst = total * 0.05; // 5% GST mock
    const finalTotal = total + gst;

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">Review Your Booking</h3>
                <p className="text-sm text-slate-500">Please review all details before proceeding to payment.</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-4">
                <div className="flex justify-between">
                    <span className="text-slate-600">Service</span>
                    <span className="font-medium">{service.title}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-600">Date & Time</span>
                    <span className="font-medium">
                        {bookingData.event_date ? new Date(bookingData.event_date).toLocaleDateString() : "-"} at {bookingData.event_time}
                    </span>
                </div>
                {/* Show package or guest info */}
                {bookingData.guest_count && (
                    <div className="flex justify-between">
                        <span className="text-slate-600">Guests</span>
                        <span className="font-medium">{bookingData.guest_count}</span>
                    </div>
                )}

                <Separator />

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Subtotal</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">GST (5%)</span>
                        <span>${gst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200 mt-2">
                        <span>Total</span>
                        <span className="text-brand-700">${finalTotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={onBack}>Back</Button>
                <Button onClick={() => onNext({ total_price: finalTotal })} className="bg-brand-600 hover:bg-brand-700 w-full sm:w-auto">
                    Continue to Pricing
                </Button>
            </div>
        </div>
    );
}
