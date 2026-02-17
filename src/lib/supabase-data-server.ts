/**
 * Server-Side Supabase Data Layer
 * 
 * This module provides server-side data access functions with proper authentication
 * and authorization checks. All functions use Supabase Auth credentials to ensure
 * user context is set for RLS policy enforcement.
 * 
 * IMPORTANT: These are Server Actions and Server Components only.
 * DO NOT import these in client components.
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import {
    LegacyService,
    LegacyBooking,
    BlockedDate,
    serviceToLegacy,
    bookingToLegacy,
    BookingStatus,
    OrganizerProfile,
    Review,
} from "@/lib/database.types";

// ===== SERVICES =====

/**
 * Get all active services (public)
 */
export async function getServices(): Promise<LegacyService[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching services:", error);
        throw new Error(`Failed to fetch services: ${error.message}`);
    }

    return (data || []).map(serviceToLegacy);
}

/**
 * Get services by organizer (requires auth and ownership)
 */
export async function getServicesByOrganizer(organizerId: string): Promise<LegacyService[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }
    const userId = user.id;

    // Verify user can only access their own services
    if (userId !== organizerId) {
        throw new Error("Forbidden: Cannot access other organizer's services");
    }

    const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("organizer_id", organizerId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching organizer services:", error);
        throw new Error(`Failed to fetch services: ${error.message}`);
    }

    return (data || []).map(serviceToLegacy);
}

/**
 * Get a single service by ID (public)
 */
export async function getService(id: string): Promise<LegacyService | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            // Not found - expected case
            return null;
        }
        console.error("Error fetching service:", error);
        throw new Error(`Failed to fetch service: ${error.message}`);
    }

    return data ? serviceToLegacy(data) : null;
}

/**
 * Create a new service (requires auth)
 */
export async function createService(
    service: Omit<LegacyService, "id" | "createdAt" | "rating" | "reviews">
): Promise<LegacyService> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const userId = user.id;

    // Verify user is creating service for themselves
    if (userId !== service.organizerId) {
        throw new Error("Forbidden: Cannot create service for another organizer");
    }

    const { data, error } = await supabase
        .from("services")
        .insert({
            organizer_id: service.organizerId,
            title: service.title,
            description: service.description,
            base_price: service.basePrice,
            pricing_type: service.pricingType,
            min_guests: service.minGuests,
            max_guests: service.maxGuests,
            features: service.features,
            images: service.images,
            is_active: service.isActive,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating service:", error);
        throw new Error(`Failed to create service: ${error.message}`);
    }

    if (!data) {
        throw new Error("Service created but no data returned");
    }

    return serviceToLegacy(data);
}

/**
 * Update a service (requires auth and ownership)
 */
export async function updateService(
    id: string,
    updates: Partial<LegacyService>
): Promise<LegacyService> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const userId = user.id;

    // First, verify ownership
    const { data: existing } = await supabase
        .from("services")
        .select("organizer_id")
        .eq("id", id)
        .single();

    if (!existing) {
        throw new Error("Service not found");
    }

    if (existing.organizer_id !== userId) {
        throw new Error("Forbidden: Cannot update another organizer's service");
    }

    // Convert legacy field names to database field names
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.basePrice !== undefined) dbUpdates.base_price = updates.basePrice;
    if (updates.pricingType !== undefined) dbUpdates.pricing_type = updates.pricingType;
    if (updates.minGuests !== undefined) dbUpdates.min_guests = updates.minGuests;
    if (updates.maxGuests !== undefined) dbUpdates.max_guests = updates.maxGuests;
    if (updates.features !== undefined) dbUpdates.features = updates.features;
    if (updates.images !== undefined) dbUpdates.images = updates.images;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

    const { data, error } = await supabase
        .from("services")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error updating service:", error);
        throw new Error(`Failed to update service: ${error.message}`);
    }

    if (!data) {
        throw new Error("Service updated but no data returned");
    }

    return serviceToLegacy(data);
}

/**
 * Delete a service (requires auth and ownership)
 */
export async function deleteService(id: string): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const userId = user.id;

    // First, verify ownership
    const { data: existing } = await supabase
        .from("services")
        .select("organizer_id")
        .eq("id", id)
        .single();

    if (!existing) {
        throw new Error("Service not found");
    }

    if (existing.organizer_id !== userId) {
        throw new Error("Forbidden: Cannot delete another organizer's service");
    }

    const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting service:", error);
        throw new Error(`Failed to delete service: ${error.message}`);
    }
}

// ===== BOOKINGS =====

/**
 * Get bookings by customer (requires auth)
 */
export async function getBookingsByCustomer(customerId: string): Promise<LegacyBooking[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const userId = user.id;

    // Verify user can only access their own bookings
    if (userId !== customerId) {
        throw new Error("Forbidden: Cannot access other customer's bookings");
    }

    const { data, error } = await supabase
        .from("bookings")
        .select("*, services(images)")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching customer bookings:", error);
        throw new Error(`Failed to fetch bookings: ${error.message}`);
    }

    return (data || []).map(bookingToLegacy);
}

/**
 * Get bookings by organizer (requires auth)
 */
export async function getBookingsByOrganizer(organizerId: string): Promise<LegacyBooking[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const userId = user.id;

    // Verify user can only access their own bookings
    if (userId !== organizerId) {
        throw new Error("Forbidden: Cannot access other organizer's bookings");
    }

    const { data, error } = await supabase
        .from("bookings")
        .select("*, services(images)")
        .eq("organizer_id", organizerId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching organizer bookings:", error);
        throw new Error(`Failed to fetch bookings: ${error.message}`);
    }

    return (data || []).map(bookingToLegacy);
}

/**
 * Create a booking (requires auth)
 */
export async function createBooking(
    booking: Omit<LegacyBooking, "id" | "createdAt" | "paymentStatus">
): Promise<LegacyBooking> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const userId = user.id;

    // Verify user is creating booking for themselves
    if (userId !== booking.customerId) {
        throw new Error("Forbidden: Cannot create booking for another customer");
    }

    const { data, error } = await supabase
        .from("bookings")
        .insert({
            customer_id: booking.customerId,
            customer_name: booking.customerName,
            customer_email: booking.customerEmail,
            service_id: booking.serviceId,
            service_name: booking.serviceName,
            organizer_id: booking.organizerId,
            organizer_name: booking.organizerName,
            event_date: booking.eventDate,
            event_time: booking.eventTime,
            guest_count: booking.guestCount,
            total_price: booking.totalPrice,
            service_fee: booking.serviceFee,
            notes: booking.notes,
            status: booking.status,
            payment_status: "paid", // Dev mode: auto-pay all bookings
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating booking:", error);
        throw new Error(`Failed to create booking: ${error.message}`);
    }

    if (!data) {
        throw new Error("Booking created but no data returned");
    }

    return bookingToLegacy(data);
}

/**
 * Update booking status (requires auth and ownership)
 */
export async function updateBookingStatus(
    id: string,
    status: BookingStatus
): Promise<LegacyBooking> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const userId = user.id;

    // First, verify user is customer or organizer
    const { data: existing } = await supabase
        .from("bookings")
        .select("customer_id, organizer_id")
        .eq("id", id)
        .single();

    if (!existing) {
        throw new Error("Booking not found");
    }

    if (existing.customer_id !== userId && existing.organizer_id !== userId) {
        throw new Error("Forbidden: Cannot update another user's booking");
    }

    const { data, error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error updating booking status:", error);
        throw new Error(`Failed to update booking: ${error.message}`);
    }

    if (!data) {
        throw new Error("Booking updated but no data returned");
    }

    return bookingToLegacy(data);
}

// ===== BLOCKED DATES =====

/**
 * Get blocked dates by organizer (public - for availability checking)
 */
export async function getBlockedDatesByOrganizer(organizerId: string): Promise<BlockedDate[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("blocked_dates")
        .select("*")
        .eq("organizer_id", organizerId)
        .order("blocked_date", { ascending: true });

    if (error) {
        console.error("Error fetching blocked dates:", error);
        throw new Error(`Failed to fetch blocked dates: ${error.message}`);
    }

    return data || [];
}

/**
 * Add a blocked date (requires auth and ownership)
 */
export async function addBlockedDate(
    organizerId: string,
    date: string,
    reason: string = "Unavailable"
): Promise<BlockedDate> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const userId = user.id;

    // Verify user is blocking their own dates
    if (userId !== organizerId) {
        throw new Error("Forbidden: Cannot block dates for another organizer");
    }

    const { data, error } = await supabase
        .from("blocked_dates")
        .insert({
            organizer_id: organizerId,
            blocked_date: date,
            reason,
        })
        .select()
        .single();

    if (error) {
        console.error("Error adding blocked date:", error);
        throw new Error(`Failed to add blocked date: ${error.message}`);
    }

    if (!data) {
        throw new Error("Blocked date added but no data returned");
    }

    return data;
}

/**
 * Remove a blocked date (requires auth and ownership)
 */
export async function removeBlockedDate(id: string): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const userId = user.id;

    // First, verify ownership
    const { data: existing } = await supabase
        .from("blocked_dates")
        .select("organizer_id")
        .eq("id", id)
        .single();

    if (!existing) {
        throw new Error("Blocked date not found");
    }

    if (existing.organizer_id !== userId) {
        throw new Error("Forbidden: Cannot remove another organizer's blocked date");
    }

    const { error } = await supabase
        .from("blocked_dates")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error removing blocked date:", error);
        throw new Error(`Failed to remove blocked date: ${error.message}`);
    }
}

// ===== ORGANIZER PROFILES =====

/**
 * Get organizer profile by subdomain (public)
 */
export async function getOrganizerBySubdomain(subdomain: string): Promise<OrganizerProfile | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("organizers") // Changed from profiles
        .select(`
            *,
            storefront_settings (*)
        `)
        .eq("subdomain", subdomain)
        .eq("storefront_enabled", true)
        // .eq("role", "organizer") // Redundant in organizers table
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            // Not found - expected for invalid subdomains
            return null;
        }
        console.error("Error fetching organizer by subdomain:", error);
        throw new Error(`Failed to fetch organizer: ${error.message}`);
    }

    return data as OrganizerProfile;
}

/**
 * Update organizer subdomain (requires auth and ownership)
 */
export async function updateOrganizerSubdomain(
    organizerId: string,
    subdomain: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };
    const userId = user.id;

    // Verify user is updating their own subdomain
    if (userId !== organizerId) {
        throw new Error("Forbidden: Cannot update another organizer's subdomain");
    }

    // Sanitize and validate input
    const sanitized = subdomain.toLowerCase().trim();
    const subdomainRegex = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;

    if (!subdomainRegex.test(sanitized)) {
        return {
            success: false,
            error: "Subdomain must be 3-63 characters, lowercase letters, numbers, and hyphens only"
        };
    }

    // Check availability (this will use RLS to prevent enumeration)
    const { data: existing } = await supabase
        .from("organizers") // Changed from profiles
        .select("id")
        .eq("subdomain", sanitized)
        .single();

    if (existing && existing.id !== organizerId) {
        return { success: false, error: "This subdomain is already taken" };
    }

    const { error } = await supabase
        .from("organizers") // Changed from profiles
        .update({
            subdomain: sanitized,
            storefront_enabled: true,
        })
        .eq("id", organizerId);

    if (error) {
        console.error("Error updating subdomain:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
