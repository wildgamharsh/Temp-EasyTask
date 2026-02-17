"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ReviewForm } from "./ReviewForm";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingId?: string | null;
    serviceId: string;
    organizerId: string;
    serviceName?: string;
}

export function ReviewModal({
    isOpen,
    onClose,
    bookingId,
    serviceId,
    organizerId,
    serviceName
}: ReviewModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Write a Review</DialogTitle>
                    <DialogDescription>
                        {serviceName
                            ? `How was your experience with ${serviceName}?`
                            : "Share your experience with us."}
                    </DialogDescription>
                </DialogHeader>

                <ReviewForm
                    bookingId={bookingId}
                    serviceId={serviceId}
                    organizerId={organizerId}
                    onSuccess={onClose}
                    onCancel={onClose}
                />
            </DialogContent>
        </Dialog>
    );
}
