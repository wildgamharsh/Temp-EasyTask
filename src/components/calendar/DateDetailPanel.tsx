"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Ban, CheckCircle, X } from "lucide-react";
import { DateStatusBadge } from "./StatusLegend";

interface CalendarEvent {
    id: string;
    date: string;
    title: string;
    type: 'booking' | 'blocked';
    status?: string;
    customerName?: string;
    serviceName?: string;
}

interface DateDetailPanelProps {
    isOpen: boolean;
    onClose: () => void;
    date: string | null;
    events: CalendarEvent[];
    onBlockDate?: () => void;
    onUnblockDate?: (eventId: string) => void;
    onMarkComplete?: (eventId: string) => void;
}

export function DateDetailPanel({
    isOpen,
    onClose,
    date,
    events,
    onBlockDate,
    onUnblockDate,
    onMarkComplete,
}: DateDetailPanelProps) {
    if (!date) return null;

    const formattedDate = new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const hasBookings = events.some(e => e.type === 'booking');
    const isBlocked = events.some(e => e.type === 'blocked');
    const isPast = new Date(date) < new Date(new Date().setHours(0, 0, 0, 0));

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Calendar className="h-20 w-20" />
                    </div>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl font-bold">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Calendar className="h-5 w-5 text-white" />
                            </div>
                            {formattedDate}
                        </DialogTitle>
                        <DialogDescription className="text-blue-100/80 mt-1">
                            {events.length === 0
                                ? "No events or bookings on this date"
                                : `You have ${events.length} event${events.length > 1 ? 's' : ''} scheduled`}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-4">
                    {/* Events List */}
                    {events.length > 0 ? (
                        <div className="space-y-3">
                            {events.map((event) => (
                                <div
                                    key={event.id}
                                    className={`p-4 rounded-xl border transition-all hover:shadow-md ${event.type === 'blocked'
                                        ? 'bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-900/40'
                                        : event.status === 'completed'
                                            ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/40'
                                            : event.status === 'confirmed'
                                                ? 'bg-green-50/50 dark:bg-green-950/20 border-green-100 dark:border-green-900/40'
                                                : 'bg-yellow-50/50 dark:bg-yellow-950/20 border-yellow-100 dark:border-yellow-900/40'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {event.type === 'blocked' ? (
                                                <Ban className="h-5 w-5 text-red-600 dark:text-red-400" />
                                            ) : (
                                                <User className="h-5 w-5 text-primary" />
                                            )}
                                            <span className="font-semibold">
                                                {event.type === 'blocked' ? 'Blocked' : event.customerName}
                                            </span>
                                        </div>
                                        <DateStatusBadge type={event.type} status={event.status} />
                                    </div>

                                    <p className="text-sm text-muted-foreground mb-3">
                                        {event.title}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        {event.type === 'blocked' && onUnblockDate && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onUnblockDate(event.id)}
                                                className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                                            >
                                                <X className="h-4 w-4 mr-1" />
                                                Unblock
                                            </Button>
                                        )}
                                        {event.type === 'booking' && event.status === 'confirmed' && onMarkComplete && (
                                            <Button
                                                size="sm"
                                                onClick={() => onMarkComplete(event.id)}
                                                className="bg-blue-500 hover:bg-blue-600"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Mark Complete
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No events scheduled for this date</p>
                        </div>
                    )}

                    {/* Block Date Action */}
                    {!hasBookings && !isBlocked && !isPast && onBlockDate && (
                        <Button
                            onClick={onBlockDate}
                            variant="outline"
                            className="w-full h-12 rounded-xl text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all font-semibold mt-2"
                        >
                            <Ban className="h-4 w-4 mr-2" />
                            Block This Date
                        </Button>
                    )}

                    {hasBookings && !isBlocked && (
                        <p className="text-xs text-muted-foreground text-center">
                            Cannot block dates with existing bookings
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
