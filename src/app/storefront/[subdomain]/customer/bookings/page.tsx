"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Loader2,
    Calendar as CalendarIcon,
    MessageSquare,
    Eye,
    Search,
    CheckCircle2,
    Clock,
    XCircle,
    ArrowUpRight,
    LayoutGrid,
    List,
    Table2,
    ChevronRight,
} from "lucide-react";
import { startConversation } from "@/lib/supabase-chat";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    SelectionState,
    QuantityState,
    Service as PricingService,
    PricingMode,
    ConfigStep,
    Rule,
} from "@/types/pricing";
import { evaluatePrice } from "@/lib/pricing/pricing-engine";
import { BookingOverviewModal } from "@/components/booking/BookingOverviewModal";
import { Booking as GlobalBooking, ServicePricingModel } from "@/lib/database.types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Booking extends GlobalBooking {
    organizer: { business_name: string; subdomain: string };
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
}

type ViewMode = "grid" | "list" | "table";
type StatusFilter = "all" | "pending" | "confirmed" | "completed" | "cancelled";

// ─── Status config (blue-themed) ─────────────────────────────────────────────

const statusConfig: Record<string, { label: string; pill: string; dot: string; icon: any }> = {
    pending: {
        label: "Pending",
        pill: "bg-amber-50 text-amber-700 border border-amber-200",
        dot: "bg-amber-400",
        icon: Clock,
    },
    confirmed: {
        label: "Confirmed",
        pill: "bg-blue-50 text-blue-700 border border-blue-200",
        dot: "bg-blue-500",
        icon: CheckCircle2,
    },
    completed: {
        label: "Completed",
        pill: "bg-slate-50 text-slate-600 border border-slate-200",
        dot: "bg-slate-400",
        icon: CheckCircle2,
    },
    cancelled: {
        label: "Cancelled",
        pill: "bg-red-50 text-red-500 border border-red-100",
        dot: "bg-red-400",
        icon: XCircle,
    },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
    const cfg = statusConfig[status] ?? { label: status, pill: "bg-slate-50 text-slate-600 border border-slate-200", dot: "bg-slate-400", icon: Clock };
    return (
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", cfg.pill)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
            {cfg.label}
        </span>
    );
}

function formatPrice(booking: Booking, getBreakdown: (b: Booking) => any): string {
    const b = booking as any;
    if (b.proposed_price && b.proposed_price > 0) {
        return `$${b.proposed_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (booking.pricing_display !== false) {
        const price = getBreakdown(booking)?.totalPrice ?? 0;
        return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return "—";
}

// ─── View: Card Grid ─────────────────────────────────────────────────────────

function CardGrid({ bookings, onView, onMessage, getBreakdown }: {
    bookings: Booking[];
    onView: (b: Booking) => void;
    onMessage: (b: Booking) => void;
    getBreakdown: (b: Booking) => any;
}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {bookings.map((booking) => (
                <div
                    key={booking.id}
                    className="bg-white rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-lg hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden group"
                >
                    {/* ── Gradient Header Zone ── */}
                    <div
                        className="px-5 pt-5 pb-4"
                        style={{ background: "linear-gradient(160deg, #f8faff 0%, #eef2ff 60%, #f0f7ff 100%)" }}
                    >
                        {/* Status + organizer row */}
                        <div className="flex items-center justify-between mb-3">
                            <StatusPill status={booking.status} />
                            <span className="text-[11px] text-slate-400 truncate max-w-[110px] text-right">
                                {booking.organizer?.business_name || booking.organizer_name}
                            </span>
                        </div>

                        {/* Service name — primary title */}
                        <h3 className="font-bold text-slate-800 text-[15px] leading-snug line-clamp-2 mb-3">
                            {booking.service_name}
                        </h3>

                        {/* Price — prominent */}
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">Total</p>
                                <span className="text-2xl font-extrabold text-blue-700 leading-none tracking-tight">
                                    {formatPrice(booking, getBreakdown)}
                                </span>
                            </div>
                            {/* Calendar date block */}
                            <div className="flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200/80 px-3 py-1.5 shadow-sm min-w-[56px]">
                                <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest leading-none">
                                    {format(new Date(booking.event_date), "MMM")}
                                </span>
                                <span className="text-xl font-extrabold text-slate-800 leading-tight">
                                    {format(new Date(booking.event_date), "d")}
                                </span>
                                <span className="text-[9px] text-slate-400 leading-none">
                                    {format(new Date(booking.event_date), "yyyy")}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── Body / Meta Zone ── */}
                    <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-3">
                        <CalendarIcon className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
                        <span className="text-xs text-slate-500 font-medium">
                            {format(new Date(booking.event_date), "EEEE, MMM d")}
                            {booking.event_time && (
                                <span className="text-slate-400 font-normal"> · {booking.event_time}</span>
                            )}
                        </span>
                    </div>

                    {/* ── Action Footer ── */}
                    <div className="px-5 pb-4 flex items-center justify-between gap-2">
                        <button
                            onClick={() => onView(booking)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors group/btn"
                        >
                            <Eye className="h-3.5 w-3.5" />
                            View Details
                            <ChevronRight className="h-3 w-3 opacity-0 group-hover/btn:opacity-100 -ml-0.5 transition-opacity" />
                        </button>
                        <button
                            onClick={() => onMessage(booking)}
                            className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all"
                            title="Message organizer"
                        >
                            <MessageSquare className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── View: Detail List ────────────────────────────────────────────────────────

function DetailList({ bookings, onView, onMessage, getBreakdown }: {
    bookings: Booking[];
    onView: (b: Booking) => void;
    onMessage: (b: Booking) => void;
    getBreakdown: (b: Booking) => any;
}) {
    return (
        <div className="space-y-3">
            {bookings.map((booking) => (
                <div
                    key={booking.id}
                    className="bg-white rounded-2xl border border-blue-100/80 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 flex items-stretch overflow-hidden group"
                >
                    {/* Left accent bar */}
                    <div className="w-1 bg-gradient-to-b from-blue-500 to-blue-400 flex-shrink-0" />

                    <div className="flex-1 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">

                        {/* Service + organizer */}
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 text-base truncate">{booking.service_name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="h-1 w-1 rounded-full bg-slate-300 flex-shrink-0" />
                                <span className="text-xs text-slate-400 truncate">
                                    {booking.organizer?.business_name || booking.organizer_name}
                                </span>
                            </div>
                        </div>

                        {/* Date */}
                        <div className="flex-shrink-0 text-center hidden sm:block">
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">Date</p>
                            <p className="text-sm font-semibold text-slate-700">
                                {format(new Date(booking.event_date), "MMM d, yyyy")}
                            </p>
                            {booking.event_time && (
                                <p className="text-xs text-slate-400">{booking.event_time}</p>
                            )}
                        </div>

                        {/* Status */}
                        <div className="flex-shrink-0 text-center hidden sm:block">
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Status</p>
                            <StatusPill status={booking.status} />
                        </div>

                        {/* Price */}
                        <div className="flex-shrink-0 text-center hidden sm:block">
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">Price</p>
                            <p className="text-lg font-bold text-blue-700">{formatPrice(booking, getBreakdown)}</p>
                        </div>

                        {/* Mobile status + price row */}
                        <div className="flex items-center justify-between sm:hidden">
                            <StatusPill status={booking.status} />
                            <p className="text-base font-bold text-blue-700">{formatPrice(booking, getBreakdown)}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                                size="sm"
                                className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                onClick={() => onView(booking)}
                            >
                                <Eye className="h-3.5 w-3.5 mr-1" /> View
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 text-xs border-blue-100 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 rounded-lg"
                                onClick={() => onMessage(booking)}
                            >
                                <MessageSquare className="h-3.5 w-3.5 mr-1" /> Message
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── View: Compact Table ──────────────────────────────────────────────────────

function CompactTable({ bookings, onView, onMessage, getBreakdown }: {
    bookings: Booking[];
    onView: (b: Booking) => void;
    onMessage: (b: Booking) => void;
    getBreakdown: (b: Booking) => any;
}) {
    return (
        <div className="bg-white rounded-2xl border border-blue-100/80 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-blue-600 text-white">
                        <th className="text-left px-5 py-3 text-xs font-semibold tracking-wide opacity-80 w-8">#</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold tracking-wide">Service</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold tracking-wide hidden md:table-cell">Organizer</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold tracking-wide hidden sm:table-cell">Date</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold tracking-wide">Status</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold tracking-wide">Price</th>
                        <th className="px-4 py-3 w-[80px]" />
                    </tr>
                </thead>
                <tbody className="divide-y divide-blue-50">
                    {bookings.map((booking, i) => (
                        <tr
                            key={booking.id}
                            className={cn(
                                "group transition-colors hover:bg-blue-50/40",
                                i % 2 === 0 ? "bg-white" : "bg-blue-50/10"
                            )}
                        >
                            <td className="pl-5 pr-2 py-3 text-xs font-mono text-slate-300">
                                {(i + 1).toString().padStart(2, "0")}
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-800 max-w-[160px] truncate">
                                {booking.service_name}
                            </td>
                            <td className="px-4 py-3 text-slate-500 hidden md:table-cell max-w-[140px] truncate">
                                {booking.organizer?.business_name || booking.organizer_name}
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                                <p className="text-slate-700 font-medium text-xs">
                                    {format(new Date(booking.event_date), "MMM d, yyyy")}
                                </p>
                                {booking.event_time && (
                                    <p className="text-slate-400 text-[11px]">{booking.event_time}</p>
                                )}
                            </td>
                            <td className="px-4 py-3">
                                <StatusPill status={booking.status} />
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-blue-700">
                                {formatPrice(booking, getBreakdown)}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => onView(booking)}
                                        className="h-7 px-2 flex items-center gap-1 rounded-lg text-xs text-blue-600 hover:bg-blue-50 font-medium transition-colors"
                                    >
                                        <Eye className="h-3.5 w-3.5" /> View
                                    </button>
                                    <button
                                        onClick={() => onMessage(booking)}
                                        className="h-7 px-2 flex items-center gap-1 rounded-lg text-xs text-slate-500 hover:bg-slate-50 font-medium transition-colors"
                                    >
                                        <MessageSquare className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CustomerBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

    const supabase = createClient();
    const router = useRouter();
    const params = useParams();
    const subdomain = params.subdomain as string;

    useEffect(() => {
        const fetchBookings = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("bookings")
                .select(`*, organizer:organizers(business_name, subdomain)`)
                .eq("customer_id", user.id)
                .order("created_at", { ascending: false });

            if (!error) setBookings(data || []);
            setIsLoading(false);
        };
        fetchBookings();
    }, [supabase]);

    const getCalculatedBreakdown = (booking: Booking) => {
        if (!booking.configuration_snapshot || !booking.selection_state) return null;
        try {
            const config = booking.configuration_snapshot;
            const engineService: PricingService = {
                id: booking.id,
                name: booking.service_name,
                description: "",
                basePrice: 0,
                pricingMode: PricingMode.CONFIGURED,
                steps: (config.steps || []) as ConfigStep[],
                rules: (config.rules || []) as Rule[],
            };
            return evaluatePrice(engineService, booking.selection_state || {}, 1, booking.step_quantities || {});
        } catch {
            return null;
        }
    };

    const handleView = (booking: Booking) => {
        setSelectedBooking(booking);
        setIsDetailsOpen(true);
    };

    const handleMessage = async (booking: Booking) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const convId = await startConversation(user.id, booking.organizer_id, booking.id);
                router.push(`/storefront/${subdomain}/customer/messages?conv=${convId}`);
            }
        } catch {
            toast.error("Failed to start conversation");
        }
    };

    const filteredBookings = bookings.filter((b) => {
        const matchesSearch =
            b.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (b.organizer?.business_name || b.organizer_name || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || b.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const counts = {
        all: bookings.length,
        pending: bookings.filter((b) => b.status === "pending").length,
        confirmed: bookings.filter((b) => b.status === "confirmed").length,
        completed: bookings.filter((b) => b.status === "completed").length,
        cancelled: bookings.filter((b) => b.status === "cancelled").length,
    };

    const filterPills: { key: StatusFilter; label: string }[] = [
        { key: "all", label: `All (${counts.all})` },
        { key: "pending", label: `Pending (${counts.pending})` },
        { key: "confirmed", label: `Confirmed (${counts.confirmed})` },
        { key: "completed", label: `Completed (${counts.completed})` },
        { key: "cancelled", label: `Cancelled (${counts.cancelled})` },
    ];

    const viewButtons: { mode: ViewMode; icon: any; title: string }[] = [
        { mode: "grid", icon: LayoutGrid, title: "Card Grid" },
        { mode: "list", icon: List, title: "Detail List" },
        { mode: "table", icon: Table2, title: "Compact Table" },
    ];

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-blue-600/50" />
            </div>
        );
    }

    // ── Empty state ──
    if (bookings.length === 0) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Bookings</h1>
                    <p className="text-slate-400 text-sm mt-0.5">All your appointments and orders in one place</p>
                </div>
                <div className="bg-white rounded-2xl border border-blue-100/80 shadow-sm flex flex-col items-center justify-center py-20 text-center px-6">
                    <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-5 ring-1 ring-blue-100">
                        <CalendarIcon className="h-8 w-8 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">No bookings yet</h3>
                    <p className="text-slate-400 text-sm max-w-xs">
                        You haven't made any bookings yet. Browse services to get started!
                    </p>
                    <a
                        href={`/storefront/${subdomain}`}
                        className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl px-5 py-2.5 transition-colors"
                    >
                        Browse Services <ArrowUpRight className="h-4 w-4" />
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">

            {/* ── Page Header ────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-2xl font-bold text-slate-800">My Bookings</h1>
                        <span className="h-6 min-w-[24px] flex items-center justify-center rounded-full bg-blue-600 text-white text-[11px] font-bold px-2">
                            {bookings.length}
                        </span>
                    </div>
                    <p className="text-slate-400 text-sm mt-0.5">All your appointments and orders in one place</p>
                </div>

                {/* Controls row */}
                <div className="flex items-center gap-2">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        <Input
                            placeholder="Search…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 w-44 text-sm border-blue-100 bg-white rounded-xl focus:border-blue-300 focus:ring-blue-100 placeholder:text-slate-300"
                        />
                    </div>

                    {/* View toggles */}
                    <div className="flex items-center gap-0.5 bg-white border border-blue-100 rounded-xl p-1 shadow-sm">
                        {viewButtons.map(({ mode, icon: Icon, title }) => (
                            <button
                                key={mode}
                                title={title}
                                onClick={() => setViewMode(mode)}
                                className={cn(
                                    "h-7 w-7 flex items-center justify-center rounded-lg transition-all duration-150",
                                    viewMode === mode
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                <Icon className="h-3.5 w-3.5" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Filter Pills ────────────────────────────────────────────── */}
            <div className="flex flex-wrap gap-2">
                {filterPills.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setStatusFilter(key)}
                        className={cn(
                            "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150",
                            statusFilter === key
                                ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/20"
                                : "bg-white text-slate-500 border-blue-100 hover:border-blue-200 hover:text-blue-600"
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* ── No Results ──────────────────────────────────────────────── */}
            {filteredBookings.length === 0 && (
                <div className="bg-white rounded-2xl border border-blue-100/80 shadow-sm flex flex-col items-center justify-center py-16 text-center px-6">
                    <Search className="h-8 w-8 text-slate-200 mb-3" />
                    <p className="text-slate-500 font-medium">No bookings match your filters</p>
                    <p className="text-slate-400 text-sm mt-1">Try a different search term or status filter</p>
                    <button
                        onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
                        className="mt-4 text-xs text-blue-600 hover:underline font-medium"
                    >
                        Clear filters
                    </button>
                </div>
            )}

            {/* ── Views ───────────────────────────────────────────────────── */}
            {filteredBookings.length > 0 && (
                <>
                    {viewMode === "grid" && (
                        <CardGrid
                            bookings={filteredBookings}
                            onView={handleView}
                            onMessage={handleMessage}
                            getBreakdown={getCalculatedBreakdown}
                        />
                    )}
                    {viewMode === "list" && (
                        <DetailList
                            bookings={filteredBookings}
                            onView={handleView}
                            onMessage={handleMessage}
                            getBreakdown={getCalculatedBreakdown}
                        />
                    )}
                    {viewMode === "table" && (
                        <CompactTable
                            bookings={filteredBookings}
                            onView={handleView}
                            onMessage={handleMessage}
                            getBreakdown={getCalculatedBreakdown}
                        />
                    )}
                </>
            )}

            {/* ── Booking Details Modal ────────────────────────────────────── */}
            <BookingOverviewModal
                booking={selectedBooking as any}
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                onMessage={() => selectedBooking && handleMessage(selectedBooking)}
                userRole="customer"
            />
        </div>
    );
}
