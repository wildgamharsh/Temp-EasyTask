"use client";

import { TimeSlotDropdown } from "./TimeSlotDropdown";

interface EnhancedTimePickerProps {
    value: string;
    onChange: (time: string) => void;
    label?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function EnhancedTimePicker({
    value,
    onChange,
    label,
    placeholder,
    className,
    disabled = false,
}: EnhancedTimePickerProps) {
    return (
        <TimeSlotDropdown
            value={value}
            onChange={onChange}
            label={label}
            placeholder={placeholder}
            className={className}
            disabled={disabled}
        />
    );
}


