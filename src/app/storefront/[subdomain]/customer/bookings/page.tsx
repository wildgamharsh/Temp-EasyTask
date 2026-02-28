"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Loader2,
    Calendar as CalendarIcon,
    MoreHorizontal,
    MessageSquare,
    Eye,
    Search,
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
    ArrowUpRight
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { Booking as GlobalBooking, ServicePricingModel } from "@/lib/database.types";

const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
    pending: {
        label: "Pending",
        className: "bg-orange-50 text-orange-600 border border-orange-100",
        icon: Clock,
    },
    confirmed: {
        label: "Confirmed",
        className: "bg-blue-50 text-blue-600 border border-blue-100",
        icon: CheckCircle2,
    },
    completed: {
        label: "Completed",
        className: "bg-emerald-50 text-emerald-600 border border-emerald-100",
        icon: CheckCircle2,
    },
    cancelled: {
        label: "Cancelled",
        className: "bg-slate-50 text-slate-500 border border-slate-100",
        icon: XCircle,
    },
};

interface Booking extends GlobalBooking {
    organizer: {
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

    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        completed: bookings.filter(b => b.status === 'completed').length,
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
                1,
                booking.step_quantities || {}
            );

            return result;
        } catch (e) {
            console.error("Error calculating price breakdown:", e);
            return null;
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        My Bookings
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your appointments and orders
                    </p>
                </div>

                {/* Empty State */}
                <Card className="overflow-hidden border-0 shadow-md">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="bg-primary/5 rounded-full p-6 mb-4">
                            <CalendarIcon className="h-12 w-12 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No bookings yet</h3>
                        <p className="text-muted-foreground max-w-sm mb-6">
                            You haven't made any bookings yet. Browse services to get started!
                        </p>
                        <Button asChild className="bg-primary hover:bg-primary/90">
                            <a href={`/storefront/${subdomain}`}>
                                Browse Services <ArrowUpRight className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    My Bookings
                </h1>
                <p className="text-muted-foreground">
                    Manage your appointments and orders
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="overflow-hidden border-0 shadow-sm bg-linear-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                            <CalendarIcon className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Bookings</p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden border-0 shadow-sm bg-linear-to-r from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                            <Clock className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Pending</p>
                            <p className="text-2xl font-bold">{stats.pending}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden border-0 shadow-sm bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Confirmed</p>
                            <p className="text-2xl font-bold">{stats.confirmed}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden border-0 shadow-sm bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Completed</p>
                            <p className="text-2xl font-bold">{stats.completed}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card className="overflow-hidden border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="relative w-full sm:w-[300px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search bookings..."
                            className="pl-9 border-slate-200 bg-slate-50 focus:bg-white transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="overflow-hidden border-0 shadow-md">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[40px] pl-6 font-medium text-slate-500">#</TableHead>
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
                                            if (b.proposed_price && b.proposed_price > 0) {
                                                return `$${b.proposed_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                            }
                                            if (booking.pricing_display !== false) {
                                                const price = (getCalculatedBreakdown(booking)?.totalPrice) ?? 0;
                                                return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                            }
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
            </Card>

            {/* Booking Details Modal */}
            <BookingOverviewModal
                booking={selectedBooking as any}
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                onMessage={() => selectedBooking && handleMessageOrganizer(selectedBooking)}
                userRole="customer"
            />
        </div>
    );
}
