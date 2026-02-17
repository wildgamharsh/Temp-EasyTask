"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    Calendar as CalendarIcon,
    MoreHorizontal,
    MessageSquare,
    Eye,
    Search,
    Copy,
    Check,
    MapPin,
    Clock,
    User,
    Tag
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { startConversation } from "@/lib/supabase-chat";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    SelectionState,
    QuantityState,
    Service as PricingService,
    PricingMode,
    ConfigStep,
    Rule
} from "@/types/pricing";
import { evaluatePrice } from "@/lib/pricing/pricing-engine";

import { BookingOverviewModal } from "@/components/booking/BookingOverviewModal";

// Status Badge Config
const statusConfig: Record<string, { label: string; className: string }> = {
    pending: {
        label: "Pending",
        className: "bg-orange-50 text-orange-600 border border-orange-100",
    },
    confirmed: {
        label: "Confirmed",
        className: "bg-blue-50 text-blue-600 border border-blue-100",
    },
    completed: {
        label: "Completed",
        className: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    },
    cancelled: {
        label: "Cancelled",
        className: "bg-slate-50 text-slate-500 border border-slate-100",
    },
};

import { Booking as GlobalBooking, ServicePricingModel } from "@/lib/database.types";

// Extend GlobalBooking to include specific joins and virtual fields used in this page
interface Booking extends GlobalBooking {
    organizer: {
        business_name: string;
        subdomain: string;
    };
    configuration_snapshot?: any;
    selection_state?: SelectionState;
    step_quantities?: QuantityState;
    guest_count?: number; // Usually global quantity
    // Pricing Breakdown from DB JSONB (Fallback)
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

export default function CustomerBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const supabase = createClient();
    const router = useRouter();
    const params = useParams();
    const subdomain = params.subdomain as string;

    useEffect(() => {
        const fetchBookings = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    *,
                    organizer:organizers(business_name, subdomain)
                `)
                .eq('customer_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching bookings:", error);
            } else {
                setBookings(data || []);
            }
            setIsLoading(false);
        };

        fetchBookings();
    }, [supabase]);

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            booking.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (booking.organizer?.business_name || booking.organizer_name).toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const copyBookingId = (id: string) => {
        navigator.clipboard.writeText(id);
        toast.success("Booking ID copied to clipboard");
    };

    const handleMessageOrganizer = async (booking: Booking) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const convId = await startConversation(
                    user.id,
                    booking.organizer_id,
                    booking.id
                );
                router.push(`/storefront/${subdomain}/customer/messages?conv=${convId}`);
            }
        } catch (e) {
            console.error("Failed to start chat", e);
            toast.error("Failed to start conversation");
        }
    };

    const getCalculatedBreakdown = (booking: Booking) => {
        if (!booking.configuration_snapshot || !booking.selection_state) return null;

        try {
            const config = booking.configuration_snapshot;

            // Construct Pricing Service Object
            // The snapshot usually contains steps and rules. 
            // We need to map it carefully to the PricingService type expected by evaluatePrice.
            const engineService: PricingService = {
                id: booking.id, // Mock ID
                name: booking.service_name,
                description: "",
                basePrice: 0, // Configured services usually start at 0
                pricingMode: PricingMode.CONFIGURED,
                steps: (config.steps || []) as ConfigStep[],
                rules: (config.rules || []) as Rule[]
            };

            const result = evaluatePrice(
                engineService,
                booking.selection_state || {},
                1, // Global quantity usually 1 for configured services, or use booking.guest_count
                booking.step_quantities || {}
            );

            return result;
        } catch (e) {
            console.error("Error calculating price breakdown:", e);
            return null;
        }
    };

    const calculatedResult = selectedBooking ? getCalculatedBreakdown(selectedBooking) : null;

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-muted/50 rounded-full p-6 mb-4">
                    <CalendarIcon className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No bookings yet</h3>
                <p className="text-muted-foreground max-w-sm mt-2">
                    You haven't made any bookings yet.
                </p>
                <div className="mt-6">
                    <Button asChild>
                        <a href={`/storefront/${subdomain}`}>Browse Services</a>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">My Bookings</h2>
                    <p className="text-muted-foreground">Manage your appointments and orders</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3 w-full sm:w-[300px]">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search service or organizer..."
                            className="pl-9 border-slate-200 bg-slate-50 focus:bg-white transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[40px] pl-6">#</TableHead>
                            <TableHead className="font-medium text-slate-500">Service</TableHead>
                            <TableHead className="font-medium text-slate-500">Organizer</TableHead>
                            <TableHead className="font-medium text-slate-500">Date & Time</TableHead>
                            <TableHead className="font-medium text-slate-500">Status</TableHead>
                            <TableHead className="font-medium text-slate-500 text-right">Price</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredBookings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-48 text-center text-slate-500">
                                    No bookings found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredBookings.map((booking, i) => (
                                <TableRow key={booking.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="pl-6 font-mono text-xs text-slate-400">
                                        {(i + 1).toString().padStart(2, '0')}
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-700">
                                        {booking.service_name}
                                    </TableCell>
                                    <TableCell className="text-slate-600">
                                        {booking.organizer?.business_name || booking.organizer_name}
                                    </TableCell>
                                    <TableCell className="text-slate-600">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm text-slate-700">
                                                {format(new Date(booking.event_date), 'MMM d, yyyy')}
                                            </span>
                                            <span className="text-xs text-slate-500">{booking.event_time}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={statusConfig[booking.status]?.className}>
                                            {statusConfig[booking.status]?.label || booking.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-slate-700">
                                        {(() => {
                                            const b = booking as any;

                                            // 1. Prioritize Proposed Price if it exists and is > 0
                                            if (b.proposed_price && b.proposed_price > 0) {
                                                return `$${b.proposed_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                            }

                                            // 2. If pricing_display is true, show calculated price
                                            if (booking.pricing_display !== false) {
                                                const price = (getCalculatedBreakdown(booking)?.totalPrice) ?? 0;
                                                return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                            }

                                            // 3. Fallback for Quote requests with no price yet
                                            return <span className="text-slate-500 italic">Not Specified</span>;
                                        })()}
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    className="focus:bg-blue-50 focus:text-blue-700 cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedBooking(booking);
                                                        setIsDetailsOpen(true);
                                                    }}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="focus:bg-blue-50 focus:text-blue-700 cursor-pointer"
                                                    onClick={() => handleMessageOrganizer(booking)}
                                                >
                                                    <MessageSquare className="mr-2 h-4 w-4" /> Message Organizer
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Booking Details Modal */}
            <BookingOverviewModal
                booking={selectedBooking as any}
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                onMessage={() => selectedBooking && handleMessageOrganizer(selectedBooking)}
                userRole="customer"
            />
        </div >
    );
}
