import { Badge } from "@/components/ui/badge";
import { Calendar, Ban, CheckCircle, Clock, X } from "lucide-react";

export function StatusLegend() {
    return (
        <div className="flex flex-wrap gap-4 p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-muted-foreground">Service Booking</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-muted-foreground">Blocked Date</span>
            </div>
        </div>
    );
}

interface DateStatusBadgeProps {
    type: 'booking' | 'blocked';
    status?: string;
}

export function DateStatusBadge({ type, status }: DateStatusBadgeProps) {
    if (type === 'blocked') {
        return (
            <Badge variant="destructive" className="gap-1">
                <Ban className="h-3 w-3" />
                Blocked
            </Badge>
        );
    }

    if (status === 'completed') {
        return (
            <Badge className="gap-1 bg-blue-500 hover:bg-blue-600">
                <CheckCircle className="h-3 w-3" />
                Completed
            </Badge>
        );
    }

    if (status === 'confirmed') {
        return (
            <Badge className="gap-1 bg-green-500 hover:bg-green-600">
                <Calendar className="h-3 w-3" />
                Confirmed
            </Badge>
        );
    }

    if (status === 'cancelled') {
        return (
            <Badge variant="outline" className="gap-1 text-slate-500 border-slate-200">
                <X className="h-3 w-3" />
                Cancelled
            </Badge>
        );
    }

    return (
        <Badge className="gap-1 bg-amber-500 hover:bg-amber-600">
            <Clock className="h-3 w-3" />
            Pending
        </Badge>
    );
}
