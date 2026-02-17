import { Booking, BookingStatus, UserRole } from "./database.types";

/**
 * Validates if a booking status transition is allowed.
 */
export function canTransition(
    currentStatus: BookingStatus,
    targetStatus: BookingStatus,
    userRole: UserRole
): boolean {
    // Admin override (optional, but good for safety)
    if (userRole === 'admin') return true;

    switch (currentStatus) {
        case 'pending':
            // Organizer can confirm or reject
            if (userRole === 'organizer') {
                return targetStatus === 'confirmed' || targetStatus === 'rejected';
            }
            // Customer can cancel
            if (userRole === 'customer') {
                return targetStatus === 'cancelled';
            }
            break;

        case 'confirmed':
            // Organizer or Customer can cancel/complete
            if (targetStatus === 'cancelled') return true;
            if (targetStatus === 'completed') return true;
            break;

        case 'rejected':
        case 'cancelled':
        case 'completed':
            // Terminal states
            return false;
    }

    return false;
}

export interface BookingAction {
    label: string;
    action: 'accept' | 'reject' | 'cancel' | 'complete';
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    disabled?: boolean;
    disabledReason?: string;
}

/**
 * Returns available actions for a specific booking and user role.
 */
export function getBookingActions(booking: Booking, userRole: UserRole): BookingAction[] {
    const actions: BookingAction[] = [];

    switch (booking.status) {
        case 'pending':
            if (userRole === 'organizer') {
                actions.push({ label: 'Accept Request', action: 'accept', variant: 'default' });
                actions.push({ label: 'Reject Request', action: 'reject', variant: 'destructive' });
            } else if (userRole === 'customer') {
                actions.push({ label: 'Cancel Request', action: 'cancel', variant: 'outline' });
            }
            break;

        case 'confirmed':
            if (userRole === 'organizer' || userRole === 'customer') {
                actions.push({ label: 'Complete Service', action: 'complete', variant: 'default' });
                actions.push({ label: 'Cancel Booking', action: 'cancel', variant: 'destructive' });
            }
            break;
    }

    return actions;
}

/**
 * Helper to check if a booking is effectively "completed" (both parties confirmed).
 */
export function isFullyCompleted(booking: Booking): boolean {
    return !!(booking.organizer_completed_at && booking.customer_completed_at);
}
