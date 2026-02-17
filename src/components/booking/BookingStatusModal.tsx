import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Booking } from "@/lib/database.types";
import { Loader2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingStatusModalProps {
    booking: Booking | null;
    isOpen: boolean;
    onClose: () => void;
    onStatusChange: (bookingId: string, newStatus: string) => Promise<void>;
    currentUser?: any; // Added for CompleteBookingModal
}

import { CompleteBookingModal } from "@/components/chat/CompleteBookingModal";

export function BookingStatusModal({
    booking,
    isOpen,
    onClose,
    onStatusChange,
    currentUser
}: BookingStatusModalProps) {
    const [confirmAction, setConfirmAction] = useState<{ status: string; label: string } | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);

    if (!booking) return null;

    const handleActionClick = (status: string, label: string) => {
        setConfirmAction({ status, label });
    };

    const handleConfirmUpdate = async () => {
        if (!confirmAction) return;
        setIsUpdating(true);
        try {
            await onStatusChange(booking.id, confirmAction.status);
            onClose();
            setConfirmAction(null);
        } catch (error) {
            console.error("Failed to update status", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const currentStatus = booking.status;

    const handleCompletionSuccess = async () => {
        // Refresh or close
        onClose();
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Update Booking Status</DialogTitle>
                    </DialogHeader>

                    <div className="py-6">
                        {/* CONFIRMATION DIALOG OVERLAY */}
                        <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Confirm Action</DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                    <p className="text-slate-600">
                                        Are you sure you want to mark this booking as <strong>{confirmAction?.label}</strong>?
                                    </p>
                                    <p className="text-sm text-slate-500 mt-2">
                                        This action cannot be undone.
                                    </p>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setConfirmAction(null)} disabled={isUpdating}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleConfirmUpdate}
                                        disabled={isUpdating}
                                        className={cn(
                                            confirmAction?.status === 'rejected' || confirmAction?.status === 'cancelled'
                                                ? "bg-red-600 hover:bg-red-700"
                                                : "bg-green-600 hover:bg-green-700"
                                        )}
                                    >
                                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Confirm {confirmAction?.label}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* STATUS FLOW UI */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-sm font-medium text-slate-500">Current Status</span>
                                <Badge className={cn(
                                    "px-3 py-1 text-sm capitalize",
                                    currentStatus === 'pending' && "bg-orange-100 text-orange-700 hover:bg-orange-100",
                                    currentStatus === 'confirmed' && "bg-blue-100 text-blue-700 hover:bg-blue-100",
                                    currentStatus === 'completed' && "bg-green-100 text-green-700 hover:bg-green-100",
                                    currentStatus === 'rejected' && "bg-red-100 text-red-700 hover:bg-red-100",
                                    currentStatus === 'cancelled' && "bg-slate-100 text-slate-700 hover:bg-slate-100",
                                )}>
                                    {currentStatus}
                                </Badge>
                            </div>

                            {currentStatus === 'pending' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        variant="outline"
                                        className="h-24 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-green-500 hover:bg-green-50 transition-all group"
                                        onClick={() => handleActionClick('confirmed', 'Approved')}
                                    >
                                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Check className="h-6 w-6 text-green-600" />
                                        </div>
                                        <span className="font-semibold text-slate-700 group-hover:text-green-700">Approve Booking</span>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="h-24 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-red-500 hover:bg-red-50 transition-all group"
                                        onClick={() => handleActionClick('rejected', 'Rejected')}
                                    >
                                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <X className="h-6 w-6 text-red-600" />
                                        </div>
                                        <span className="font-semibold text-slate-700 group-hover:text-red-700">Reject Booking</span>
                                    </Button>
                                </div>
                            )}

                            {currentStatus === 'confirmed' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        variant="outline"
                                        className="h-24 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                                        onClick={() => setShowCompleteModal(true)}
                                    >
                                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Check className="h-6 w-6 text-emerald-600" />
                                        </div>
                                        <span className="font-semibold text-slate-700 group-hover:text-emerald-700">Complete Service</span>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="h-24 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-slate-500 hover:bg-slate-50 transition-all group"
                                        onClick={() => handleActionClick('cancelled', 'Cancelled')}
                                    >
                                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <X className="h-6 w-6 text-slate-600" />
                                        </div>
                                        <span className="font-semibold text-slate-700 group-hover:text-slate-800">Cancel Booking</span>
                                    </Button>
                                </div>
                            )}

                            {['completed', 'rejected', 'cancelled'].includes(currentStatus) && (
                                <div className="text-center p-8 border border-slate-100 rounded-lg bg-slate-50/50">
                                    <p className="text-slate-500 mb-2">This booking is <strong>{currentStatus}</strong></p>
                                    <p className="text-xs text-muted-foreground">No further actions available.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {booking && (
                <CompleteBookingModal
                    isOpen={showCompleteModal}
                    onClose={() => {
                        setShowCompleteModal(false);
                        handleCompletionSuccess();
                    }}
                    booking={booking}
                    currentUser={currentUser} // Pass undefined if not available, logic might need it though
                />
            )}
        </>
    );
}
