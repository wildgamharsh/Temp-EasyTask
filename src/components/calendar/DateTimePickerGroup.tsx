"use client";

import { EnhancedDatePicker } from "./EnhancedDatePicker";
import { EnhancedTimePicker } from "./EnhancedTimePicker";
import { cn } from "@/lib/utils";

interface DateTimePickerGroupProps {
    selectedDate: Date | null;
    onDateChange: (date: Date | null) => void;
    selectedTime: string;
    onTimeChange: (time: string) => void;
    excludeDates?: Date[];
    minDate?: Date;
    maxDate?: Date;
    className?: string;
    disabled?: boolean;
    showAllDay?: boolean;
    isAllDay?: boolean;
    onAllDayChange?: (isAllDay: boolean) => void;
}

export function DateTimePickerGroup({
    selectedDate,
    onDateChange,
    selectedTime,
    onTimeChange,
    excludeDates = [],
    minDate,
    maxDate,
    className,
    disabled = false,
    showAllDay = false,
    isAllDay = false,
    onAllDayChange,
}: DateTimePickerGroupProps) {
    return (
        <div className={cn("space-y-4", className)}>
            {/* Date Picker */}
            <EnhancedDatePicker
                selected={selectedDate}
                onChange={onDateChange}
                excludeDates={excludeDates}
                minDate={minDate}
                maxDate={maxDate}
                label="Select a day"
                disabled={disabled}
            />

            {/* Time Pickers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EnhancedTimePicker
                    value={selectedTime}
                    onChange={onTimeChange}
                    label="Start with"
                    disabled={disabled || isAllDay}
                />

                {/* Optional: End Time Picker */}
                {/* <EnhancedTimePicker
                    value={endTime}
                    onChange={onEndTimeChange}
                    label="End with"
                    disabled={disabled || isAllDay}
                /> */}
            </div>

            {/* All Day Option */}
            {showAllDay && onAllDayChange && (
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="all-day"
                        checked={isAllDay}
                        onChange={(e) => onAllDayChange(e.target.checked)}
                        disabled={disabled}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    />
                    <label
                        htmlFor="all-day"
                        className="text-sm font-medium text-foreground cursor-pointer"
                    >
                        All day
                    </label>
                </div>
            )}
        </div>
    );
}
