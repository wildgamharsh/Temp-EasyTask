"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
    MoreHorizontal,
    MessageSquare,
    Loader2,
    Eye,
    Search,
    Filter,
    Star,
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Copy
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { Booking, BookingStatus } from "@/lib/database.types";
import { startConversation } from "@/lib/supabase-chat";
import { BookingOverviewModal } from "@/components/booking/BookingOverviewModal";
import { BookingStatusModal } from "@/components/booking/BookingStatusModal";
import {
    confirmBooking,
    rejectBooking,
    organizerMarkCompleted,
    updateBookingStatus
} from "@/lib/booking-actions";
import {
    SelectionState,
    QuantityState,
    Service as PricingService,
    PricingMode,
    ConfigStep,
    Rule
} from "@/types/pricing";
import { evaluatePrice } from "@/lib/pricing/pricing-engine";

// Status configuration for badges
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
    rejected: {
        label: "Rejected",
        className: "bg-red-50 text-red-600 border border-red-100",
    },
    declined: {
        label: "Declined",
        className: "bg-red-50 text-red-600 border border-red-100",
    },
    in_progress: {
        label: "In Progress",
        className: "bg-indigo-50 text-indigo-600 border border-indigo-100",
    },
    completion_pending: {
        label: "Completion Pending",
        className: "bg-purple-50 text-purple-600 border border-purple-100",
    }
};

function formatDate(date: string) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const router = useRouter();

    const supabase = createClient();

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const loadBookings = async () => {
        try {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Direct fetch of 'Booking' type
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .eq('organizer_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setBookings(data as Booking[]);
        } catch (err) {
            console.error("Error loading bookings:", err);
            toast.error("Failed to load bookings");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadBookings();
    }, []);

    const handleStatusChange = async (bookingId: string, newStatus: string) => {
        try {
            let updatedData;

            if (newStatus === 'completed') {
                updatedData = await organizerMarkCompleted(bookingId);
            } else if (newStatus === 'confirmed') {
                updatedData = await confirmBooking(bookingId);
            } else if (newStatus === 'rejected') {
                updatedData = await rejectBooking(bookingId);
            } else if (newStatus === 'cancelled') {
                updatedData = await updateBookingStatus(bookingId, 'cancelled');
            } else {
                updatedData = await updateBookingStatus(bookingId, newStatus);
            }

            setBookings(bookings.map(b => b.id === bookingId ? (updatedData as Booking) : b));
            toast.success(`Booking status updated to ${updatedData.status.replace('_', ' ')}`);
            setIsDetailsOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update booking status");
        }
    };

    const handleOpenDetails = (booking: Booking) => {
        setSelectedBooking(booking);
        setIsDetailsOpen(true);
    };

    const handleOpenStatus = (booking: Booking) => {
        setSelectedBooking(booking);
        setIsStatusOpen(true);
    };

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
                steps: (config.steps || []) as ConfigStep[], // Cast if needed
                rules: (config.rules || []) as Rule[]
            };

            const result = evaluatePrice(
                engineService,
                booking.selection_state || {},
                1,
                booking.step_quantities || {}
            );

            return result;
        } catch (e) {
            console.error("Error calculating price breakdown:", e);
            return null;
        }
    };

    // Filter Logic
    const filteredBookings = bookings.filter(booking => {
        const customerName = booking.customer_name || '';
        const serviceName = booking.service_name || '';
        const id = booking.id || '';

        const matchesSearch =
            customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            serviceName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    // Pagination Logic
    const totalItems = filteredBookings.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedBookings = filteredBookings.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pt-2">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Bookings list</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="bg-white hover:bg-slate-50 text-slate-700">
                        Export
                    </Button>
                    <Button variant="outline" className="bg-white hover:bg-slate-50 text-slate-700">
                        Import
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-[300px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search booking"
                                className="pl-9 border-slate-200 bg-slate-50 focus:bg-white transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                        <div className="flex items-center">
                            <Select defaultValue="30">
                                <SelectTrigger className="w-[140px] border-slate-200 bg-slate-50 text-slate-600">
                                    <SelectValue placeholder="Last 30 days" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">Last 7 days</SelectItem>
                                    <SelectItem value="30">Last 30 days</SelectItem>
                                    <SelectItem value="90">Last 3 months</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button variant="outline" size="icon" className="border-slate-200 text-slate-400 hover:text-slate-600">
                            <Star className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" className="text-slate-500 font-medium hover:text-slate-700">
                            <Filter className="h-4 w-4 mr-2" />
                            More filters
                        </Button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[40px] pl-6">
                                <Checkbox className="border-slate-300" />
                            </TableHead>
                            <TableHead className="font-medium text-slate-500">Customer</TableHead>
                            <TableHead className="font-medium text-slate-500">Service</TableHead>
                            <TableHead className="font-medium text-slate-500">Date & Time</TableHead>
                            <TableHead className="font-medium text-slate-500">Status</TableHead>
                            <TableHead className="font-medium text-slate-500 text-right">Price</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedBookings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-48 text-center text-slate-500">
                                    No bookings found matching your search.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedBookings.map((booking) => {
                                const status = booking.status || 'pending';
                                const config = statusConfig[status] || statusConfig.pending;

                                return (
                                    <TableRow key={booking.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="pl-6">
                                            <Checkbox className="border-slate-300" />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 bg-purple-100 text-purple-600">
                                                    <AvatarFallback className="font-bold text-xs">
                                                        {(booking.customer_name || '?').charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium text-slate-700">{booking.customer_name || 'Unknown'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium text-slate-700">
                                            {booking.service_name}
                                        </TableCell>
                                        <TableCell className="text-slate-600">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm text-slate-700">{formatDate(booking.event_date)}</span>
                                                <span className="text-xs text-slate-500">{booking.event_time}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn("rounded-md px-2.5 py-0.5 font-medium", config.className)}>
                                                {config.label}
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
                                                        onClick={() => handleOpenDetails(booking)}>
                                                        <Eye className="mr-2 h-4 w-4" /> View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="focus:bg-blue-50 focus:text-blue-700 cursor-pointer"
                                                        onClick={() => handleOpenStatus(booking)}>
                                                        <Filter className="mr-2 h-4 w-4" /> Change Status
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="focus:bg-blue-50 focus:text-blue-700 cursor-pointer"
                                                        onClick={async () => {
                                                            const convId = await startConversation(
                                                                booking.customer_id,
                                                                booking.organizer_id,
                                                                undefined // General chat, or strictly booking based? The prompt says persistence.
                                                            );
                                                            router.push(`/dashboard/messages?conversation=${convId}`);
                                                        }}>
                                                        <MessageSquare className="mr-2 h-4 w-4" /> Message
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between px-2">
                <div className="text-sm text-slate-500">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-medium">{totalItems}</span> items
                    <Button variant="link" className="ml-2 h-auto p-0 text-blue-600 font-medium">Show all</Button>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
                        className="h-8 w-8"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
                        className="h-8 w-8"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <BookingOverviewModal
                booking={selectedBooking as any}
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                userRole="organizer"
                onMessage={async (bookingId) => {
                    if (selectedBooking) {
                        const convId = await startConversation(selectedBooking.customer_id, selectedBooking.organizer_id, undefined);
                        router.push(`/dashboard/messages?conversation=${convId}`);
                    }
                }}
            />

            {/* Modal for Changing Status */}
            <BookingStatusModal
                booking={selectedBooking as any}
                isOpen={isStatusOpen}
                onClose={() => setIsStatusOpen(false)}
                onStatusChange={handleStatusChange}
            />
        </div>
    );
}
