"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Calendar, Clock, DollarSign, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useBooking } from '@/contexts/BookingContext';
import { formatCAD } from '@/lib/canadian-tax';
import { createClient } from '@/lib/supabase/client';

interface Step4Props {
    serviceId: string;
    serviceName: string;
    organizerId: string;
    organizerName: string;
    subdomain: string;
    onSuccess: () => void;
}

export function Step4Payment({
    serviceId,
    serviceName,
    organizerId,
    organizerName,
    subdomain,
    onSuccess,
}: Step4Props) {
    const supabase = createClient();
    const [user, setUser] = useState<any>(null);
    const { state, setNotes, previousStep, clearDraft } = useBooking();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setUser(user);
        });
    }, []);

    const handleConfirmBooking = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            const response = await fetch('/api/bookings/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceId,
                    serviceName,
                    organizerId,
                    organizerName,
                    eventDate: state.eventDate?.toISOString().split('T')[0],
                    eventTime: state.eventTime,
                    guestCount: state.guestCount,
                    notes: state.notes,
                    pricingModel: state.pricingModel,
                    selectedPackageId: state.selectedPackageId,
                    selectedAddonIds: state.selectedAddonIds,
                    subtotal: state.subtotal,
                    taxAmount: state.taxAmount,
                    totalAmount: state.finalTotal,
                    discountAmount: state.discountAmount,
                    promoCodeId: state.promoCodeId,
                    draftId: state.draftId,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setBookingId(data.bookingId);
                setIsComplete(true);
                clearDraft();

                // Close modal after 3 seconds
                setTimeout(() => {
                    onSuccess();
                }, 3000);
            } else {
                setError(data.error || 'Failed to create booking');
            }
        } catch (err) {
            console.error('Booking creation error:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isComplete) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>

                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h3>
                    <p className="text-gray-600">Your booking has been successfully created</p>
                    {bookingId && (
                        <p className="text-sm text-gray-500">Booking ID: {bookingId.slice(0, 8)}</p>
                    )}
                </div>

                <Card className="w-full max-w-md border-2 border-green-200 bg-green-50">
                    <CardContent className="pt-6 space-y-3">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="text-sm text-gray-600">Event Date</p>
                                <p className="font-semibold text-gray-900">
                                    {state.eventDate?.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="text-sm text-gray-600">Event Time</p>
                                <p className="font-semibold text-gray-900">{state.eventTime}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="text-sm text-gray-600">Total Paid</p>
                                <p className="font-semibold text-gray-900">{formatCAD(state.finalTotal)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-sm text-gray-500">
                    A confirmation email has been sent to {user?.email}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm & Pay</h3>
                <p className="text-gray-600">Review your booking and complete payment</p>
            </div>

            {/* Payment Info */}
            <Card className="border-2 border-pink-100 bg-gradient-to-br from-pink-50 to-white">
                <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="text-3xl font-bold text-pink-600">{formatCAD(state.finalTotal)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Payment Method</p>
                            <p className="font-semibold text-gray-900">Auto-Processed</p>
                            <p className="text-xs text-gray-500">(Development Mode)</p>
                        </div>
                    </div>

                    {state.discountAmount > 0 && (
                        <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                            <p className="text-sm text-green-700">
                                You saved {formatCAD(state.discountAmount)} with promo code <strong>{state.promoCode}</strong>
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card className="border-2 border-pink-100">
                <CardContent className="pt-6 space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                        Additional Notes (Optional)
                    </label>
                    <Textarea
                        value={state.notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any special requests or requirements for your event..."
                        rows={4}
                        className="resize-none"
                    />
                </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
                <Card className="border-2 border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <p className="text-red-700">{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Booking Summary */}
            <Card className="border-2 border-gray-200">
                <CardContent className="pt-6 space-y-2">
                    <p className="text-sm font-medium text-gray-700 mb-3">Booking Summary</p>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Service</span>
                            <span className="font-medium text-gray-900">{serviceName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Date</span>
                            <span className="font-medium text-gray-900">
                                {state.eventDate?.toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Time</span>
                            <span className="font-medium text-gray-900">{state.eventTime}</span>
                        </div>
                        {state.pricingModel === 'per_person' && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Guests</span>
                                <span className="font-medium text-gray-900">{state.guestCount}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
                <Button
                    onClick={previousStep}
                    variant="outline"
                    disabled={isProcessing}
                    className="flex-1 h-12 text-base font-semibold rounded-xl border-2 border-gray-300"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Button
                    onClick={handleConfirmBooking}
                    disabled={isProcessing}
                    className="flex-1 h-12 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Confirm Booking
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
