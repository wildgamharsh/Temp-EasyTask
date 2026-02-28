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

const statusConfig: Record<string, { label: string; pill: string; dot: string }> = {
    pending: {
        label: "Pending",
        pill: "bg-amber-50 text-amber-700 border border-amber-200",
        dot: "bg-amber-400",
    },
    confirmed: {
        label: "Confirmed",
        pill: "bg-blue-50 text-blue-700 border border-blue-200",
        dot: "bg-blue-500",
    },
    completed: {
        label: "Completed",
        pill: "bg-slate-100 text-slate-600 border border-slate-200",
        dot: "bg-slate-400",
    },
    cancelled: {
        label: "Cancelled",
        pill: "bg-red-50 text-red-500 border border-red-100",
        dot: "bg-red-400",
    },
    rejected: {
        label: "Rejected",
        pill: "bg-red-50 text-red-600 border border-red-100",
        dot: "bg-red-500",
    },
};

// ─── Info Row Component ───────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
            <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-blue-50 flex-shrink-0">
                <Icon className="h-4 w-4 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex-shrink-0">{label}</span>
                <span className="text-sm font-semibold text-slate-800 text-right truncate">{value}</span>
            </div>
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
    const [activeTab, setActiveTab] = useState<"overview" | "configuration">("overview");
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
    const eventDate = booking.event_date
        ? format(new Date(booking.event_date), "EEEE, MMMM d, yyyy")
        : "N/A";
    const shortId = `#${booking.id.split("-")[0].toUpperCase()}`;

    const handleCopyId = () => {
        navigator.clipboard.writeText(booking.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Resolve display price
    const resolveTotal = (fallbackCalc?: number): string => {
        const b = booking as any;
        if (b.proposed_price && b.proposed_price > 0)
            return `$${b.proposed_price.toFixed(2)}`;
        if (booking.pricing_display !== false && fallbackCalc != null)
            return `$${fallbackCalc.toFixed(2)}`;
        if (booking.pricing_display !== false) {
            const p = b.pricing_breakdown?.total || b.total_price || 0;
            return `$${p.toFixed(2)}`;
        }
        return "Not Specified";
    };

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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent showCloseButton={false} className="sm:max-w-lg p-0 overflow-hidden bg-white gap-0 rounded-2xl border-0 shadow-2xl focus:outline-none focus-visible:ring-0 focus-visible:outline-none">
                <DialogTitle className="sr-only">Booking Details</DialogTitle>

                {/* ── Gradient Header ──────────────────────────────────── */}
                <div
                    className="px-6 pt-6 pb-5 relative"
                    style={{ background: "linear-gradient(145deg, #1e3a8a 0%, #1d4ed8 50%, #3b82f6 100%)" }}
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all focus:outline-none"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    {/* Status pill */}
                    <div className="mb-3">
                        <span className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold bg-white/15 text-white border border-white/20"
                        )}>
                            <span className={cn("h-1.5 w-1.5 rounded-full", statusCfg.dot)} />
                            {statusCfg.label}
                        </span>
                    </div>

                    {/* Service name */}
                    <h2 className="text-xl font-bold text-white leading-snug mb-4 pr-10">
                        {booking.service_name}
                    </h2>

                    {/* Booking ID */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-white/50 font-medium">Booking</span>
                        <span className="text-xs font-mono font-bold text-white/80">{shortId}</span>
                        <button
                            onClick={handleCopyId}
                            className="flex items-center gap-1.5 text-[10px] bg-white/10 hover:bg-white/20 text-white/60 hover:text-white px-2 py-1 rounded-md transition-all focus:outline-none"
                        >
                            {copied ? (
                                <><Check className="h-3 w-3 text-green-300" /> Copied</>
                            ) : (
                                <><Copy className="h-3 w-3" /> Copy</>
                            )}
                        </button>
                    </div>
                </div>

                {/* ── Tab Switcher ─────────────────────────────────────── */}
                <div className="flex items-center gap-1.5 px-6 py-3 border-b border-slate-100 bg-slate-50/60">
                    {(["overview", "configuration"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 focus:outline-none",
                                activeTab === tab
                                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/25"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                            )}
                        >
                            {tab === "overview" ? "Overview" : "Pricing"}
                        </button>
                    ))}
                </div>

                {/* ── Tab Content ──────────────────────────────────────── */}
                <div className="px-6 py-4 min-h-[260px] max-h-[52vh] overflow-y-auto">
                    {activeTab === "overview" ? (
                        <div className="animate-in slide-in-from-bottom-1 duration-200">
                            <InfoRow icon={CalendarIcon} label="Date" value={eventDate} />
                            <InfoRow icon={Clock} label="Time" value={timeDisplay()} />
                            {userRole === "customer" && (
                                <InfoRow icon={Briefcase} label="Organizer" value={organizerName || "—"} />
                            )}
                            {userRole === "organizer" && (
                                <InfoRow icon={User} label="Customer" value={customerName || "Unknown"} />
                            )}
                            <InfoRow icon={MapPin} label="Location" value={booking.location || "Not specified"} />
                            <InfoRow icon={Tag} label="Service" value={booking.service_name} />
                        </div>
                    ) : (
                        <div className="animate-in slide-in-from-bottom-1 duration-200 space-y-4">
                            {calculatedResult ? (
                                <>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Breakdown</p>
                                    <div className="space-y-2">
                                        {calculatedResult.breakdown.map((item, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-100"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className="h-5 w-5 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                        <Check className="h-3 w-3 text-blue-600" />
                                                    </div>
                                                    <span className="text-sm text-slate-600 truncate">{item.label}</span>
                                                </div>
                                                <span className="text-sm font-semibold text-slate-800 flex-shrink-0 ml-3">
                                                    {(booking as any).pricing_display === false ? (
                                                        <span className="text-slate-400 italic text-xs">Included</span>
                                                    ) : (
                                                        `$${item.finalPrice.toFixed(2)}`
                                                    )}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Total */}
                                    <div className="mt-4 flex items-center justify-between px-4 py-3 rounded-xl bg-blue-600 text-white">
                                        <span className="text-sm font-semibold">Total</span>
                                        <span className="text-xl font-extrabold tracking-tight">
                                            {resolveTotal(calculatedResult.totalPrice)}
                                        </span>
                                    </div>
                                </>
                            ) : booking.pricing_breakdown ? (
                                <>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Breakdown</p>
                                    <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <span className="text-sm text-slate-600">Base Price</span>
                                        <span className="text-sm font-semibold text-slate-800">
                                            ${booking.pricing_breakdown.base_amount?.toFixed(2) ?? "0.00"}
                                        </span>
                                    </div>

                                    {booking.pricing_breakdown.addons?.map((addon, i) => (
                                        <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <Tag className="h-3.5 w-3.5 text-slate-400" />
                                                <span className="text-sm text-slate-600">{addon.name}</span>
                                            </div>
                                            <span className="text-sm font-semibold text-slate-800">${addon.price.toFixed(2)}</span>
                                        </div>
                                    ))}

                                    <div className="mt-4 flex items-center justify-between px-4 py-3 rounded-xl bg-blue-600 text-white">
                                        <span className="text-sm font-semibold">Total</span>
                                        <span className="text-xl font-extrabold tracking-tight">{resolveTotal()}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
                                        <Tag className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-600">No detailed configuration available</p>
                                    <p className="text-2xl font-extrabold text-blue-700 mt-3">{resolveTotal()}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Action Footer ─────────────────────────────────────── */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    {onMessage ? (
                        <button
                            onClick={() => onMessage(booking.id)}
                            className="flex-1 flex items-center justify-center gap-2 h-9 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors focus:outline-none"
                        >
                            <MessageSquare className="h-4 w-4" />
                            Message {userRole === "customer" ? "Organizer" : "Customer"}
                        </button>
                    ) : <div />}
                    <button
                        onClick={onClose}
                        className="h-9 px-5 text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none"
                    >
                        Close
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
