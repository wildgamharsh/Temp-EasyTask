"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useBooking } from '@/contexts/BookingContext';
import { CustomDatePicker } from '@/components/booking/pickers/CustomDatePicker';
import { CustomTimePicker } from '@/components/booking/pickers/CustomTimePicker';

interface Step2Props {
    organizerId: string;
    serviceId: string;
}

export function Step2PlanEvent({ organizerId, serviceId }: Step2Props) {
    const { state, setEventDetails, nextStep, previousStep } = useBooking();
    const [selectedDate, setSelectedDate] = useState<Date | null>(state.eventDate);
    const [selectedTime, setSelectedTime] = useState<string | null>(state.eventTime);
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [isLoadingDates, setIsLoadingDates] = useState(false);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    // Load available dates for current month
    useEffect(() => {
        const now = new Date();
        loadAvailableDates(now.getMonth() + 1, now.getFullYear());
    }, [organizerId, serviceId]);

    // Load available time slots when date changes
    useEffect(() => {
        if (selectedDate) {
            loadAvailableTimeSlots(selectedDate);
        }
    }, [selectedDate, organizerId]);

    const loadAvailableDates = async (month: number, year: number) => {
        setIsLoadingDates(true);
        try {
            const response = await fetch(
                `/api/bookings/availability?organizerId=${organizerId}&serviceId=${serviceId}&month=${month}&year=${year}`
            );
            const data = await response.json();
            setAvailableDates(data.availableDates || []);
        } catch (error) {
            console.error('Failed to load available dates:', error);
        } finally {
            setIsLoadingDates(false);
        }
    };

    const loadAvailableTimeSlots = async (date: Date) => {
        setIsLoadingSlots(true);
        try {
            const response = await fetch('/api/bookings/availability/times', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    organizerId,
                    date: date.toISOString().split('T')[0],
                    eventDuration: 240, // 4 hours default
                }),
            });
            const data = await response.json();
            setAvailableSlots(data.availableSlots || []);
        } catch (error) {
            console.error('Failed to load time slots:', error);
        } finally {
            setIsLoadingSlots(false);
        }
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setSelectedTime(null); // Reset time when date changes
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
    };

    const handleContinue = () => {
        if (selectedDate && selectedTime) {
            setEventDetails(selectedDate, selectedTime);
            nextStep();
        }
    };

    const canContinue = selectedDate && selectedTime;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Plan Your Event</h3>
                <p className="text-gray-600">Choose your preferred date and time</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Date Picker */}
                <Card className="border-2 border-pink-100">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-5 h-5 text-pink-500" />
                            <h4 className="font-semibold text-gray-900">Select Date</h4>
                        </div>

                        {isLoadingDates ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
                            </div>
                        ) : (
                            <CustomDatePicker
                                selectedDate={selectedDate}
                                onDateSelect={handleDateSelect}
                                availableDates={availableDates}
                                onMonthChange={loadAvailableDates}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Time Picker */}
                <Card className="border-2 border-pink-100">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="w-5 h-5 text-pink-500" />
                            <h4 className="font-semibold text-gray-900">Select Time</h4>
                        </div>

                        {!selectedDate ? (
                            <div className="flex items-center justify-center py-12 text-gray-400">
                                <p>Please select a date first</p>
                            </div>
                        ) : isLoadingSlots ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
                            </div>
                        ) : (
                            <CustomTimePicker
                                selectedTime={selectedTime}
                                onTimeSelect={handleTimeSelect}
                                availableSlots={availableSlots}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Selected Summary */}
            {selectedDate && selectedTime && (
                <Card className="border-2 border-pink-200 bg-pink-50">
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600 mb-2">Your Event</p>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-pink-600" />
                                <span className="font-semibold text-gray-900">
                                    {selectedDate.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-pink-600" />
                                <span className="font-semibold text-gray-900">{selectedTime}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

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
                    onClick={handleContinue}
                    disabled={!canContinue}
                    className="flex-1 h-12 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300"
                >
                    Continue to Review
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}
