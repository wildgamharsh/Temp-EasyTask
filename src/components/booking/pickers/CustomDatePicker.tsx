"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CustomDatePickerProps {
    selectedDate: Date | null;
    onDateSelect: (date: Date) => void;
    availableDates: string[]; // ISO date strings
    onMonthChange?: (month: number, year: number) => void;
}

export function CustomDatePicker({
    selectedDate,
    onDateSelect,
    availableDates,
    onMonthChange,
}: CustomDatePickerProps) {
    const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

    const availableDatesSet = new Set(availableDates);

    const daysInMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0
    ).getDate();

    const firstDayOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
    ).getDay();

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const handlePreviousMonth = () => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() - 1);
        setCurrentMonth(newMonth);
        onMonthChange?.(newMonth.getMonth() + 1, newMonth.getFullYear());
    };

    const handleNextMonth = () => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() + 1);
        setCurrentMonth(newMonth);
        onMonthChange?.(newMonth.getMonth() + 1, newMonth.getFullYear());
    };

    const handleDateClick = (day: number) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dateStr = date.toISOString().split('T')[0];

        if (availableDatesSet.has(dateStr)) {
            onDateSelect(date);
        }
    };

    const isDateAvailable = (day: number): boolean => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dateStr = date.toISOString().split('T')[0];
        return availableDatesSet.has(dateStr);
    };

    const isDateSelected = (day: number): boolean => {
        if (!selectedDate) return false;
        return (
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === currentMonth.getMonth() &&
            selectedDate.getFullYear() === currentMonth.getFullYear()
        );
    };

    const isToday = (day: number): boolean => {
        const today = new Date();
        return (
            today.getDate() === day &&
            today.getMonth() === currentMonth.getMonth() &&
            today.getFullYear() === currentMonth.getFullYear()
        );
    };

    // Generate calendar grid
    const calendarDays: (number | null)[] = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }

    return (
        <div className="w-full">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
                <Button
                    onClick={handlePreviousMonth}
                    variant="ghost"
                    size="icon"
                    className="hover:bg-pink-50"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Button>

                <h3 className="text-lg font-bold text-gray-900">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>

                <Button
                    onClick={handleNextMonth}
                    variant="ghost"
                    size="icon"
                    className="hover:bg-pink-50"
                >
                    <ChevronRight className="w-5 h-5" />
                </Button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                    <div
                        key={day}
                        className="text-center text-xs font-semibold text-gray-500 py-2"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                    if (day === null) {
                        return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    const available = isDateAvailable(day);
                    const selected = isDateSelected(day);
                    const today = isToday(day);

                    return (
                        <button
                            key={day}
                            onClick={() => handleDateClick(day)}
                            disabled={!available}
                            className={cn(
                                "aspect-square rounded-lg text-sm font-medium transition-all",
                                "flex items-center justify-center",
                                available && !selected && "hover:bg-pink-100 hover:scale-105",
                                selected && "bg-pink-500 text-white shadow-lg shadow-pink-500/30 scale-105",
                                !available && "text-gray-300 cursor-not-allowed",
                                available && !selected && "text-gray-700",
                                today && !selected && "ring-2 ring-pink-300"
                            )}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-pink-500" />
                    <span>Selected</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded ring-2 ring-pink-300" />
                    <span>Today</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-gray-200" />
                    <span>Unavailable</span>
                </div>
            </div>
        </div>
    );
}
