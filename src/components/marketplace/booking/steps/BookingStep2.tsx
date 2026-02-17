"use client";

import { Booking, LegacyService as Service } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    isBefore
} from "date-fns";
import { ChevronLeft, ChevronRight, ArrowRight, ArrowLeft, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingStepProps {
    service: Service;
    bookingData: Partial<Booking>;
    onNext: (data: Partial<Booking>) => void;
    onBack: () => void;
}

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export function BookingStep2({ service, bookingData, onNext, onBack }: BookingStepProps) {
    // Date State
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(
        bookingData.event_date ? new Date(bookingData.event_date) : null
    );

    // Validations State
    const [blockedDates, setBlockedDates] = useState<string[]>([]);
    const [existingBookings, setExistingBookings] = useState<any[]>([]);

    // Modal State
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState({ title: "", description: "" });

    useEffect(() => {
        if (!service.organizerId) return;
        const fetchAvailability = async () => {
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth() + 1;
            try {
                const res = await fetch(`/api/bookings/availability?organizerId=${service.organizerId}&month=${month}&year=${year}`);
                if (res.ok) {
                    const data = await res.json();
                    setBlockedDates(data.blockedDates || []);
                    setExistingBookings(data.bookings || []);
                }
            } catch (e) {
                console.error("Failed to fetch availability", e);
            }
        };
        fetchAvailability();
    }, [service.organizerId, currentMonth]);

    // Start Time State
    const [startHour, setStartHour] = useState("12");
    const [startMinute, setStartMinute] = useState("00");
    const [startPeriod, setStartPeriod] = useState<"AM" | "PM">("PM");

    // End Time State
    const [endHour, setEndHour] = useState("01");
    const [endMinute, setEndMinute] = useState("00");
    const [endPeriod, setEndPeriod] = useState<"AM" | "PM">("PM");

    // Dropdown states
    const [startHourOpen, setStartHourOpen] = useState(false);
    const [startMinuteOpen, setStartMinuteOpen] = useState(false);
    const [endHourOpen, setEndHourOpen] = useState(false);
    const [endMinuteOpen, setEndMinuteOpen] = useState(false);

    const startHourRef = useRef<HTMLDivElement>(null);
    const startMinuteRef = useRef<HTMLDivElement>(null);
    const endHourRef = useRef<HTMLDivElement>(null);
    const endMinuteRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (startHourRef.current && !startHourRef.current.contains(event.target as Node)) setStartHourOpen(false);
            if (startMinuteRef.current && !startMinuteRef.current.contains(event.target as Node)) setStartMinuteOpen(false);
            if (endHourRef.current && !endHourRef.current.contains(event.target as Node)) setEndHourOpen(false);
            if (endMinuteRef.current && !endMinuteRef.current.contains(event.target as Node)) setEndMinuteOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Initialize state from bookingData if available (parsing logic could be added here if needed)
    useEffect(() => {
        if (bookingData.start_time) {
            const [h, m] = bookingData.start_time.split(':');
            let hour = parseInt(h);
            const period = hour >= 12 ? 'PM' : 'AM';
            if (hour > 12) hour -= 12;
            if (hour === 0) hour = 12;
            setStartHour(hour.toString().padStart(2, '0'));
            setStartMinute(m);
            setStartPeriod(period);
        }
        if (bookingData.end_time) {
            const [h, m] = bookingData.end_time.split(':');
            let hour = parseInt(h);
            const period = hour >= 12 ? 'PM' : 'AM';
            if (hour > 12) hour -= 12;
            if (hour === 0) hour = 12;
            setEndHour(hour.toString().padStart(2, '0'));
            setEndMinute(m);
            setEndPeriod(period);
        }
    }, []);


    const convertTo24Hour = (hour: string, minute: string, period: "AM" | "PM") => {
        let h = parseInt(hour, 10);
        if (period === "PM" && h !== 12) h += 12;
        if (period === "AM" && h === 12) h = 0;
        return `${h.toString().padStart(2, '0')}:${minute}`;
    };

    const showAlert = (title: string, description: string) => {
        setAlertMessage({ title, description });
        setIsAlertOpen(true);
    };

    const handleNext = () => {
        if (selectedDate) {
            const startTime24 = convertTo24Hour(startHour, startMinute, startPeriod);
            const endTime24 = convertTo24Hour(endHour, endMinute, endPeriod);

            // Double Booking Check Client-Side
            const newStart = parseInt(startTime24.replace(':', ''));
            const newEnd = parseInt(endTime24.replace(':', ''));

            if (newEnd <= newStart) {
                showAlert("Invalid Time Range", "End time must be after start time.");
                return;
            }

            // Date string for comparison YYYY-MM-DD
            const dateStr = format(selectedDate, 'yyyy-MM-dd');

            // Check blocked dates strictly
            if (blockedDates.includes(dateStr)) {
                showAlert("Date Unavailable", `The organizer is not available on ${dateStr}. Please select another date.`);
                return;
            }

            // Check existing bookings overlap
            const dayBookings = existingBookings.filter(b => b.event_date === dateStr);
            const hasConflict = dayBookings.some(b => {
                if (!b.start_time || !b.end_time) return false;
                // b.start_time is HH:MM:SS or HH:MM
                const bStart = parseInt(b.start_time.replace(/:/g, '').substring(0, 4));
                const bEnd = parseInt(b.end_time.replace(/:/g, '').substring(0, 4));

                // Overlap logic: StartA < EndB && EndA > StartB
                return newStart < bEnd && newEnd > bStart;
            });

            if (hasConflict) {
                showAlert("Time Slot Unavailable", "The organizer already has a commitment at this time. Please choose a different time.");
                return;
            }

            onNext({
                event_date: dateStr, // Use local date string
                start_time: startTime24,
                end_time: endTime24
            });
        }
    };

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const minutes = ["00", "15", "30", "45"];

    // Calendar Generation
    const renderCalendarDays = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);
        const days = eachDayOfInterval({ start: startDate, end: endDate });

        return days.map((day) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);
            const isPast = isBefore(day, new Date()) && !isToday(day);

            // Blocked Check
            const dateKey = format(day, 'yyyy-MM-dd');
            const isBlocked = blockedDates.includes(dateKey);

            return (
                <button
                    key={day.toString()}
                    onClick={() => !isPast && !isBlocked && setSelectedDate(day)}
                    disabled={isPast || isBlocked} // Disable strict past and blocked
                    className={cn(
                        "aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-all relative",
                        !isCurrentMonth && "text-slate-300",
                        isCurrentMonth && !isSelected && !isPast && !isBlocked && "text-slate-700 hover:bg-primary/10",
                        isTodayDate && !isSelected && "border-2 border-primary/50 text-primary font-bold",
                        isSelected && "bg-primary text-primary-foreground shadow-lg shadow-primary/20",
                        (isPast || isBlocked) && "text-slate-200 cursor-not-allowed",
                        isBlocked && "text-slate-200 decoration-slate-300 decoration-2 bg-slate-50 opacity-50"
                    )}
                >
                    {format(day, 'd')}
                    {isBlocked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="w-full h-[1px] bg-slate-300 rotate-45 transform" />
                        </div>
                    )}
                </button>
            );
        });
    };

    const TimePicker = ({
        label,
        hour, setHour,
        minute, setMinute,
        period, setPeriod,
        hourOpen, setHourOpen, hourRef,
        minuteOpen, setMinuteOpen, minuteRef
    }: any) => (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4 last:mb-0">
            <h4 className="text-sm font-semibold text-slate-900 mb-4">{label}</h4>
            <div className="grid grid-cols-3 gap-3">
                {/* Hour */}
                <div className="relative" ref={hourRef}>
                    <label className="block text-xs font-medium text-slate-600 mb-2">Hour</label>
                    <button
                        onClick={() => setHourOpen(!hourOpen)}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg text-sm font-medium text-slate-900 hover:border-primary/30 transition flex items-center justify-between"
                    >
                        {hour}
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                    {hourOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
                            {hours.map(h => (
                                <button
                                    key={h}
                                    onClick={() => { setHour(h); setHourOpen(false); }}
                                    className={cn(
                                        "w-full px-4 py-2 text-left text-sm hover:bg-primary/5 transition",
                                        hour === h && "bg-primary/10 text-primary font-semibold"
                                    )}
                                >
                                    {h}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Minute */}
                <div className="relative" ref={minuteRef}>
                    <label className="block text-xs font-medium text-slate-600 mb-2">Minute</label>
                    <button
                        onClick={() => setMinuteOpen(!minuteOpen)}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg text-sm font-medium text-slate-900 hover:border-primary/30 transition flex items-center justify-between"
                    >
                        {minute}
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                    {minuteOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg custom-scrollbar">
                            {minutes.map(m => (
                                <button
                                    key={m}
                                    onClick={() => { setMinute(m); setMinuteOpen(false); }}
                                    className={cn(
                                        "w-full px-4 py-2 text-left text-sm hover:bg-primary/5 transition",
                                        minute === m && "bg-primary/10 text-primary font-semibold"
                                    )}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Period */}
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">Period</label>
                    <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg">
                        {(['AM', 'PM'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={cn(
                                    "py-2 text-sm font-medium rounded-md transition",
                                    period === p ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-slate-600 hover:text-slate-900"
                                )}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold text-slate-900">Select Date & Time</h3>
                <p className="text-sm text-slate-500 mt-1">
                    Choose your preferred date and time for the event.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calendar */}
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    {/* Month/Year Navigation - Inside Calendar */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                            className="p-2 hover:bg-slate-100 rounded-lg transition"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <div className="text-center">
                            <div className="text-lg font-semibold text-slate-900">
                                {format(currentMonth, 'MMMM yyyy')}
                            </div>
                        </div>
                        <button
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            className="p-2 hover:bg-slate-100 rounded-lg transition"
                        >
                            <ChevronRight className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>

                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} className="text-center text-xs font-semibold text-slate-500">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-2">
                        {renderCalendarDays()}
                    </div>
                </div>

                {/* Date & Time Column */}
                <div className="flex flex-col gap-4">
                    <TimePicker
                        label="Start Time"
                        hour={startHour} setHour={setStartHour}
                        minute={startMinute} setMinute={setStartMinute}
                        period={startPeriod} setPeriod={setStartPeriod}
                        hourOpen={startHourOpen} setHourOpen={setStartHourOpen} hourRef={startHourRef}
                        minuteOpen={startMinuteOpen} setMinuteOpen={setStartMinuteOpen} minuteRef={startMinuteRef}
                    />

                    <TimePicker
                        label="End Time"
                        hour={endHour} setHour={setEndHour}
                        minute={endMinute} setMinute={setEndMinute}
                        period={endPeriod} setPeriod={setEndPeriod}
                        hourOpen={endHourOpen} setHourOpen={setEndHourOpen} hourRef={endHourRef}
                        minuteOpen={endMinuteOpen} setMinuteOpen={setEndMinuteOpen} minuteRef={endMinuteRef}
                    />

                    {/* Selected Summary */}
                    <div className="mt-auto p-4 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="text-xs text-primary font-medium mb-1">Selected Schedule</div>
                        <div className="text-lg font-bold text-primary">
                            {format(selectedDate || new Date(), 'MMM d')} · {startHour}:{startMinute} {startPeriod} - {endHour}:{endMinute} {endPeriod}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
                <Button variant="outline" onClick={onBack} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={!selectedDate}
                    className="bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 rounded-xl gap-2 text-primary-foreground"
                >
                    Continue to Review
                    <ArrowRight className="w-4 h-4" />
                </Button>
            </div>

            {/* Alert Dialog */}
            <Dialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{alertMessage.title}</DialogTitle>
                        <DialogDescription>
                            {alertMessage.description}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setIsAlertOpen(false)}>Okay</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--color-primary);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: var(--color-primary);
                    opacity: 0.8;
                }
            `}</style>
        </div>
    );
}
