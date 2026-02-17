"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface CustomTimePickerProps {
    selectedTime: string | null;
    onTimeSelect: (time: string) => void;
    availableSlots: string[]; // Array of time strings in HH:MM format
}

export function CustomTimePicker({
    selectedTime,
    onTimeSelect,
    availableSlots,
}: CustomTimePickerProps) {
    const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

    // Convert 24h time to 12h format
    const convertTo12Hour = (time24: string): { hour: number; minute: string; period: 'AM' | 'PM' } => {
        const [hours, minutes] = time24.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const hour = hours % 12 || 12;
        return { hour, minute: minutes.toString().padStart(2, '0'), period };
    };

    // Group available slots by period
    const slotsByPeriod = availableSlots.reduce((acc, slot) => {
        const { period } = convertTo12Hour(slot);
        if (!acc[period]) acc[period] = [];
        acc[period].push(slot);
        return acc;
    }, {} as Record<'AM' | 'PM', string[]>);

    const currentSlots = slotsByPeriod[period] || [];

    return (
        <div className="w-full space-y-4">
            {/* AM/PM Toggle */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                    onClick={() => setPeriod('AM')}
                    className={cn(
                        "flex-1 py-2 px-4 rounded-md font-semibold transition-all",
                        period === 'AM'
                            ? "bg-pink-500 text-white shadow-md"
                            : "text-gray-600 hover:text-gray-900"
                    )}
                >
                    Morning (AM)
                </button>
                <button
                    onClick={() => setPeriod('PM')}
                    className={cn(
                        "flex-1 py-2 px-4 rounded-md font-semibold transition-all",
                        period === 'PM'
                            ? "bg-pink-500 text-white shadow-md"
                            : "text-gray-600 hover:text-gray-900"
                    )}
                >
                    Afternoon/Evening (PM)
                </button>
            </div>

            {/* Time Slots Grid */}
            {currentSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-2">
                    {currentSlots.map(slot => {
                        const { hour, minute } = convertTo12Hour(slot);
                        const displayTime = `${hour}:${minute}`;
                        const isSelected = selectedTime === slot;

                        return (
                            <button
                                key={slot}
                                onClick={() => onTimeSelect(slot)}
                                className={cn(
                                    "py-3 px-4 rounded-lg font-semibold transition-all text-sm",
                                    "border-2",
                                    isSelected
                                        ? "bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-500/30 scale-105"
                                        : "bg-white text-gray-700 border-gray-200 hover:border-pink-300 hover:bg-pink-50 hover:scale-105"
                                )}
                            >
                                {displayTime}
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className="flex items-center justify-center py-12 text-gray-400">
                    <p>No available time slots for {period === 'AM' ? 'morning' : 'afternoon/evening'}</p>
                </div>
            )}

            {/* Selected Time Display */}
            {selectedTime && (
                <div className="p-4 rounded-lg bg-pink-50 border-2 border-pink-200">
                    <p className="text-sm text-gray-600 mb-1">Selected Time</p>
                    <p className="text-lg font-bold text-pink-600">
                        {(() => {
                            const { hour, minute, period } = convertTo12Hour(selectedTime);
                            return `${hour}:${minute} ${period}`;
                        })()}
                    </p>
                </div>
            )}
        </div>
    );
}
