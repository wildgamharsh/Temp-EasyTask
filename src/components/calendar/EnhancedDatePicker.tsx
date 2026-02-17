"use client";

import { useState, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedDatePickerProps {
    selected: Date | null;
    onChange: (date: Date | null) => void;
    excludeDates?: Date[];
    minDate?: Date;
    maxDate?: Date;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    label?: string;
}

const CustomInput = forwardRef<HTMLButtonElement, { value?: string; onClick?: () => void; placeholder?: string }>(({ value, onClick, placeholder }, ref) => (
    <button
        type="button"
        onClick={onClick}
        ref={ref}
        className={cn(
            "w-full h-14 px-4 rounded-xl border-2 font-medium text-base transition-all",
            "bg-white dark:bg-background",
            "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            "hover:border-primary/50 hover:shadow-sm",
            "flex items-center gap-3",
            value ? "border-primary/40 text-foreground" : "border-border text-muted-foreground"
        )}
    >
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 text-left">
            <div className="text-xs text-muted-foreground font-normal">Event Date</div>
            <div className="text-sm font-semibold">
                {value || placeholder || "Select date"}
            </div>
        </div>
    </button>
));

CustomInput.displayName = "CustomInput";

export function EnhancedDatePicker({
    selected,
    onChange,
    excludeDates = [],
    minDate = new Date(),
    maxDate,
    placeholder,
    className,
    disabled = false,
    label,
}: EnhancedDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Check if a date is excluded
    const isExcluded = (date: Date) => {
        return excludeDates.some((d) => d.toDateString() === date.toDateString());
    };

    // Check if date is today
    const isToday = (date: Date) => {
        return date.toDateString() === new Date().toDateString();
    };

    // Check if date is selected
    const isSelected = (date: Date) => {
        return selected && date.toDateString() === selected.toDateString();
    };

    // Custom day rendering with inline styles - GUARANTEED TO WORK
    const renderDayContents = (day: number, date: Date) => {
        const excluded = isExcluded(date);
        const today = isToday(date);
        const selectedDay = isSelected(date);

        // Base styles
        let style: React.CSSProperties = {
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%', // Circular indicators
            fontSize: '14px',
            fontWeight: '500',
            cursor: excluded ? 'not-allowed' : 'pointer',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
        };

        // Selected date - PRIMARY COLOR
        if (selectedDay) {
            style = {
                ...style,
                backgroundColor: 'var(--primary)', // Theme primary
                color: 'var(--primary-foreground)',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Simplified shadow
                transform: 'scale(1.05)',
                zIndex: 10,
            };
        }
        // Blocked/Excluded dates - LIGHT RED CIRCLE INDICATOR
        else if (excluded) {
            style = {
                ...style,
                backgroundColor: 'rgba(239, 68, 68, 0.08)', // Light red
                color: 'rgb(239, 68, 68)',
                cursor: 'not-allowed',
                pointerEvents: 'none',
                border: '1.5px solid rgba(239, 68, 68, 0.2)', // Light red circular border
            };
        }
        // Today's date - PRIMARY RING
        else if (today) {
            style = {
                ...style,
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                color: 'var(--primary)',
                fontWeight: '600',
                boxShadow: 'inset 0 0 0 2px var(--primary)',
            };
        }

        return (
            <div
                style={style}
                onMouseEnter={(e) => {
                    if (!excluded && !selectedDay) {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-light)'; // Light bg from theme
                        e.currentTarget.style.color = 'var(--primary)';
                        e.currentTarget.style.transform = 'scale(1.05)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!excluded && !selectedDay && !today) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'inherit';
                        e.currentTarget.style.transform = 'scale(1)';
                    } else if (today && !selectedDay) {
                        e.currentTarget.style.backgroundColor = 'rgba(0, 102, 255, 0.08)';
                        e.currentTarget.style.color = 'oklch(0.45 0.18 250)';
                        e.currentTarget.style.transform = 'scale(1)';
                    }
                }}
            >
                {day}
                {excluded && (
                    <div style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '6px',
                        height: '6px',
                        backgroundColor: 'rgb(239, 68, 68)',
                        borderRadius: '50%',
                        boxShadow: '0 0 0 2px white',
                        zIndex: 20,
                    }} />
                )}
            </div>
        );
    };

    return (
        <div className={className}>
            <DatePicker
                selected={selected}
                onChange={(date: Date | null) => {
                    onChange(date);
                    setIsOpen(false);
                }}
                excludeDates={excludeDates}
                minDate={minDate}
                maxDate={maxDate}
                customInput={<CustomInput placeholder={placeholder} />}
                dateFormat="MMM dd, yyyy"
                disabled={disabled}
                open={isOpen}
                onClickOutside={() => setIsOpen(false)}
                onInputClick={() => setIsOpen(true)}
                inline={false}
                popperClassName="date-picker-popper"
                calendarClassName="modern-calendar"
                renderDayContents={renderDayContents}
                wrapperClassName="w-full"
                renderCustomHeader={({
                    date,
                    decreaseMonth,
                    increaseMonth,
                    prevMonthButtonDisabled,
                    nextMonthButtonDisabled,
                }: {
                    date: Date;
                    decreaseMonth: () => void;
                    increaseMonth: () => void;
                    prevMonthButtonDisabled: boolean;
                    nextMonthButtonDisabled: boolean;
                }) => (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1.25rem 1rem',
                            backgroundColor: 'white',
                            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <button
                            type="button"
                            onClick={decreaseMonth}
                            disabled={prevMonthButtonDisabled}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                cursor: prevMonthButtonDisabled ? 'not-allowed' : 'pointer',
                                opacity: prevMonthButtonDisabled ? 0.3 : 1,
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                if (!prevMonthButtonDisabled) {
                                    e.currentTarget.style.backgroundColor = 'var(--color-bg-light)';
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span
                            style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            {date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </span>
                        <button
                            type="button"
                            onClick={increaseMonth}
                            disabled={nextMonthButtonDisabled}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                cursor: nextMonthButtonDisabled ? 'not-allowed' : 'pointer',
                                opacity: nextMonthButtonDisabled ? 0.3 : 1,
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                if (!nextMonthButtonDisabled) {
                                    e.currentTarget.style.backgroundColor = 'var(--color-bg-light)';
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            />
        </div>
    );
}
