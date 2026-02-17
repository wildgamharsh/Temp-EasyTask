"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { completeBookingWithDetails } from "@/lib/booking-server-actions";
import { AdvancedImageUpload } from "@/components/dashboard/shared/AdvancedImageUpload";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface CompleteBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: any;
    currentUser: any;
}

interface DocImage {
    url: string;
    heading: string;
    caption: string;
}

export function CompleteBookingModal({ isOpen, onClose, booking, currentUser }: CompleteBookingModalProps) {
    const [loading, setLoading] = useState(false);

    // Core state
    const [docImages, setDocImages] = useState<DocImage[]>([]);
    const [eventHeading, setEventHeading] = useState("");

    // Form data (displayed as read-only)
    const formData = {
        customerName: booking?.customer_name || booking?.customer?.name || "",
        organizerName: booking?.organizer_name || booking?.organizer?.business_name || "",
        eventDate: booking?.event_date ? new Date(booking.event_date).toISOString() : new Date().toISOString(),
        servicesTaken: booking?.service_name || "",
    };

    const handleImagesChange = (urls: string[]) => {
        // Sync docImages with new URLs from the component
        const existingUrls = new Set(docImages.map(img => img.url));
        const newUrls = urls.filter(url => !existingUrls.has(url));

        // Create new image objects - use eventHeading as default/shared heading
        const newImages = newUrls.map(url => ({
            url,
            heading: eventHeading,
            caption: ""
        }));

        const currentUrls = new Set(urls);
        const keptImages = docImages.filter(img => currentUrls.has(img.url));

        setDocImages([...keptImages, ...newImages]);
    };

    const handleComplete = async () => {
        setLoading(true);
        try {
            // Apply single heading to all images for backend compatibility
            const imagesWithMainHeading = docImages.map(img => ({
                ...img,
                heading: eventHeading
            }));

            await completeBookingWithDetails(booking.id, {
                event_date: formData.eventDate,
                customer_name: formData.customerName,
                organizer_name: formData.organizerName,
                services_taken: formData.servicesTaken,
                images: imagesWithMainHeading
            });

            toast.success("Booking completed successfully!");
            onClose();
        } catch (error: any) {
            console.error("Failed to complete booking:", error);
            toast.error(error.message || "Failed to complete booking");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !loading && onClose()}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>Complete Booking Documentation</DialogTitle>
                    <DialogDescription>
                        Complete the form below to finalize the booking.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 px-6 py-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                        {/* Left Column: Event Details & Title */}
                        <div className="space-y-6">
                            {/* 1. Read-only Details */}
                            <div className="space-y-4 rounded-lg border bg-slate-50/50 p-4">
                                <h3 className="text-sm font-semibold text-slate-900 border-b pb-2 mb-3">Event Summary</h3>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="text-muted-foreground">Customer</div>
                                        <div className="col-span-2 font-medium break-words">{formData.customerName}</div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="text-muted-foreground">Organizer</div>
                                        <div className="col-span-2 font-medium break-words">{formData.organizerName}</div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="text-muted-foreground">Date</div>
                                        <div className="col-span-2 font-medium">{format(new Date(formData.eventDate), "PPP")}</div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="text-muted-foreground">Service</div>
                                        <div className="col-span-2 font-medium break-words">{formData.servicesTaken || "N/A"}</div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Event Title */}
                            <div className="space-y-2">
                                <Label htmlFor="eventHeading" className="text-base font-semibold">Event Title / Heading</Label>
                                <p className="text-xs text-muted-foreground">Give this event a memorable title for your portfolio.</p>
                                <Input
                                    id="eventHeading"
                                    placeholder="e.g. Luxurious Summer Wedding"
                                    value={eventHeading}
                                    onChange={(e) => setEventHeading(e.target.value)}
                                    className="h-10 text-sm font-medium"
                                />
                            </div>
                        </div>

                        {/* Right Column: Image Upload */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <Label className="text-base font-semibold">Event Gallery</Label>
                                <p className="text-xs text-muted-foreground">Upload photos to document the completed work.</p>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-200 min-h-[300px]">
                                <AdvancedImageUpload
                                    images={docImages.map(img => img.url)}
                                    // Map back to DocImage structure
                                    onImagesChange={handleImagesChange}
                                    organizerId={currentUser?.id || booking?.organizer_id}
                                    maxImages={20}
                                    showPreview={false}
                                    className="border-0 bg-transparent mb-4"
                                />

                                {/* External Image Grid */}
                                {docImages.length > 0 && (
                                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 mt-4">
                                        {docImages.map((img, idx) => (
                                            <div key={idx} className="group relative aspect-square rounded-md overflow-hidden border bg-white shadow-sm">
                                                <img
                                                    src={img.url}
                                                    alt={`Upload ${idx}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const newImages = docImages.filter((_, i) => i !== idx);
                                                        setDocImages(newImages);
                                                    }}
                                                    className="absolute top-1 right-1 p-1 bg-white/90 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 hover:bg-white"
                                                    type="button"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="p-6 pt-4 gap-2 border-t bg-white">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleComplete} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Complete Booking
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
