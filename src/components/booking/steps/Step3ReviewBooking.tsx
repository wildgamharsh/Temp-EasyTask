"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Check, Package, Calendar, Clock, Users, Tag, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useBooking } from '@/contexts/BookingContext';
import { formatCAD } from '@/lib/canadian-tax';
import { cn } from '@/lib/utils';

interface Step3Props {
    serviceName: string;
    organizerId: string;
    organizerName: string;
}

export function Step3ReviewBooking({ serviceName, organizerId, organizerName }: Step3Props) {
    const { state, setPromoCode, nextStep, previousStep, goToStep } = useBooking();
    const [promoCodeInput, setPromoCodeInput] = useState(state.promoCode || '');
    const [isValidating, setIsValidating] = useState(false);
    const [promoError, setPromoError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setUserId(user.id);
        });
    }, []);

    const handleValidatePromo = async () => {
        if (!promoCodeInput.trim()) {
            setPromoError('Please enter a promo code');
            return;
        }

        setIsValidating(true);
        setPromoError(null);

        try {
            const response = await fetch('/api/bookings/validate-promo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: promoCodeInput,
                    subtotal: state.subtotal,
                    organizerId,
                    userId: userId || 'anonymous',
                }),
            });

            const data = await response.json();

            if (data.valid) {
                setPromoCode(
                    promoCodeInput,
                    data.promoCode?.id || null,
                    data.discountAmount || 0
                );
                setPromoError(null);
            } else {
                setPromoError(data.error || 'Invalid promo code');
                setPromoCode(null, null, 0);
            }
        } catch (error) {
            console.error('Promo validation error:', error);
            setPromoError('Failed to validate promo code');
        } finally {
            setIsValidating(false);
        }
    };

    const handleRemovePromo = () => {
        setPromoCodeInput('');
        setPromoCode(null, null, 0);
        setPromoError(null);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Review Your Booking</h3>
                <p className="text-gray-600">Confirm your selections and apply any promo codes</p>
            </div>

            {/* Service Details */}
            <Card className="border-2 border-pink-100">
                <CardContent className="pt-6 space-y-4">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Service</p>
                        <p className="font-semibold text-gray-900">{serviceName}</p>
                        <p className="text-sm text-gray-600">{organizerName}</p>
                    </div>

                    <Separator />

                    {/* Event Details */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-pink-500" />
                            <div>
                                <p className="text-sm text-gray-500">Event Date</p>
                                <p className="font-semibold text-gray-900">
                                    {state.eventDate?.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    }) || 'Not selected'}
                                </p>
                            </div>
                            <button
                                onClick={() => goToStep(2)}
                                className="ml-auto text-sm text-pink-600 hover:text-pink-700 font-medium"
                            >
                                Edit
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-pink-500" />
                            <div>
                                <p className="text-sm text-gray-500">Event Time</p>
                                <p className="font-semibold text-gray-900">{state.eventTime || 'Not selected'}</p>
                            </div>
                        </div>

                        {state.pricingModel === 'per_person' && (
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-pink-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Guest Count</p>
                                    <p className="font-semibold text-gray-900">{state.guestCount} guests</p>
                                </div>
                                <button
                                    onClick={() => goToStep(1)}
                                    className="ml-auto text-sm text-pink-600 hover:text-pink-700 font-medium"
                                >
                                    Edit
                                </button>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Pricing Details */}
                    <div className="space-y-2">
                        {state.selectedPackage && (
                            <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">Package:</span>
                                <span className="text-sm font-medium text-gray-900">{state.selectedPackage.name}</span>
                                <span className="ml-auto text-sm font-semibold">{formatCAD(state.selectedPackage.price)}</span>
                            </div>
                        )}

                        {state.selectedAddons.length > 0 && (
                            <div className="space-y-1">
                                <p className="text-sm text-gray-600">Add-ons:</p>
                                {state.selectedAddons.map(addon => (
                                    <div key={addon.id} className="flex items-center justify-between pl-6">
                                        <span className="text-sm text-gray-700">{addon.name}</span>
                                        <span className="text-sm font-medium">{formatCAD(addon.price)}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => goToStep(1)}
                            className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                        >
                            Edit selections
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Promo Code */}
            <Card className="border-2 border-pink-100">
                <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-5 h-5 text-pink-500" />
                        <h4 className="font-semibold text-gray-900">Promo Code</h4>
                    </div>

                    {state.promoCode ? (
                        <div className="p-4 rounded-lg bg-green-50 border-2 border-green-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-green-900">{state.promoCode}</p>
                                    <p className="text-sm text-green-700">
                                        Discount: -{formatCAD(state.discountAmount)}
                                    </p>
                                </div>
                                <button
                                    onClick={handleRemovePromo}
                                    className="text-sm text-green-700 hover:text-green-800 font-medium underline"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <Input
                                    value={promoCodeInput}
                                    onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                                    placeholder="Enter promo code"
                                    className="flex-1"
                                    disabled={isValidating}
                                />
                                <Button
                                    onClick={handleValidatePromo}
                                    disabled={isValidating || !promoCodeInput.trim()}
                                    className="bg-pink-500 hover:bg-pink-600"
                                >
                                    {isValidating ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        'Apply'
                                    )}
                                </Button>
                            </div>
                            {promoError && (
                                <p className="text-sm text-red-600">{promoError}</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Price Summary */}
            <Card className="border-2 border-pink-200 bg-pink-50">
                <CardContent className="pt-6 space-y-3">
                    <div className="flex justify-between text-gray-700">
                        <span>Subtotal</span>
                        <span className="font-semibold">{formatCAD(state.subtotal)}</span>
                    </div>

                    {state.discountAmount > 0 && (
                        <div className="flex justify-between text-green-700">
                            <span>Discount</span>
                            <span className="font-semibold">-{formatCAD(state.discountAmount)}</span>
                        </div>
                    )}

                    {state.taxAmount > 0 && (
                        <div className="flex justify-between text-gray-700">
                            <span>Tax</span>
                            <span className="font-semibold">{formatCAD(state.taxAmount)}</span>
                        </div>
                    )}

                    <Separator />

                    <div className="flex justify-between text-xl font-bold text-gray-900">
                        <span>Total</span>
                        <span className="text-pink-600">{formatCAD(state.finalTotal)}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
                <Button
                    onClick={previousStep}
                    variant="outline"
                    className="flex-1 h-12 text-base font-semibold rounded-xl border-2 border-gray-300"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Button
                    onClick={nextStep}
                    className="flex-1 h-12 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all bg-pink-500 hover:bg-pink-600"
                >
                    Continue to Payment
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}
