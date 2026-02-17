"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    User,
    Ban,
    X,
    Loader2,
    Clock,
    Users,
    DollarSign,
    AlertCircle,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { useCalendarRealtime } from "@/hooks/useCalendarRealtime";
import { blockDate, unblockDate } from "@/hooks/useBlockedDates";
import { StatusLegend } from "@/components/calendar/StatusLegend";
import { DateDetailPanel } from "@/components/calendar/DateDetailPanel";
import { updateBookingStatus } from "@/lib/supabase-data";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

interface CalendarEvent {
    id: string;
    date: string;
    title: string;
    type: "booking" | "blocked";
    status?: string;
    customerName?: string;
    serviceName?: string;
}

export default function CalendarPage() {
    const [user, setUser] = useState<any>(null); // Supabase user
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [blockReason, setBlockReason] = useState("");
    const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setUser(user);
        });
    }, []);

    // Use real-time hook for automatic updates
    const { events, isLoading: eventsLoading } = useCalendarRealtime(user?.id || "");
    const isLoading = !user || eventsLoading;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const getEventsForDate = (day: number) => {
        const dateStr = formatDateString(day);
        return events.filter((e) => {
            if (!e.date) return false;
            // Handle both YYYY-MM-DD and full ISO strings
            const eventDateOnly = e.date.includes('T') ? e.date.split('T')[0] : e.date;
            return eventDateOnly === dateStr;
        });
    };

    const handleDayClick = (day: number) => {
        const dateStr = formatDateString(day);
        setSelectedDate(dateStr);
        // DateDetailPanel will handle showing events
    };

    const handleBlockDate = async () => {
        if (!user || !selectedDate) return;

        const success = await blockDate(user.id, selectedDate, blockReason || "Unavailable");
        if (success) {
            toast.success("Date blocked successfully");
            setBlockReason("");
            setIsBlockDialogOpen(false);
            setSelectedDate(null);
        } else {
            toast.error("Failed to block date");
        }
    };

    const handleUnblockDate = async (eventId: string) => {
        const success = await unblockDate(eventId);
        if (success) {
            toast.success("Date unblocked");
            setSelectedDate(null);
        } else {
            toast.error("Failed to unblock date");
        }
    };

    const handleMarkComplete = async (bookingId: string) => {
        const success = await updateBookingStatus(bookingId, 'completed');
        if (success) {
            toast.success("Booking marked as complete");
        } else {
            toast.error("Failed to update booking");
        }
    };

    const formatDateString = (day: number) => {
        return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    };

    const formatDisplayDate = (dateStr: string) => {
        const [y, m, d] = dateStr.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        return date.toLocaleDateString("en-CA", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    const isToday = (day: number) => {
        const today = new Date();
        return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
    };

    const isPast = (day: number) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(year, month, day);
        return checkDate < today;
    };

    // Get upcoming events (next 30 days)
    const today = new Date();
    const upcomingEvents = events
        .filter((e) => {
            if (!e.date) return false;
            const dateOnly = e.date.includes('T') ? e.date.split('T')[0] : e.date;
            const [y, m, d] = dateOnly.split('-').map(Number);
            const eventDate = new Date(y, m - 1, d);
            const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= 30 && e.type === "booking" && e.status !== 'cancelled';
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
                    <p className="text-muted-foreground">
                        View your bookings and manage availability
                    </p>
                </div>
                <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <Ban className="mr-2 h-4 w-4" />
                            Block Dates
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Block a Date</DialogTitle>
                            <DialogDescription>
                                Block a date to prevent customers from booking
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Select Date</Label>
                                <Input
                                    type="date"
                                    value={selectedDate || ""}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    min={new Date().toISOString().split("T")[0]}
                                    className="h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Reason (optional)</Label>
                                <Input
                                    placeholder="e.g., Personal day, vacation, etc."
                                    value={blockReason}
                                    onChange={(e) => setBlockReason(e.target.value)}
                                    className="h-12"
                                />
                            </div>
                            <Button onClick={handleBlockDate} disabled={!selectedDate} className="w-full h-12">
                                Block Date
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Status Legend */}
            <StatusLegend />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Calendar Grid */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="icon" onClick={prevMonth}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <CardTitle className="text-lg min-w-[160px] text-center">
                                {MONTHS[month]} {year}
                            </CardTitle>
                            <Button variant="outline" size="icon" onClick={nextMonth}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>
                            Today
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {/* Day Headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {DAYS.map((day) => (
                                <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-3 uppercase tracking-wide">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-1">
                            {/* Empty cells for days before the first of the month */}
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                <div key={`empty-${i}`} className="aspect-square" />
                            ))}

                            {/* Days of the month */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const dayEvents = getEventsForDate(day);
                                const hasBooking = dayEvents.some((e) => e.type === "booking");
                                const hasCompleted = dayEvents.some((e) => e.type === "booking" && e.status === "completed");
                                const hasConfirmed = dayEvents.some((e) => e.type === "booking" && e.status === "confirmed");
                                const hasPending = dayEvents.some((e) => e.type === "booking" && e.status === "pending");
                                const isBlocked = dayEvents.some((e) => e.type === "blocked");
                                const past = isPast(day);

                                return (
                                    <button
                                        key={day}
                                        onClick={() => handleDayClick(day)}
                                        className={`
                      aspect-square relative rounded-xl transition-all duration-200
                      flex flex-col items-center justify-center gap-0.5 border
                      ${past ? "bg-slate-50/50" : "hover:bg-muted cursor-pointer hover:scale-105 shadow-sm"}
                      ${isToday(day) ? "ring-2 ring-blue-600 ring-offset-2 border-blue-200" : "border-transparent"}
                      ${isBlocked ? "bg-red-50/80 border-red-100" : ""}
                      ${hasBooking ? "bg-blue-50/80 border-blue-100" : ""}
                    `}
                                    >
                                        <span className={`text-sm font-black ${isToday(day) ? "text-blue-600" : "text-slate-600"} ${past ? "opacity-50" : ""}`}>
                                            {day}
                                        </span>

                                        {/* Event Indicators */}
                                        {dayEvents.length > 0 && (
                                            <div className="flex flex-wrap justify-center gap-0.5 px-1 max-w-full">
                                                {dayEvents.map((e, idx) => {
                                                    if (idx > 3) return null; // Show only first 4 indicators
                                                    let color = "bg-slate-300";
                                                    if (e.type === 'blocked') color = "bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.4)]";
                                                    else if (e.type === 'booking') color = "bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.4)]";

                                                    return (
                                                        <span key={e.id} className={cn("w-1.5 h-1.5 rounded-full", color)} />
                                                    );
                                                })}
                                                {dayEvents.length > 4 && (
                                                    <span className="text-[8px] font-black text-slate-400 leading-none">+</span>
                                                )}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t text-xs">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="text-muted-foreground">Service Booking</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                <span className="text-muted-foreground">Blocked Date</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Upcoming Bookings */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-primary" />
                                Upcoming Bookings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {upcomingEvents.length === 0 ? (
                                <div className="text-center py-6">
                                    <CalendarIcon className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                                    <p className="text-sm text-muted-foreground">No upcoming bookings</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {upcomingEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className="p-3 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50"
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <User className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <span className="font-medium text-sm">{event.customerName}</span>
                                                </div>
                                                <Badge
                                                    variant="secondary"
                                                    className={cn("text-[10px] px-1.5 py-0 border-none",
                                                        event.status === "completed" ? "bg-blue-100 text-blue-700" :
                                                            event.status === "confirmed" ? "bg-emerald-100 text-emerald-700" :
                                                                event.status === "pending" ? "bg-amber-100 text-amber-700" :
                                                                    "bg-slate-100 text-slate-600"
                                                    )}
                                                >
                                                    {event.status === "completed" ? "✓ Done" : event.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{event.serviceName}</p>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <CalendarIcon className="h-3 w-3" />
                                                    {new Date(event.date).toLocaleDateString("en-CA", {
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Blocked Dates */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Ban className="h-4 w-4 text-destructive" />
                                Blocked Dates
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {events.filter(e => e.type === "blocked").length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No blocked dates
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {events.filter(e => e.type === "blocked").map((event) => (
                                        <div
                                            key={event.id}
                                            className="flex items-center justify-between p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900"
                                        >
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {new Date(event.date).toLocaleDateString("en-CA", {
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{event.title}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-red-100 dark:hover:bg-red-900"
                                                onClick={() => handleUnblockDate(event.id)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>


            {/* Date Detail Panel */}
            <DateDetailPanel
                isOpen={!!selectedDate}
                onClose={() => setSelectedDate(null)}
                date={selectedDate}
                events={selectedDate ? events.filter(e => {
                    if (!e.date) return false;
                    const dateOnly = e.date.includes('T') ? e.date.split('T')[0] : e.date;
                    return dateOnly === selectedDate;
                }) : []}
                onBlockDate={() => setIsBlockDialogOpen(true)}
                onUnblockDate={handleUnblockDate}
                onMarkComplete={handleMarkComplete}
            />
        </div>
    );
}
