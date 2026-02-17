"use client";

import { Calendar, User, Mail, Phone, DollarSign, Clock, Users, FileText, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Booking } from "@/lib/database.types";

interface BookingDetailCardProps {
    booking: Booking;
}

export function BookingDetailCard({ booking: typedBooking }: BookingDetailCardProps) {
    const booking = typedBooking as any;
    const getStatusColor = (status: string) => {
        switch (status) {
            case "confirmed": return "bg-green-500/10 text-green-600 border-green-500/20";
            case "pending": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
            case "completed": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
            case "cancelled": return "bg-red-500/10 text-red-600 border-red-500/20";
            default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case "paid": return "bg-green-500/10 text-green-600 border-green-500/20";
            case "pending": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
            case "refunded": return "bg-red-500/10 text-red-600 border-red-500/20";
            default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
        }
    };

    return (
        <Card className="bg-card border-border my-2">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-base font-semibold">Booking Details</CardTitle>
                    <div className="flex gap-2">
                        <Badge variant="outline" className={`text-xs ${getStatusColor(booking.status)}`}>
                            {booking.status}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getPaymentStatusColor(booking.payment_status)}`}>
                            {booking.payment_status}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Customer Information */}
                <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2">Customer</h4>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{booking.customer_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{booking.customer_email}</span>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Service & Event Details */}
                <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2">Event Details</h4>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{booking.service_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{new Date(booking.event_date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{booking.event_time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{booking.guest_count} {booking.guest_count === 1 ? 'guest' : 'guests'}</span>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Pricing Information */}
                <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2">Pricing</h4>
                    <div className="space-y-1.5">
                        {booking.original_price && booking.discount_amount && (
                            <>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Original Price</span>
                                    <span className="line-through">${booking.original_price.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm text-green-600">
                                    <span>Discount</span>
                                    <span>-${booking.discount_amount.toFixed(2)}</span>
                                </div>
                            </>
                        )}
                        {booking.subtotal && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${booking.subtotal.toFixed(2)}</span>
                            </div>
                        )}
                        {booking.tax_amount && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Tax</span>
                                <span>${booking.tax_amount.toFixed(2)}</span>
                            </div>
                        )}
                        {booking.service_fee > 0 && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Service Fee</span>
                                <span>${booking.service_fee.toFixed(2)}</span>
                            </div>
                        )}
                        <Separator className="my-2" />
                        <div className="flex items-center justify-between text-sm font-semibold">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                <span>Total</span>
                            </div>
                            <span className="text-lg">${(booking.proposed_price || booking.total_price || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {booking.notes && (
                    <>
                        <Separator />
                        <div>
                            <h4 className="text-xs font-semibold text-muted-foreground mb-2">Notes</h4>
                            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                                {booking.notes}
                            </p>
                        </div>
                    </>
                )}

                {/* Metadata */}
                <Separator />
                <div className="text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                        <span>Booking ID</span>
                        <span className="font-mono">{booking.id.slice(0, 8)}...</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                        <span>Created</span>
                        <span>{new Date(booking.created_at).toLocaleString()}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
