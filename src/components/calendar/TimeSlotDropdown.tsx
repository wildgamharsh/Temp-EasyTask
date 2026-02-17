"use client";

import { useState, useRef, useEffect } from "react";
import { Clock, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeSlot {
    value: string;
    label: string;
}

interface TimeSlotDropdownProps {
    value: string;
    onChange: (time: string) => void;
    label?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

// Generate time slots in 15-minute intervals
const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];

    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            const hourNum = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            const period = hour < 12 ? "AM" : "PM";
            const timeValue = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
            const timeLabel = `${hourNum}:${minute.toString().padStart(2, "0")} ${period}`;

            slots.push({
                value: timeValue,
                label: timeLabel,
            });
        }
    }

    return slots;
};

const TIME_SLOTS = generateTimeSlots();

export function TimeSlotDropdown({
    value,
    onChange,
    label,
    placeholder = "Select time",
    className,
    disabled = false,
}: TimeSlotDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Get display label for selected time
    const getDisplayLabel = () => {
        if (!value) return placeholder;
        const slot = TIME_SLOTS.find((s) => s.value === value);
        return slot ? slot.label : value;
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleSelectTime = (timeValue: string) => {
        onChange(timeValue);
        setIsOpen(false);
    };

    return (
        <div className={cn("relative", className)} ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={cn(
                    "w-full h-14 px-4 rounded-xl border-2 font-medium text-base transition-all",
                    "bg-white dark:bg-background",
                    "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                    "hover:border-primary/50 hover:shadow-sm",
                    "flex items-center gap-3",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    value ? "border-primary/40 text-foreground" : "border-border text-muted-foreground"
                )}
            >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                    <div className="text-xs text-muted-foreground font-normal">Event Time</div>
                    <div className="text-sm font-semibold">
                        {getDisplayLabel()}
                    </div>
                </div>
                <ChevronDown
                    className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-background border-1.5 border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
                    {/* Time Slots - Continuous Single Column List */}
                    <div className="max-h-80 overflow-y-auto p-1.5 flex flex-col gap-1 custom-scrollbar">
                        {TIME_SLOTS.map((slot) => (
                            <button
                                key={slot.value}
                                type="button"
                                onClick={() => handleSelectTime(slot.value)}
                                className={cn(
                                    "w-full px-4 py-2.5 text-sm rounded-lg transition-all duration-200 font-medium text-left flex items-center",
                                    "hover:bg-primary/10 hover:text-primary group",
                                    value === slot.value
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-foreground border border-transparent hover:border-primary/20"
                                )}
                            >
                                <span className="text-base font-bold mr-2 tracking-tight">
                                    {slot.label.split(" ")[0]}
                                </span>
                                <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider opacity-60",
                                    value === slot.value ? "opacity-90" : "group-hover:opacity-100"
                                )}>
                                    {slot.label.split(" ")[1]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
