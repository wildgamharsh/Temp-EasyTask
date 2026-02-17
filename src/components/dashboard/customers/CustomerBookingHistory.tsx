import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { Booking, BookingStatus } from "@/lib/database.types";
import { evaluatePrice } from "@/lib/pricing/pricing-engine";
import { PricingMode, ConfigStep, Rule, Service as PricingService } from "@/types/pricing";

interface CustomerBookingHistoryProps {
    bookings: Booking[];
    onViewBooking: (id: string) => void;
}

export function CustomerBookingHistory({ bookings, onViewBooking }: CustomerBookingHistoryProps) {
    const getStatusVariant = (status: BookingStatus) => {
        switch (status) {
            case 'confirmed': return 'default'; // or success color class
            case 'completed': return 'secondary';
            case 'pending': return 'outline'; // yellow
            case 'cancelled':
            case 'rejected':
                return 'destructive';
            default: return 'outline';
        }
    };

    const getStatusColorClass = (status: BookingStatus) => {
        switch (status) {
            case 'confirmed': return "bg-green-100 text-green-800 border-green-200";
            case 'pending': return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case 'completed': return "bg-gray-100 text-gray-800 border-gray-200";
            case 'cancelled': return "bg-red-100 text-red-800 border-red-200";
            case 'rejected': return "bg-red-100 text-red-800 border-red-200";
            default: return "";
        }
    };

    const calculateBookingTotal = (booking: Booking) => {
        // Try to use stored total first if meaningful
        if (booking.total_price && booking.total_price > 0) return booking.total_price;
        if (booking.pricing_breakdown?.total && booking.pricing_breakdown.total > 0) return booking.pricing_breakdown.total;

        // Fallback to dynamic calculation
        if (booking.configuration_snapshot && booking.selection_state) {
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
                    1,
                    booking.step_quantities || {}
                );
                return result.totalPrice;
            } catch (e) {
                console.error("Error generating price preview", e);
                return 0;
            }
        }
        return 0;
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Booking History</h3>
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Service</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookings.map((booking) => (
                            <TableRow key={booking.id}>
                                <TableCell className="font-medium">{booking.service_name}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{format(new Date(booking.event_date), 'MMM d, yyyy')}</span>
                                        <span className="text-xs text-muted-foreground">{booking.event_time}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {(() => {
                                        const b = booking as any;
                                        // 1. Prioritize Proposed Price if it exists and is > 0
                                        if (b.proposed_price && b.proposed_price > 0) {
                                            return `$${b.proposed_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                        }

                                        // 2. If pricing_display is true, show calculated price
                                        if (booking.pricing_display !== false) {
                                            const amount = calculateBookingTotal(booking);
                                            return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                        }

                                        // 3. Fallback for Quote requests with no price yet
                                        return <span className="text-muted-foreground italic">Not Specified</span>;
                                    })()}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={getStatusColorClass(booking.status)}>
                                        {booking.status.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => onViewBooking(booking.id)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
