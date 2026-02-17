"use client";

import { Check, X, Calendar, User, ShoppingBag, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookingsTable } from "./BookingsTable";
import { BookingDetailCard } from "./BookingDetailCard";
import type { Booking } from "@/lib/database.types";



interface BlockedDate {
    id: string;
    blocked_date: string;
    reason: string;
}

interface StorefrontSettings {
    business_name: string;
    hero_title?: string;
    theme_colors?: {
        primary: string;
    };
    error?: string;
}

interface AiToolResultProps {
    toolName: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result: any;
    onAction: (action: string, data: string) => void;
}

export function AiToolResult({ toolName, result, onAction }: AiToolResultProps) {
    if (!result) return null;

    // Handle get_bookings - use table for 3+ bookings, cards for 1-2
    if (toolName === "get_bookings") {
        const bookings = Array.isArray(result) ? result as Booking[] : [];
        if (bookings.length === 0) return <div className="text-sm text-muted-foreground italic">No bookings found.</div>;

        // Use table for multiple bookings
        if (bookings.length >= 3) {
            return <BookingsTable bookings={bookings} onViewDetails={(id) => onAction("view_booking_details", id)} />;
        }

        // Use cards for 1-2 bookings
        return (
            <div className="grid gap-2 my-2">
                {bookings.map((booking) => (
                    <Card key={booking.id} className="bg-card/50 border-border/50">
                        <CardContent className="p-3 flex items-center justify-between">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-full bg-primary/10 text-primary mt-1">
                                    <User className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium">{booking.customer_name}</div>
                                    <div className="text-xs text-muted-foreground">{booking.service_name}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-[10px] h-5">
                                            {booking.status}
                                        </Badge>
                                        <div className="flex items-center text-[10px] text-muted-foreground">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {new Date(booking.event_date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    // Handle get_bookings_filtered - always use table
    if (toolName === "get_bookings_filtered") {
        const bookings = Array.isArray(result) ? result as Booking[] : [];
        if (bookings.length === 0) return <div className="text-sm text-muted-foreground italic">No bookings found matching the criteria.</div>;
        
        return <BookingsTable bookings={bookings} onViewDetails={(id) => onAction("view_booking_details", id)} />;
    }

    // Handle get_booking_details - use detail card
    if (toolName === "get_booking_details") {
        if (result.error) return <div className="text-sm text-destructive">{result.error}</div>;
        return <BookingDetailCard booking={result as Booking} />;
    }

    if (toolName === "get_blocked_dates") {
        const dates = Array.isArray(result) ? result as BlockedDate[] : [];
        if (dates.length === 0) return <div className="text-sm text-muted-foreground italic">No blocked dates found.</div>;

        return (
            <div className="grid gap-2 my-2">
                {dates.map((item) => (
                    <Card key={item.id} className="bg-destructive/5 border-destructive/20">
                        <CardContent className="p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-destructive" />
                                <div>
                                    <div className="text-sm font-medium">{new Date(item.blocked_date).toLocaleDateString()}</div>
                                    <div className="text-xs text-muted-foreground">{item.reason}</div>
                                </div>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 hover:bg-destructive/10 text-destructive"
                                onClick={() => onAction("unblock_date", item.blocked_date)}
                                title="Unblock this date"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (toolName === "get_storefront_settings") {
        const settings = result as StorefrontSettings;
        if (settings.error) return <div className="text-sm text-muted-foreground italic">{settings.error}</div>;

        return (
            <Card className="bg-primary/5 border-primary/20 my-2">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-primary" />
                        Storefront Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Business Name</span>
                        <span className="font-medium">{settings.business_name}</span>
                    </div>
                    {settings.hero_title && (
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Hero Title</span>
                            <span className="font-medium truncate max-w-[200px]">{settings.hero_title}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-xs items-center">
                        <span className="text-muted-foreground">Primary Color</span>
                        <div className="flex items-center gap-1">
                            <div 
                                className="w-3 h-3 rounded-full border shadow-sm"
                                style={{ backgroundColor: settings.theme_colors?.primary || '#000' }}
                            />
                            <span className="font-mono">{settings.theme_colors?.primary || 'Default'}</span>
                        </div>
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2 h-7 text-xs"
                        onClick={() => onAction("update_settings", "")}
                    >
                        <Settings2 className="w-3 h-3 mr-1" />
                        Modify Settings
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (toolName === "unblock_date" || toolName === "block_date" || toolName === "update_storefront_settings") {
        const success = result.success;
        if (!success) {
             return (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded-md my-2">
                    <X className="w-4 h-4" />
                    <span>Error: {result.error || "Action failed"}</span>
                </div>
             );
        }
        return (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-500/10 p-2 rounded-md my-2">
                <Check className="w-4 h-4" />
                <span>Action completed successfully</span>
            </div>
        );
    }

    // Default fallback for unknown tools or just JSON display
    return (
        <ScrollArea className="h-32 w-full rounded-md border bg-muted/50 p-2 my-2">
            <pre className="text-[10px] font-mono whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
            </pre>
        </ScrollArea>
    );
}
