"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { confirmBooking } from "@/lib/quote-actions";

interface ConfirmBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    quoteId: string;
}

export function ConfirmBookingModal({ isOpen, onClose, quoteId }: ConfirmBookingModalProps) {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await confirmBooking(quoteId);
            toast.success("Booking confirmed successfully!");
            onClose();
        } catch (error) {
            console.error("Failed to confirm booking:", error);
            toast.error("Failed to confirm booking");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Confirm Booking</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to confirm this booking immediately?
                        This will close the quote and create a booking record without a specific price being displayed to the customer.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <strong>Note:</strong> Pricing display will be disabled for this booking. You can update details later in the dashboard.
                    </p>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Confirm Booking
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
