"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Briefcase,
    User,
    Check,
    Tag,
    Copy,
    MessageSquare,
    X,
    DollarSign,
    Hash,
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
    Rule,
} from "@/types/pricing";
import { evaluatePrice } from "@/lib/pricing/pricing-engine";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Booking extends Omit<GlobalBooking, "customer_name"> {
    organizer?: { business_name: string; subdomain: string };
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
    userRole: "customer" | "organizer";
    onMessage?: (bookingId: string) => void;
}

// ─── Status config ────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; dot: string; badge: string }> = {
    pending: {
        label: "Pending",
        dot: "bg-amber-400",
        badge: "bg-amber-400/20 text-amber-200 border border-amber-300/30",
    },
    confirmed: {
        label: "Confirmed",
        dot: "bg-emerald-400",
        badge: "bg-emerald-400/20 text-emerald-200 border border-emerald-300/30",
    },
    completed: {
        label: "Completed",
        dot: "bg-slate-300",
        badge: "bg-white/10 text-white/70 border border-white/15",
    },
    cancelled: {
        label: "Cancelled",
        dot: "bg-red-400",
        badge: "bg-red-400/20 text-red-200 border border-red-300/30",
    },
    rejected: {
        label: "Rejected",
        dot: "bg-red-500",
        badge: "bg-red-500/20 text-red-200 border border-red-400/30",
    },
};

// ─── Info Tile ────────────────────────────────────────────────────────────────

function InfoTile({
    icon: Icon,
    label,
    value,
    full = false,
}: {
    icon: any;
    label: string;
    value: React.ReactNode;
    full?: boolean;
}) {
    return (
        <div
            className={cn(
                "flex flex-col gap-2 p-4 rounded-xl border",
                full ? "col-span-2" : "col-span-1",
                "bg-slate-50/80 border-slate-200/60 hover:border-blue-200/60 hover:bg-blue-50/30 transition-colors duration-150"
            )}
        >
            <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {label}
                </span>
            </div>
            <p className="text-sm font-semibold text-slate-800 leading-snug pl-0.5">
                {value}
            </p>
        </div>
    );
}

// ─── Pricing Row ──────────────────────────────────────────────────────────────

function PricingRow({
    label,
    amount,
    isIncluded,
    accent = false,
}: {
    label: string;
    amount: number;
    isIncluded?: boolean;
    accent?: boolean;
}) {
    return (
        <div
            className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl",
                accent
                    ? "bg-blue-600 text-white"
                    : "bg-slate-50 border border-slate-100"
            )}
        >
            <div className="flex items-center gap-2.5">
                {!accent && (
                    <div className="h-5 w-5 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-blue-600" />
                    </div>
                )}
                <span className={cn("text-sm font-medium", accent ? "text-white" : "text-slate-700")}>
                    {label}
                </span>
            </div>
            <span
                className={cn(
                    "font-bold flex-shrink-0 ml-4",
                    accent ? "text-white text-lg" : "text-slate-900 text-sm"
                )}
            >
                {isIncluded ? (
                    <span className={cn("italic text-xs font-normal", accent ? "text-white/60" : "text-slate-400")}>
                        {accent ? "Not Specified" : "Included"}
                    </span>
                ) : (
                    `$${amount.toFixed(2)}`
                )}
            </span>
        </div>
    );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function BookingOverviewModal({
    booking,
    isOpen,
    onClose,
    userRole,
    onMessage,
}: BookingOverviewModalProps) {
    const [activeTab, setActiveTab] = useState<"overview" | "pricing">("overview");
    const [copied, setCopied] = useState(false);

    if (!booking) return null;

    // Pricing engine
    const getCalculatedBreakdown = (b: Booking) => {
        if (!b.configuration_snapshot || !b.selection_state) return null;
        try {
            const config = b.configuration_snapshot;
            const engineService: PricingService = {
                id: b.id,
                name: b.service_name,
                description: "",
                basePrice: 0,
                pricingMode: PricingMode.CONFIGURED,
                steps: (config.steps || []) as ConfigStep[],
                rules: (config.rules || []) as Rule[],
            };
            return evaluatePrice(engineService, b.selection_state || {}, 1, b.step_quantities || {});
        } catch {
            return null;
        }
    };

    const calculatedResult = getCalculatedBreakdown(booking);
    const statusCfg = statusConfig[booking.status] ?? statusConfig.pending;
    const organizerName = (booking as any).organizer?.business_name || booking.organizer_name;
    const customerName = booking.customer_name;
    const shortId = booking.id.split("-")[0].toUpperCase();

    const handleCopyId = () => {
        navigator.clipboard.writeText(booking.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const resolveTotal = (fallbackCalc?: number): number => {
        const b = booking as any;
        if (b.proposed_price && b.proposed_price > 0) return b.proposed_price;
        if (booking.pricing_display !== false && fallbackCalc != null) return fallbackCalc;
        if (booking.pricing_display !== false) {
            return b.pricing_breakdown?.total || b.total_price || 0;
        }
        return -1; // sentinel for "Not Specified"
    };

    const totalValue = resolveTotal(calculatedResult?.totalPrice);
    const totalDisplay = totalValue < 0
        ? "Not Specified"
        : `$${totalValue.toFixed(2)}`;

    const timeDisplay = () => {
        if (booking.start_time && booking.end_time) {
            return `${format(new Date(`2000-01-01T${booking.start_time}`), "h:mm a")} – ${format(new Date(`2000-01-01T${booking.end_time}`), "h:mm a")}`;
        }
        if (booking.event_time) {
            return booking.event_time.includes("M")
                ? booking.event_time
                : format(new Date(`2000-01-01T${booking.event_time}`), "h:mm a");
        }
        return "Not specified";
    };

    const eventDateFormatted = booking.event_date
        ? format(new Date(booking.event_date), "EEEE, MMM d, yyyy")
        : "N/A";

    const tabs = [
        { key: "overview" as const, label: "Overview" },
        { key: "pricing" as const, label: "Pricing" },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                showCloseButton={false}
                className="sm:max-w-xl p-0 overflow-hidden bg-white gap-0 rounded-2xl border-0 shadow-2xl outline-none focus:outline-none"
            >
                <DialogTitle className="sr-only">Booking Details</DialogTitle>

                {/* ══ HEADER ══════════════════════════════════════════════ */}
                <div
                    className="relative overflow-hidden px-6 pt-6 pb-6"
                    style={{
                        background:
                            "linear-gradient(135deg, #1e3a8a 0%, #1e40af 40%, #2563eb 75%, #3b82f6 100%)",
                    }}
                >
                    {/* Decorative circles */}
                    <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/5" />
                    <div className="pointer-events-none absolute -bottom-6 right-16 h-24 w-24 rounded-full bg-white/5" />
                    <div className="pointer-events-none absolute top-6 right-32 h-8 w-8 rounded-full bg-white/10" />

                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 h-8 w-8 flex items-center justify-center rounded-lg bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all focus:outline-none"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    {/* Status badge — top-left */}
                    <div className="mb-4 flex items-center gap-3">
                        <span
                            className={cn(
                                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold tracking-wide",
                                statusCfg.badge
                            )}
                        >
                            <span className={cn("h-1.5 w-1.5 rounded-full", statusCfg.dot)} />
                            {statusCfg.label}
                        </span>
                    </div>

                    {/* Service name */}
                    <h2 className="text-[22px] font-extrabold text-white leading-tight mb-1 pr-10 tracking-tight">
                        {booking.service_name}
                    </h2>
                    <p className="text-blue-200/70 text-sm mb-5">
                        {organizerName || (userRole === "customer" ? "Service booking" : customerName || "Customer booking")}
                    </p>

                    {/* Bottom strip: booking ID + price */}
                    <div className="flex items-end justify-between">
                        {/* Booking ID */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-lg px-3 py-1.5">
                                <Hash className="h-3 w-3 text-white/50" />
                                <span className="text-xs font-mono font-bold text-white/80">{shortId}</span>
                            </div>
                            <button
                                onClick={handleCopyId}
                                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white/60 hover:text-white rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition-all focus:outline-none"
                            >
                                {copied ? (
                                    <><Check className="h-3 w-3 text-emerald-300" /><span className="text-emerald-300">Copied</span></>
                                ) : (
                                    <><Copy className="h-3 w-3" /> Copy</>
                                )}
                            </button>
                        </div>

                        {/* Price pill */}
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-blue-300/70 uppercase tracking-widest mb-0.5">Total</span>
                            <span className="text-2xl font-extrabold text-white tracking-tight leading-none">
                                {totalDisplay}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ══ TAB BAR ═════════════════════════════════════════════ */}
                <div className="flex items-center gap-0.5 px-5 pt-2 pb-0 bg-white border-b border-slate-100">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                "relative px-5 py-2.5 text-xs font-bold tracking-wide transition-all duration-150 focus:outline-none rounded-t-xl",
                                activeTab === tab.key
                                    ? "text-blue-700 bg-white border border-b-0 border-slate-200 shadow-sm"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ══ TAB CONTENT ═════════════════════════════════════════ */}
                <div className="px-5 py-5 min-h-[240px] max-h-[48vh] overflow-y-auto overflow-x-hidden bg-white [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">

                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                        <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-bottom-1 fade-in duration-200">
                            <InfoTile icon={CalendarIcon} label="Event Date" value={eventDateFormatted} />
                            <InfoTile icon={Clock} label="Time" value={timeDisplay()} />
                            <InfoTile icon={MapPin} label="Location" value={booking.location || "Not specified"} />
                            {userRole === "customer" ? (
                                <InfoTile icon={Briefcase} label="Organizer" value={organizerName || "—"} />
                            ) : (
                                <InfoTile icon={User} label="Customer" value={customerName || "Unknown"} />
                            )}
                            <InfoTile icon={Tag} label="Service" value={booking.service_name} full />
                        </div>
                    )}

                    {/* Pricing Tab */}
                    {activeTab === "pricing" && (
                        <div className="space-y-2 animate-in slide-in-from-bottom-1 fade-in duration-200">
                            {calculatedResult ? (
                                <>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 pt-1">
                                        Cost Breakdown
                                    </p>
                                    {calculatedResult.breakdown.map((item, i) => (
                                        <PricingRow
                                            key={i}
                                            label={item.label}
                                            amount={item.finalPrice}
                                            isIncluded={(booking as any).pricing_display === false}
                                        />
                                    ))}
                                    <div className="pt-1" />
                                    <PricingRow
                                        label="Total"
                                        amount={totalValue < 0 ? 0 : totalValue}
                                        isIncluded={totalValue < 0}
                                        accent
                                    />
                                </>
                            ) : booking.pricing_breakdown ? (
                                <>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 pt-1">
                                        Cost Breakdown
                                    </p>
                                    <PricingRow
                                        label="Base Price"
                                        amount={booking.pricing_breakdown.base_amount || 0}
                                    />
                                    {booking.pricing_breakdown.addons?.map((addon, i) => (
                                        <PricingRow key={i} label={addon.name} amount={addon.price} />
                                    ))}
                                    <div className="pt-1" />
                                    <PricingRow
                                        label="Total"
                                        amount={totalValue < 0 ? 0 : totalValue}
                                        isIncluded={totalValue < 0}
                                        accent
                                    />
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="h-14 w-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
                                        <DollarSign className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-600 mb-1">No detailed breakdown</p>
                                    <p className="text-xs text-slate-400 mb-4">Pricing was set directly for this booking</p>
                                    <div className="flex items-center justify-between w-full max-w-[200px] px-4 py-3 rounded-xl bg-blue-600 text-white">
                                        <span className="text-sm font-semibold">Total</span>
                                        <span className="text-lg font-extrabold">{totalDisplay}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ══ FOOTER ══════════════════════════════════════════════ */}
                <div className="flex items-center gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50/40">
                    {onMessage && (
                        <button
                            onClick={() => onMessage(booking.id)}
                            className="flex-1 flex items-center justify-center gap-2 h-10 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold rounded-xl shadow-sm shadow-blue-600/20 transition-all focus:outline-none"
                        >
                            <MessageSquare className="h-4 w-4" />
                            Message {userRole === "customer" ? "Organizer" : "Customer"}
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className={cn(
                            "h-10 px-5 text-sm font-semibold rounded-xl transition-all focus:outline-none",
                            onMessage
                                ? "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                                : "flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20"
                        )}
                    >
                        {onMessage ? "Close" : "Done"}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
