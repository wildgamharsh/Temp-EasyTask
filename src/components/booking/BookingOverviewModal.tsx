"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Briefcase,
    User,
    Check,
    Tag,
    X,
    Filter,
    Copy,
    MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Booking as GlobalBooking, ServicePricingModel } from "@/lib/database.types";
import {
    SelectionState,
    QuantityState,
    Service as PricingService,
    PricingMode,
    ConfigStep,
    Rule
} from "@/types/pricing";
import { evaluatePrice } from "@/lib/pricing/pricing-engine";

// Local Booking interface to support additional fields
interface Booking extends Omit<GlobalBooking, 'customer_name'> {
    organizer?: {
        business_name: string;
        subdomain: string;
    };
    configuration_snapshot?: any;
    selection_state?: SelectionState;
    step_quantities?: QuantityState;
    guest_count?: number;
    pricing_breakdown?: {
        pricing_model: ServicePricingModel;
        base_amount: number;
        package_name?: string;
        package_price?: number;
        addons?: Array<{ name: string; price: number }>;
        package_addons?: Array<{ name: string; price: number }>;
        guest_count?: number;
        price_per_person?: number;
        fixed_fees?: Array<{ name: string; price: number }>;
        subtotal: number;
        total: number;
    };
    customer_name?: string;
    proposed_price?: number;
}

interface BookingOverviewModalProps {
    booking: Booking | null;
    isOpen: boolean;
    onClose: () => void;
    userRole: 'customer' | 'organizer'; // To adapt display
    onMessage?: (bookingId: string) => void;
}

export function BookingOverviewModal({
    booking,
    isOpen,
    onClose,
    userRole,
    onMessage
}: BookingOverviewModalProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'configuration'>('overview');

    if (!booking) return null;

    // --- Calculation Logic from CustomerBookingsPage ---
    const getCalculatedBreakdown = (booking: Booking) => {
        if (!booking.configuration_snapshot || !booking.selection_state) return null;

        try {
            const config = booking.configuration_snapshot;

            // Construct Pricing Service Object
            const engineService: PricingService = {
                id: booking.id,
                name: booking.service_name,
                description: "",
                basePrice: 0,
                pricingMode: PricingMode.CONFIGURED,
                steps: (config.steps || []) as ConfigStep[],
                rules: (config.rules || []) as Rule[]
            };

            const result = evaluatePrice(
                engineService,
                booking.selection_state || {},
                1, // Global quantity
                booking.step_quantities || {}
            );

            return result;
        } catch (e) {
            console.error("Error calculating price breakdown:", e);
            return null;
        }
    };

    const calculatedResult = getCalculatedBreakdown(booking);

    // Helpers
    const organizerName = (booking as any).organizer?.business_name || booking.organizer_name;
    const customerName = booking.customer_name;
    const eventDate = booking.event_date ? format(new Date(booking.event_date), "MMMM d, yyyy") : "N/A";

    const statusConfig: Record<string, { label: string; className: string }> = {
        pending: { label: "Pending", className: "bg-orange-50 text-orange-600 border-orange-100" },
        confirmed: { label: "Confirmed", className: "bg-blue-50 text-blue-600 border-blue-100" },
        completed: { label: "Completed", className: "bg-emerald-50 text-emerald-600 border-emerald-100" },
        cancelled: { label: "Cancelled", className: "bg-slate-50 text-slate-500 border-slate-100" },
        rejected: { label: "Rejected", className: "bg-red-50 text-red-600 border-red-100" }
    };

    const status = statusConfig[booking.status] || statusConfig.pending;

    const copyBookingId = () => {
        navigator.clipboard.writeText(booking.id);
        // Assuming toast is available or just let it fail silently if not imported, 
        // but better to omit toast if not imported. 
        // I won't add toast import to avoid errors if sonner isn't there, 
        // unless I see it was there. It wasn't in the snippet I wrote previously.
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-w-xl p-0 overflow-hidden bg-white gap-0 rounded-2xl border-0 shadow-2xl">
                <div className="px-6 pt-6 pb-0">
                    <DialogTitle className="text-lg leading-none font-semibold sr-only">Booking Details</DialogTitle>
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">{booking.service_name}</h2>
                        <Badge variant="outline" className={cn("px-3 py-1 rounded-full text-xs font-medium border", status.className)}>
                            {status.label}
                        </Badge>
                    </div>
                    <div className="flex items-center text-sm mb-4 pb-4 border-b border-slate-100">
                        <span className="text-gray-500">Booking ID:</span>
                        <span className="ml-2 font-mono font-medium text-slate-700">#{booking.id.split('-')[0].toUpperCase()}</span>
                        <button
                            onClick={copyBookingId}
                            className="ml-2 text-primary hover:text-primary/70 transition-colors"
                            aria-label="Copy booking ID"
                        >
                            <Copy className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex border-b border-slate-200 px-6">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={cn(
                            "pb-3 pt-1 px-1 font-medium text-sm transition-all border-b-2 mr-6",
                            activeTab === 'overview'
                                ? "border-primary text-primary"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('configuration')}
                        className={cn(
                            "pb-3 pt-1 px-1 font-medium text-sm transition-all border-b-2",
                            activeTab === 'configuration'
                                ? "border-primary text-primary"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Configuration & Pricing
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-6 min-h-[300px] max-h-[60vh] overflow-y-auto">
                    {activeTab === 'overview' ? (
                        <div className="space-y-4 fade-in animate-in slide-in-from-bottom-2 duration-300">
                            {/* Event Date */}
                            <div className="flex items-start">
                                <div className="w-32 text-slate-500 text-sm flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-slate-400" /> Event Date
                                </div>
                                <div className="font-medium text-slate-900">{eventDate}</div>
                            </div>

                            {/* Time */}
                            <div className="flex items-start">
                                <div className="w-32 text-slate-500 text-sm flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-slate-400" /> Time
                                </div>
                                <div className="font-medium text-slate-900">
                                    {booking.start_time && booking.end_time ? (
                                        <span>
                                            {format(new Date(`2000-01-01T${booking.start_time}`), 'h:mm a')} - {format(new Date(`2000-01-01T${booking.end_time}`), 'h:mm a')}
                                        </span>
                                    ) : booking.event_time ? (
                                        <span>
                                            {booking.event_time.includes('M') ? booking.event_time : format(new Date(`2000-01-01T${booking.event_time}`), 'h:mm a')}
                                        </span>
                                    ) : (
                                        <span className="text-slate-400">Not specified</span>
                                    )}
                                </div>
                            </div>

                            {/* Organizer / Customer */}
                            {userRole === 'customer' && (
                                <div className="flex items-start">
                                    <div className="w-32 text-slate-500 text-sm flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-slate-400" /> Organizer
                                    </div>
                                    <div className="font-medium text-slate-900">{organizerName}</div>
                                </div>
                            )}
                            {userRole === 'organizer' && (
                                <div className="flex items-start">
                                    <div className="w-32 text-slate-500 text-sm flex items-center gap-2">
                                        <User className="h-4 w-4 text-slate-400" /> Customer
                                    </div>
                                    <div className="font-medium text-slate-900">{customerName || 'Unknown'}</div>
                                </div>
                            )}

                            {/* Location */}
                            <div className="flex items-start">
                                <div className="w-32 text-slate-500 text-sm flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-slate-400" /> Location
                                </div>
                                <div className="font-medium text-slate-900">{booking.location || "Not specified"}</div>
                            </div>

                            {/* Service Type */}
                            <div className="flex items-start">
                                <div className="w-32 text-slate-500 text-sm flex items-center gap-2">
                                    <Tag className="h-4 w-4 text-slate-400" /> Service Type
                                </div>
                                <div className="font-medium text-slate-900">{booking.service_name}</div>
                            </div>

                            {/* Actions Footer Inside Overview */}
                            <div className="mt-8 flex gap-3 pt-4 border-t border-slate-100">
                                <Button
                                    variant="secondary"
                                    className="bg-primary/5 text-primary hover:bg-primary/10 border-0 h-9 px-4 py-2"
                                    onClick={copyBookingId}
                                >
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy ID
                                </Button>
                                {onMessage && (
                                    <Button
                                        variant="outline"
                                        className="text-slate-700 hover:bg-slate-50 h-9 px-4 py-2"
                                        onClick={() => onMessage(booking.id)}
                                    >
                                        <MessageSquare className="mr-2 h-4 w-4" />
                                        Message {userRole === 'customer' ? 'Organizer' : 'Customer'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 fade-in animate-in slide-in-from-bottom-2 duration-300">
                            {/* Pricing Breakdown Logic - Kept mostly same but wrapped with fade-in */}
                            {calculatedResult ? (
                                <div className="space-y-4">
                                    <h3 className="font-medium text-sm text-slate-900">Detailed Breakdown</h3>
                                    <div className="space-y-3">
                                        {calculatedResult.breakdown.map((item, index) => (
                                            <div key={index} className="flex justify-between text-sm group">
                                                <div className="flex items-start gap-2 max-w-[70%]">
                                                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                                    <span className="text-slate-600">
                                                        {item.label}
                                                    </span>
                                                </div>
                                                <div className="font-medium text-slate-900 shrink-0">
                                                    {(booking as any).pricing_display === false ?
                                                        <span className="text-slate-400 italic">Included</span> :
                                                        `$${item.finalPrice.toFixed(2)}`
                                                    }
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-4 border-t border-slate-200 mt-4">
                                        <div className="flex justify-between items-center font-bold text-lg">
                                            <span>Total</span>
                                            <span>
                                                {(() => {
                                                    const b = booking as any;
                                                    // DEBUG: Log price rendering logic
                                                    console.log(`BookingModal Render ${booking.id}:`, { proposed: b.proposed_price, display: booking.pricing_display, calc: calculatedResult.totalPrice });

                                                    if (b.proposed_price && b.proposed_price > 0) {
                                                        return `$${b.proposed_price.toFixed(2)}`;
                                                    }
                                                    if (booking.pricing_display !== false) {
                                                        return `$${calculatedResult.totalPrice.toFixed(2)}`;
                                                    }
                                                    return "Not Specified";
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : booking.pricing_breakdown ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                                        <div className="text-sm font-medium text-slate-900">Base Price</div>
                                        <div className="text-sm font-medium text-slate-900">
                                            ${booking.pricing_breakdown.base_amount?.toFixed(2) || "0.00"}
                                        </div>
                                    </div>

                                    {/* Addons */}
                                    {booking.pricing_breakdown.addons && booking.pricing_breakdown.addons.length > 0 && (
                                        <div className="space-y-3 pt-2">
                                            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Add-ons</div>
                                            {booking.pricing_breakdown.addons.map((addon, i) => (
                                                <div key={i} className="flex justify-between text-sm">
                                                    <div className="text-slate-600 flex items-center gap-2">
                                                        <Tag className="h-3 w-3" /> {addon.name}
                                                    </div>
                                                    <div className="font-medium text-slate-900">
                                                        ${addon.price.toFixed(2)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Calculated Total */}
                                    <div className="pt-4 border-t border-slate-200 mt-4">
                                        <div className="flex justify-between items-center font-bold text-lg">
                                            <span>Total</span>
                                            <span>
                                                {(() => {
                                                    const b = booking as any;
                                                    if (b.proposed_price && b.proposed_price > 0) {
                                                        return `$${b.proposed_price.toFixed(2)}`;
                                                    }
                                                    if (booking.pricing_display !== false) {
                                                        return `$${(booking.pricing_breakdown?.total || booking.total_price || 0).toFixed(2)}`;
                                                    }
                                                    return "Not Specified";
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-slate-500">No detailed configuration available.</p>
                                    <div className="mt-2 text-2xl font-bold text-slate-900">
                                        {(() => {
                                            const b = booking as any;
                                            if (b.proposed_price && b.proposed_price > 0) {
                                                return `$${b.proposed_price.toLocaleString()}`;
                                            }
                                            if (booking.pricing_display !== false) {
                                                const p = b.pricing_breakdown?.total || b.total_price || 0;
                                                return `$${p.toLocaleString()}`;
                                            }
                                            return <span className="text-slate-500 italic">Not Specified</span>;
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
