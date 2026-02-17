"use client";

import { useState } from "react";
import { Booking, BookingStatus } from "@/lib/database.types";
import { getBookingActions, BookingAction } from "@/lib/booking-lifecycle";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PricingBreakdown } from "@/components/marketplace/booking/PricingBreakdown";
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    Mail,
    Phone,
    Building2,
    MessageSquare,
    CheckCircle2,
    XCircle,
    Tag,
    Receipt,
    AlertCircle,
    Hourglass,
    PlayCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface BookingDetailModalProps {
    booking: Booking | null;
    isOpen: boolean;
    onClose: () => void;
    userRole: "customer" | "organizer";
    onStatusChange?: (bookingId: string, newStatus: string) => Promise<void>;
    onMessage?: (bookingId: string) => void;
    onCancel?: (bookingId: string) => Promise<void>;
}

const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
    pending: {
        label: "Pending Confirmation",
        className: "bg-yellow-50 text-yellow-700 border-yellow-300",
        icon: Clock,
    },
    confirmed: {
        label: "Confirmed",
        className: "bg-green-100 text-green-800 border-green-400",
        icon: CheckCircle2,
    },
    rejected: {
        label: "Rejected",
        className: "bg-red-50 text-red-700 border-red-300",
        icon: XCircle,
    },
    in_progress: {
        label: "In Progress",
        className: "bg-blue-100 text-blue-800 border-blue-400",
        icon: PlayCircle,
    },
    completion_pending: {
        label: "Completion Pending",
        className: "bg-purple-100 text-purple-800 border-purple-400",
        icon: Hourglass,
    },
    completed: {
        label: "Completed",
        className: "bg-gray-100 text-gray-800 border-gray-400",
        icon: CheckCircle2,
    },
    cancelled: {
        label: "Cancelled",
        className: "bg-slate-100 text-slate-600 border-slate-300",
        icon: XCircle,
    },
};

export function BookingDetailModal({
    booking,
    isOpen,
    onClose,
    userRole,
    onStatusChange,
    onMessage,
    onCancel
}: BookingDetailModalProps) {
    const [isUpdating, setIsUpdating] = useState(false);

    if (!booking) return null;

    const status = booking.status || "pending";
    const StatusIcon = statusConfig[status]?.icon || Clock;
    const config = statusConfig[status] || statusConfig.pending;

    const availableActions = getBookingActions(booking, userRole);

    const handleActionClick = async (action: BookingAction['action']) => {
        setIsUpdating(true);
        try {
            if (!onStatusChange) {
                console.error("onStatusChange handler is not provided.");
                return;
            }

            if (action === 'accept') {
                await onStatusChange(booking.id, 'confirmed');
            } else if (action === 'reject') {
                await onStatusChange(booking.id, 'rejected');
            } else if (action === 'cancel') {
                // Prefer onCancel if provided, otherwise use onStatusChange
                if (onCancel) await onCancel(booking.id);
                else await onStatusChange(booking.id, 'cancelled');
            } else if (action === 'complete') {
                await onStatusChange(booking.id, 'completed');
            }
            // Close after action? Maybe not, forcing refresh might be better handled by parent
            onClose();
        } catch (error) {
            console.error("Action failed", error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <DialogTitle className="text-2xl font-bold text-blue-900 mb-2">
                                {booking.service_name}
                            </DialogTitle>
                            <p className="text-sm text-blue-600">
                                Booking ID: {booking.id.slice(0, 8).toUpperCase()}
                            </p>
                        </div>
                        <Badge
                            variant="outline"
                            className={cn(
                                "px-3 py-1.5 font-bold text-sm border-2",
                                config.className
                            )}
                        >
                            <StatusIcon className="h-4 w-4 mr-1.5" />
                            {config.label}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                    {/* Event Details */}
                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 space-y-4 border border-blue-100">
                        <h3 className="text-sm font-black text-blue-900 uppercase tracking-wider">
                            Event Details
                        </h3>
                        {/* ... (existing details code preserved roughly) ... */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-xs text-blue-600 font-medium">Date</p>
                                    <p className="text-sm font-bold text-blue-900">
                                        {booking.event_date
                                            ? format(new Date(booking.event_date), "EEEE, MMMM d, yyyy")
                                            : "Not specified"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-xs text-blue-600 font-medium">Time</p>
                                    <p className="text-sm font-bold text-blue-900">
                                        {booking.event_time || "Not specified"}
                                    </p>
                                </div>
                            </div>

                            {booking.guest_count && (
                                <div className="flex items-start gap-3">
                                    <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-blue-600 font-medium">Guests</p>
                                        <p className="text-sm font-bold text-blue-900">
                                            {booking.guest_count} {booking.guest_count === 1 ? "guest" : "guests"}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 space-y-4 shadow-sm shadow-blue-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-blue-900 uppercase tracking-wider flex items-center gap-2">
                                <Receipt className="h-4 w-4 text-blue-600" />
                                Pricing Breakdown
                            </h3>
                            {booking.discount_amount && booking.discount_amount > 0 && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                                    <Tag className="h-3 w-3 mr-1" />
                                    ${booking.discount_amount.toFixed(2)} saved
                                </Badge>
                            )}
                        </div>
                        <Separator className="bg-blue-100" />
                        {booking.pricing_breakdown ? (
                            <PricingBreakdown
                                breakdown={booking.pricing_breakdown}
                                pricingModel={booking.pricing_breakdown.pricing_model || "fixed"}
                                guestCount={booking.guest_count}
                                provinceName={booking.tax_province}
                                discountAmount={booking.discount_amount || 0}
                            />
                        ) : (
                            <div className="text-center py-8 text-blue-600">
                                <p className="text-sm">Pricing details not available</p>
                                <p className="text-2xl font-bold text-blue-900 mt-2">
                                    ${((booking as any).proposed_price || (booking as any).total_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Contact Information */}
                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 space-y-4 border border-blue-100">
                        <h3 className="text-sm font-black text-blue-900 uppercase tracking-wider">
                            {userRole === "customer" ? "Organizer" : "Customer"} Information
                        </h3>
                        <div className="space-y-3">
                            {/* Display logic based on role */}
                            {userRole === "organizer" && booking.customer_name && (
                                <div className="flex items-center gap-3">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-900">
                                        {booking.customer_name}
                                    </span>
                                </div>
                            )}
                            {userRole === "customer" && booking.organizer_name && (
                                <div className="flex items-center gap-3">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-900">
                                        {booking.organizer_name}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dynamic Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                        {onMessage && (
                            <Button
                                variant="outline"
                                onClick={() => onMessage(booking.id)}
                                className="flex-1 gap-2"
                            >
                                <MessageSquare className="h-4 w-4" />
                                Message {userRole === "customer" ? "Organizer" : "Customer"}
                            </Button>
                        )}

                        {availableActions.map((action, idx) => (
                            <Button
                                key={idx}
                                variant={action.variant}
                                disabled={action.disabled || isUpdating}
                                onClick={() => handleActionClick(action.action)}
                                className="flex-1"
                            >
                                {isUpdating ? "Updating..." : action.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
