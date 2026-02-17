"use client";

import { useState } from "react";
import { Calendar, User, Mail, Phone, DollarSign, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Booking } from "@/lib/database.types";

interface BookingsTableProps {
    bookings: Booking[];
    onViewDetails: (bookingId: string) => void;
}

export function BookingsTable({ bookings, onViewDetails }: BookingsTableProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    if (bookings.length === 0) {
        return <div className="text-sm text-muted-foreground italic">No bookings found.</div>;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "confirmed": return "bg-green-500/10 text-green-600 border-green-500/20";
            case "pending": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
            case "completed": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
            case "cancelled": return "bg-red-500/10 text-red-600 border-red-500/20";
            default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
        }
    };

    return (
        <div className="space-y-2 my-2">
            {bookings.map((booking) => {
                const isExpanded = expandedId === booking.id;

                return (
                    <Card key={booking.id} className="bg-card/50 border-border/50 overflow-hidden">
                        <CardContent className="p-0">
                            {/* Compact Row */}
                            <div
                                className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                                onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">{booking.customer_name}</div>
                                        <div className="text-xs text-muted-foreground truncate">{booking.service_name}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <div className="hidden sm:flex items-center text-xs text-muted-foreground">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {new Date(booking.event_date).toLocaleDateString()}
                                    </div>
                                    <Badge variant="outline" className={`text-[10px] h-5 ${getStatusColor(booking.status)}`}>
                                        {booking.status}
                                    </Badge>
                                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="px-3 pb-3 pt-0 border-t bg-muted/20 space-y-2 animate-in slide-in-from-top-2 duration-200">
                                    <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                                        <div className="flex items-center gap-1.5">
                                            <Mail className="w-3 h-3 text-muted-foreground" />
                                            <span className="truncate">{booking.customer_email}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3 text-muted-foreground" />
                                            <span>{booking.event_time}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <User className="w-3 h-3 text-muted-foreground" />
                                            <span>{booking.guest_count} guests</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <DollarSign className="w-3 h-3 text-muted-foreground" />
                                            <span className="font-medium">
                                                {(() => {
                                                    const b = booking as any;
                                                    if (b.proposed_price && b.proposed_price > 0) {
                                                        return `$${b.proposed_price.toFixed(2)}`;
                                                    }
                                                    if (booking.pricing_display !== false) {
                                                        return `$${((booking as any).total_price || 0).toFixed(2)}`;
                                                    }
                                                    return "Not Specified";
                                                })()}
                                            </span>
                                        </div>
                                    </div>

                                    {booking.notes && (
                                        <div className="text-xs text-muted-foreground bg-background/50 p-2 rounded">
                                            <span className="font-medium">Notes:</span> {booking.notes}
                                        </div>
                                    )}

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full h-7 text-xs mt-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onViewDetails(booking.id);
                                        }}
                                    >
                                        View Full Details
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
