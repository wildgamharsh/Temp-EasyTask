// Supabase data layer - replaces localStorage-based dev-data.ts
import { createClient } from "@/lib/supabase/client";
import {
    Profile,
    Booking,
    BlockedDate,
    LegacyService,
    LegacyBooking,
    serviceToLegacy,
    bookingToLegacy,
    BookingStatus,
    OrganizerProfile,
    Review,
    StorefrontSettings,
    Service,
    TaxRate,
    ServicePackage,
    ServiceAddon,
    VolumeDiscountTier,
    ServiceFixedFee
} from "./database.types";

export type {
    Profile,
    Booking,
    BlockedDate,
    LegacyService,
    LegacyBooking,
    BookingStatus,
    OrganizerProfile,
    Review,
    StorefrontSettings,
    Service,
};

import {
    getPricingConfigurationsForServices,
    getPricingConfiguration // Needed for updateService recalculation logic
} from "./pricing/data";
import { calculatePriceRange } from "./pricing/pricing-engine";

// Helper to attach pricing to legacy services
async function attachPricingToServices(services: LegacyService[]): Promise<LegacyService[]> {
    if (services.length === 0) return [];

    const supabase = createClient();

    // Extract unique config IDs directly from the service objects
    const configIds = Array.from(new Set(
        services
            .map(s => s.pricingConfigurationId)
            .filter((id): id is string => !!id)
    ));

    if (configIds.length === 0) return services;

    // Fetch configs directly
    const { data: configs, error } = await supabase
        .from("pricing_configurations")
        .select("*")
        .in("id", configIds);

    if (error) {
        console.error("Error fetching pricing configs for attachment:", error);
        return services; // Return original on error
    }

    // Map back
    return services.map(service => {
        const config = configs?.find(c => c.id === service.pricingConfigurationId);

        let minPrice = 0;
        let maxPrice = 0;

        // If we have a config, calculate the range
        // If not (and it's a legacy service), maybe it relied on explicit basePrice? 
        // But we are removing that. So default to 0 is strictly correct for "Configurable" services.

        if (config) {
            // Note: passing 0 as basePrice because we don't use the legacy columns anymore
            const range = calculatePriceRange(0, config.steps || [], config.rules || []);
            minPrice = range.minPrice;
            maxPrice = range.maxPrice;
        }

        return {
            ...service,
            min_price: minPrice,
            max_price: maxPrice,
            basePrice: 0,
            price: minPrice
        };
    });
}

// ===== SERVICES =====

export async function getServices(): Promise<LegacyService[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching services:", error);
        return [];
    }

    const legacyServices = (data || []).map(serviceToLegacy);
    return attachPricingToServices(legacyServices);
}

export async function getServicesByOrganizer(organizerId: string): Promise<LegacyService[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("organizer_id", organizerId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching organizer services:", error);
        return [];
    }

    const legacyServices = (data || []).map(serviceToLegacy);
    return attachPricingToServices(legacyServices);
}

export async function getService(id: string): Promise<LegacyService | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        console.error(`Error fetching service for ID "${id}":`, JSON.stringify(error, null, 2));
        throw new Error(`Failed to fetch service: ${error.message || JSON.stringify(error)}`);
    }

    if (!data) return null;

    const legacyService = serviceToLegacy(data);
    const [enrichedService] = await attachPricingToServices([legacyService]);
    return enrichedService;
}

export async function createService(
    service: Omit<LegacyService, "id" | "createdAt" | "rating" | "reviews">
): Promise<LegacyService | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("services")
        .insert({
            organizer_id: service.organizerId,
            title: service.title,
            description: service.description,
            // Removed legacy pricing columns (base_price, pricing_type, etc.)
            // pricing_configuration_id is handled in a separate step or needs to be nullable
            features: service.features,
            images: service.images,
            is_active: service.isActive,
        })
        .select()
        .single();

    if (error || !data) {
        console.error("Error creating service:", JSON.stringify(error, null, 2));
        return null;
    }

    return serviceToLegacy(data);
}

export async function updateService(
    id: string,
    updates: Partial<LegacyService>
): Promise<LegacyService | null> {
    const supabase = createClient();

    // Convert legacy field names to database field names
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.description !== undefined) dbUpdates.description = updates.description;

    // Base Price logic removed - prices are purely configuration-driven now.


    // Legacy columns removed from DB - do not update
    // if (updates.pricingType !== undefined) dbUpdates.pricing_type = updates.pricingType;
    // if (updates.pricing_model !== undefined) dbUpdates.pricing_model = updates.pricing_model;
    // if (updates.province !== undefined) dbUpdates.province = updates.province;
    // if (updates.minGuests !== undefined) dbUpdates.min_guests = updates.minGuests;
    // if (updates.maxGuests !== undefined) dbUpdates.max_guests = updates.maxGuests;
    if (updates.features !== undefined) dbUpdates.features = updates.features;
    if (updates.images !== undefined) dbUpdates.images = updates.images;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

    const { data, error } = await supabase
        .from("services")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();

    if (error || !data) {
        console.error("Error updating service:", error);
        return null;
    }

    return serviceToLegacy(data);
}

export async function deleteService(id: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase.from("services").delete().eq("id", id);

    if (error) {
        console.error("Error deleting service:", error);
        return false;
    }

    return true;
}



// ===== BOOKINGS =====

export async function getBookings(): Promise<LegacyBooking[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("bookings")
        .select("*, services(images, description)")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching bookings:", error);
        return [];
    }

    return (data || []).map(bookingToLegacy);
}

export async function getBookingsByCustomer(customerId: string): Promise<LegacyBooking[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("bookings")
        .select("*, services(images, description)")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching customer bookings:", error);
        return [];
    }

    return (data || []).map(bookingToLegacy);
}

export async function getBookingsByOrganizer(organizerId: string): Promise<LegacyBooking[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("bookings")
        .select("*, services(images, description)")
        .eq("organizer_id", organizerId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching organizer bookings:", error);
        return [];
    }

    return (data || []).map(bookingToLegacy);
}

export async function getBooking(id: string): Promise<LegacyBooking | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("bookings")
        .select("*, services(images, description)")
        .eq("id", id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        console.error("Error fetching booking:", error);
        return null;
    }

    return bookingToLegacy(data);
}

export async function createBooking(
    booking: Omit<LegacyBooking, "id" | "createdAt" | "paymentStatus">
): Promise<LegacyBooking | null> {
    const supabase = createClient();

    // Log discount info for debugging
    if (booking.discountId || booking.promoCodeId) {
        console.log("Creating booking with discount:", {
            discountId: booking.discountId,
            promoId: booking.promoCodeId,
            amount: booking.discountAmount
        });
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
            discount_id: booking.discountId,
            promo_code_id: booking.promoCodeId,
            discount_amount: booking.discountAmount,
            original_price: booking.originalPrice,
            pricing_breakdown: booking.pricingBreakdown
        })
        .select()
        .single();

    if (error || !data) {
        console.error("Error creating booking:", JSON.stringify(error, null, 2));
        return null;
    }

    return bookingToLegacy(data);
}

export async function updateBookingStatus(
    id: string,
    status: BookingStatus
): Promise<LegacyBooking | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

    if (error || !data) {
        console.error("Error updating booking status:", error);
        return null;
    }

    return bookingToLegacy(data);
}

// ===== BLOCKED DATES =====

export async function getBlockedDates(): Promise<BlockedDate[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("blocked_dates")
        .select("*")
        .order("blocked_date", { ascending: true });

    if (error) {
        console.error("Error fetching blocked dates:", error);
        return [];
    }

    return data || [];
}

export async function getBlockedDatesByOrganizer(organizerId: string): Promise<BlockedDate[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("blocked_dates")
        .select("*")
        .eq("organizer_id", organizerId)
        .order("blocked_date", { ascending: true });

    if (error) {
        console.error("Error fetching organizer blocked dates:", error);
        return [];
    }

    return data || [];
}

export async function addBlockedDate(
    organizerId: string,
    date: string,
    reason: string = "Unavailable"
): Promise<BlockedDate | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("blocked_dates")
        .insert({
            organizer_id: organizerId,
            blocked_date: date,
            reason,
        })
        .select()
        .single();

    if (error || !data) {
        console.error("Error adding blocked date:", error);
        return null;
    }

    return data;
}

export async function removeBlockedDate(id: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase.from("blocked_dates").delete().eq("id", id);

    if (error) {
        console.error("Error removing blocked date:", error);
        return false;
    }

    return true;
}

// ===== AVAILABILITY CHECK =====

export async function checkOrganizerAvailability(
    organizerId: string,
    date: string
): Promise<{ available: boolean; reason?: string }> {
    const supabase = createClient();

    // Check blocked dates
    const { data: blockedData } = await supabase
        .from("blocked_dates")
        .select("*")
        .eq("organizer_id", organizerId)
        .eq("blocked_date", date)
        .single();

    if (blockedData) {
        return { available: false, reason: blockedData.reason || "The organizer has blocked this date" };
    }

    // Check existing bookings (removed restriction to allow multiple bookings)
    /*
    const { data: bookingData } = await supabase
        .from("bookings")
        .select("*")
        .eq("organizer_id", organizerId)
        .eq("event_date", date)
        .in("status", ["confirmed", "pending"])
        .limit(1);

    if (bookingData && bookingData.length > 0) {
        return { available: false, reason: "The organizer already has a booking on this date" };
    }
    */

    return { available: true };
}

// ===== CALENDAR EVENTS =====

export async function getCalendarEvents(organizerId: string): Promise<Array<{
    id: string;
    date: string;
    title: string;
    type: "booking" | "blocked";
    status?: string;
    customerName?: string;
    serviceName?: string;
}>> {
    const supabase = createClient();

    // Fetch bookings
    const { data: bookings } = await supabase
        .from("bookings")
        .select("*")
        .eq("organizer_id", organizerId)
        .neq("status", "cancelled");

    // Fetch blocked dates
    const { data: blockedDates } = await supabase
        .from("blocked_dates")
        .select("*")
        .eq("organizer_id", organizerId);

    const bookingEvents = (bookings || []).map((b: Booking) => ({
        id: b.id,
        date: b.event_date,
        title: b.service_name,
        type: "booking" as const,
        status: b.status,
        customerName: b.customer_name,
        serviceName: b.service_name,
    }));

    const blockedEvents = (blockedDates || []).map((b: BlockedDate) => ({
        id: b.id,
        date: b.blocked_date,
        title: b.reason || "Blocked",
        type: "blocked" as const,
    }));

    return [...bookingEvents, ...blockedEvents];
}

// ===== USER/PROFILE =====

export async function getOrganizerInfo(
    organizerId: string
): Promise<{ name: string; businessName: string; subdomain?: string } | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("organizers")
        .select("name, business_name, subdomain")
        .eq("id", organizerId)
        .single();

    if (error || !data) {
        console.error("Error fetching organizer info:", error);
        return null;
    }

    return {
        name: data.name,
        businessName: data.business_name || data.name,
        subdomain: data.subdomain,
    };
}

export async function getProfile(userId: string): Promise<Profile | null> {
    const supabase = createClient();

    // Try organizer first
    const { data: organizer } = await supabase
        .from("organizers")
        .select("*")
        .eq("id", userId)
        .single();

    if (organizer) {
        return { ...organizer, role: "organizer" } as unknown as Profile;
    }

    // Try customer
    const { data: customer } = await supabase
        .from("customers")
        .select("*")
        .eq("id", userId)
        .single();

    if (customer) {
        return { ...customer, role: "customer" } as unknown as Profile;
    }

    return null;
}

export async function updateProfile(
    userId: string,
    updates: Partial<Omit<Profile, "id" | "email" | "created_at">>
): Promise<Profile | null> {
    const supabase = createClient();

    // Try updating organizer
    const { data: organizer, error: orgError } = await supabase
        .from("organizers")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();

    if (organizer) {
        return { ...organizer, role: "organizer" } as unknown as Profile;
    }

    // If not organizer (or error), try customer
    const { data: customer, error: custError } = await supabase
        .from("customers")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();

    if (customer) {
        return { ...customer, role: "customer" } as unknown as Profile;
    }

    console.error("Error updating profile (checked both tables):", orgError, custError);
    return null;
}

// ===== ORGANIZER PROFILES =====

export async function getOrganizerProfile(
    organizerId: string
): Promise<OrganizerProfile | null> {
    const supabase = createClient();
    // Assuming storefront_settings is linked or merged. 
    // In new schema, storefront_settings is a jsonb col in organizers table OR keep 1:1 table.
    // The SQL migration added "storefront_settings jsonb" to organizers table, but existing code expects a relation.
    // However, I also kept "storefront_settings" table in the DB maybe? I didn't drop it.
    // Let's assume we use the relation for now as I didn't drop the table.
    // But I should check if the relation exists on 'organizers' table. 
    // If I created 'organizers' table fresh, I didn't create a foreign key from 'storefront_settings' to 'organizers'.
    // The SQL plan didn't migrate 'storefront_settings' table foreign keys (Step 4 only did bookings).
    // Oops. The 'storefront_settings.organizer_id' FK points to 'profiles' (or auth.users?).
    // If it points to 'auth.users', it matches 'organizers.id' since that is also 'auth.users.id'.
    // So the relation might still work via the shared ID.
    // But Supabase/PostgREST join needs explicit FK.
    // I should query 'storefront_settings' separately or rely on the new jsonb column if I migrated data there.
    // The SQL did: "storefront_settings jsonb" in organizers table.
    // But I didn't populate it in the migration script explicitly from the table (I just copied from profiles?).
    // "FROM public.profiles" -> profiles didn't have storefront_settings jsonb, it had a relation?
    // Wait, let's look at migration script again. 
    // "storefront_settings jsonb" was added. 
    // But the INSERT used: "SELECT ... FROM public.profiles".
    // Does profiles have storefront_settings column?
    // In `database.types.ts`, `Profile` has `storefront_settings?: StorefrontSettings`.
    // But Type definition often merges relations.
    // If the data is in a separate table, I should query it from there.
    // Let's query both 'organizers' and 'storefront_settings' by ID.

    const { data: organizer, error } = await supabase
        .from("organizers")
        .select("*")
        .eq("id", organizerId)
        .single();

    if (error || !organizer) {
        console.error("Error fetching organizer profile:", error);
        return null;
    }

    // Fetch settings separately since relation might be broken or I need to migrate FK
    const { data: settings } = await supabase
        .from("storefront_settings")
        .select("*")
        .eq("organizer_id", organizerId)
        .single();

    const profile = organizer as OrganizerProfile;
    profile.storefront_settings = settings || undefined; // Manual merge

    return profile;


}

export async function updateOrganizerProfile(
    organizerId: string,
    updates: Partial<Omit<OrganizerProfile, "id" | "email" | "created_at" | "role">>
): Promise<OrganizerProfile | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("organizers")
        .update(updates)
        .eq("id", organizerId)
        .select()
        .single();

    if (error || !data) {
        console.error("Error updating organizer profile:", error);
        return null;
    }

    return data as OrganizerProfile;
}

export async function getAllOrganizers(): Promise<OrganizerProfile[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("organizers")
        .select("*")
        .order("name", { ascending: true });

    if (error) {
        console.error("Error fetching all organizers:", error);
        return [];
    }

    return (data || []) as OrganizerProfile[];
}

export async function uploadOrganizerLogo(
    file: File,
    organizerId: string
): Promise<string | null> {
    // Import the storage utility
    const { uploadOrganizerLogo: uploadLogo } = await import("@/lib/supabase-storage");

    // Upload using the new storage utility with proper folder structure
    const publicUrl = await uploadLogo(file, organizerId);

    if (!publicUrl) {
        console.error("Failed to upload logo");
        return null;
    }

    // Update profile with new logo URL
    const updateResult = await updateOrganizerProfile(organizerId, { logo_url: publicUrl });
    console.log("Profile update result:", updateResult);

    return publicUrl;
}

export async function uploadServiceImages(
    files: File[],
    organizerId: string,
    serviceId: string
): Promise<string[]> {
    // Import the storage utility
    const { uploadServiceImages: uploadImages } = await import("@/lib/supabase-storage");

    // Upload using the new storage utility with proper folder structure
    const publicUrls = await uploadImages(files, organizerId, serviceId);

    console.log(`Uploaded ${publicUrls.length} service images`);

    return publicUrls;
}

export async function uploadGalleryImages(
    files: File[],
    organizerId: string
): Promise<string[]> {
    // Import the storage utility
    const { uploadGalleryImages: uploadImages } = await import("@/lib/supabase-storage");

    // Upload using the new storage utility with proper folder structure
    const publicUrls = await uploadImages(files, organizerId);

    console.log(`Uploaded ${publicUrls.length} gallery images`);

    // Update organizer profile with new gallery images
    const currentProfile = await getOrganizerProfile(organizerId);
    if (currentProfile) {
        const existingGallery = currentProfile.gallery || [];
        await updateOrganizerProfile(organizerId, {
            gallery: [...existingGallery, ...publicUrls],
        });
    }

    return publicUrls;
}

// ===== REVIEWS =====

export async function getReviewsByOrganizer(
    organizerId: string
): Promise<Review[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("reviews")
        .select(`
            *,
            customers:customer_id(name),
            bookings:booking_id(service_name)
        `)
        .eq("organizer_id", organizerId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching reviews:", error);
        return [];
    }

    return (data || []).map((review: Review & { customers: { name: string } | null, bookings: { service_name: string } | null }) => {
        const customerName = review.customers?.name || "Anonymous";
        const serviceName = review.bookings?.service_name || "Service";

        return {
            id: review.id,
            booking_id: review.booking_id,
            customer_id: review.customer_id,
            organizer_id: review.organizer_id,
            service_id: review.service_id,
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            is_verified: review.is_verified,
            created_at: review.created_at,
            customer_name: customerName,
            service_name: serviceName,
        } as Review;
    });
}

export async function getReviewsByService(
    serviceId: string
): Promise<Review[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("reviews")
        .select(`
            *,
            customers:customer_id(name)
        `)
        .eq("service_id", serviceId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching service reviews:", error);
        return [];
    }

    return (data || []).map((review: Review & { customers: { name: string } | null }) => {
        const customerName = review.customers?.name || "Anonymous";

        return {
            id: review.id,
            booking_id: review.booking_id,
            customer_id: review.customer_id,
            organizer_id: review.organizer_id,
            service_id: review.service_id,
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            is_verified: review.is_verified,
            created_at: review.created_at,
            customer_name: customerName,
        } as Review;
    });
}

export async function createReview(
    review: Omit<Review, "id" | "created_at" | "is_verified" | "customer_name" | "service_name">
): Promise<Review | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("reviews")
        .insert({
            booking_id: review.booking_id,
            customer_id: review.customer_id,
            organizer_id: review.organizer_id,
            service_id: review.service_id,
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            is_verified: true,
        })
        .select()
        .single();

    if (error || !data) {
        console.error("Error creating review:", error);
        return null;
    }

    // Update organizer's average rating
    await updateOrganizerRating(review.organizer_id);

    return data as Review;
}

export async function hasReviewedBooking(
    bookingId: string
): Promise<boolean> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("reviews")
        .select("id")
        .eq("booking_id", bookingId)
        .single();

    if (error && error.code !== "PGRST116") {
        console.error("Error checking review:", error);
    }

    return !!data;
}

async function updateOrganizerRating(organizerId: string): Promise<void> {
    const supabase = createClient();

    // Calculate new average rating
    const { data, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("organizer_id", organizerId);

    if (error || !data || data.length === 0) {
        return;
    }

    const totalReviews = data.length;
    const avgRating = data.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    // Update organizer profile
    await supabase
        .from("organizers")
        .update({
            avg_rating: Math.round(avgRating * 100) / 100,
            total_reviews: totalReviews,
        })
        .eq("id", organizerId);
}

// ===== SUBDOMAIN & STOREFRONT MANAGEMENT =====

/**
 * Get organizer profile by subdomain (for storefront routing)
 */
export async function getOrganizerBySubdomain(
    subdomain: string | undefined
): Promise<OrganizerProfile | null> {
    if (!subdomain) {
        console.log(`[getOrganizerBySubdomain] No subdomain provided`);
        return null;
    }

    const supabase = createClient();

    console.log(`[getOrganizerBySubdomain] Looking up subdomain: "${subdomain}"`);

    // Try with direct query on organizers table
    const { data: organizer, error } = await supabase
        .from("organizers")
        .select("*")
        .eq("subdomain", subdomain.toLowerCase())
        .eq("storefront_enabled", true)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            console.log(`[getOrganizerBySubdomain] No organizer found for subdomain: "${subdomain}"`);
            return null;
        }
        console.error(`[getOrganizerBySubdomain] Unexpected error:`, error);
        return null;
    }

    if (!organizer) return null;

    // If found, fetch settings
    const { data: settings } = await supabase
        .from("storefront_settings")
        .select("*")
        .eq("organizer_id", organizer.id)
        .single();

    const profile = organizer as any;
    profile.storefront_settings = settings || undefined;

    return profile as OrganizerProfile;
}


/**
 * Check if a subdomain is available
 */
export async function checkSubdomainAvailability(subdomain: string): Promise<boolean> {
    const supabase = createClient();

    // Check reserved subdomains first
    const { data: reserved } = await supabase
        .from("reserved_subdomains")
        .select("subdomain")
        .eq("subdomain", subdomain.toLowerCase())
        .single();

    if (reserved) {
        return false; // Reserved subdomain
    }

    // Check if already taken by another organizer
    const { data } = await supabase
        .from("organizers")
        .select("id")
        .eq("subdomain", subdomain.toLowerCase())
        .single();

    return !data; // Available if no data found
}

/**
 * Update organizer subdomain
 */
export async function updateOrganizerSubdomain(
    organizerId: string,
    subdomain: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;
    if (!subdomainRegex.test(subdomain)) {
        return {
            success: false,
            error: "Subdomain must be 3-63 characters, lowercase letters, numbers, and hyphens only"
        };
    }

    // Check availability
    const isAvailable = await checkSubdomainAvailability(subdomain);
    if (!isAvailable) {
        return { success: false, error: "This subdomain is already taken or reserved" };
    }

    const { error } = await supabase
        .from("organizers")
        .update({
            subdomain: subdomain.toLowerCase(),
            storefront_enabled: true,
        })
        .eq("id", organizerId);

    if (error) {
        console.error("Error updating subdomain:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Get storefront settings for an organizer
 */
export async function getStorefrontSettings(
    organizerId: string
): Promise<StorefrontSettings | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("storefront_settings")
        .select("*")
        .eq("organizer_id", organizerId)
        .single();

    if (error) {
        console.error("Error fetching storefront settings:", error);
        return null;
    }

    return data;
}

/**
 * Create or update storefront settings
 */
export async function upsertStorefrontSettings(
    organizerId: string,
    settings: Partial<Omit<StorefrontSettings, "id" | "organizer_id" | "created_at" | "updated_at">>
): Promise<StorefrontSettings | null> {
    const supabase = createClient();

    // Check if settings exist
    const existing = await getStorefrontSettings(organizerId);

    if (existing) {
        // Update existing settings
        const { data, error } = await supabase
            .from("storefront_settings")
            .update(settings)
            .eq("organizer_id", organizerId)
            .select()
            .single();

        if (error) {
            console.error("Error updating storefront settings:", error);
            return null;
        }

        return data;
    } else {
        // Create new settings
        const { data, error } = await supabase
            .from("storefront_settings")
            .insert({
                organizer_id: organizerId,
                ...settings,
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating storefront settings:", error);
            return null;
        }

        return data;
    }
}

/**
 * Get all active storefronts (for discovery/directory)
 */
export async function getActiveStorefronts(): Promise<OrganizerProfile[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("organizers")
        .select("*")
        .eq("storefront_enabled", true)
        .not("subdomain", "is", null)
        .order("created_at", { ascending: false });

    // Note: This function previously joined storefront_settings. 
    // We might need to map or fetch settings if needed for the directory.
    // For now returning basic organizer info.


    if (error) {
        console.error("Error fetching active storefronts:", error);
        return [];
    }

    return (data || []) as OrganizerProfile[];
}

/**
 * Disable storefront for an organizer
 */
export async function disableStorefront(organizerId: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
        .from("organizers")
        .update({ storefront_enabled: false })
        .eq("id", organizerId);

    if (error) {
        console.error("Error disabling storefront:", error);
        return false;
    }

    return true;
}

/**
 * Enable storefront for an organizer
 */
export async function enableStorefront(organizerId: string): Promise<boolean> {
    const supabase = createClient();

    // Check if organizer has a subdomain
    const profile = await getProfile(organizerId);
    if (!profile?.subdomain) {
        console.error("Cannot enable storefront without a subdomain");
        return false;
    }

    const { error } = await supabase
        .from("organizers")
        .update({ storefront_enabled: true })
        .eq("id", organizerId);

    if (error) {
        console.error("Error enabling storefront:", error);
        return false;
    }

    return true;
}


/**
 * Tax Rate Fetching Functions
 */

/**
 * Get all available Canadian tax rates from database
 */
export async function getTaxRates(): Promise<TaxRate[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("tax_rates")
        .select("*")
        .order("name", { ascending: true });

    if (error) {
        console.error("Error fetching tax rates:", error);
        return [];
    }

    return (data || []) as TaxRate[];
}

/**
 * Get tax rate for a specific province
 * @param province - Can be province code (AB, ON) or name
 */
export async function getTaxRateForProvince(province: string): Promise<TaxRate | null> {
    const supabase = createClient();

    // Attempt to match by code (province) or name
    const { data, error } = await supabase
        .from("tax_rates")
        .select("*")
        .or(`province.eq.${province},name.eq.${province}`)
        .maybeSingle();

    if (error) {
        console.error(`Error fetching tax rate for province ${province}:`, error);
        return null;
    }

    return data as TaxRate;
}

// Tax rates removed from schema


// ============================================================================
// DISCOUNT & PROMO CODE FUNCTIONS
// ============================================================================

/**
 * Get all active discounts for a service
 */
export async function getServiceDiscounts(serviceId: string, organizerId: string) {
    const supabase = createClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .eq('organizer_id', organizerId)
        .eq('is_active', true)
        .or(`valid_from.is.null,valid_from.lte.${now}`)
        .or(`valid_until.is.null,valid_until.gte.${now}`)
        .order('priority', { ascending: true });

    if (error) {
        console.error('Error fetching service discounts:', error);
        return [];
    }

    // Filter for applicable discounts
    return (data || []).filter(discount => {
        if (discount.scope === 'service_specific') {
            return discount.applicable_service_ids?.includes(serviceId);
        }
        return discount.scope === 'global';
    });
}

/**
 * Get all active discounts for an organizer
 */
export async function getOrganizerDiscounts(organizerId: string) {
    const supabase = createClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .eq('organizer_id', organizerId)
        .eq('is_active', true)
        .or(`valid_from.is.null,valid_from.lte.${now}`)
        .or(`valid_until.is.null,valid_until.gte.${now}`)
        .order('priority', { ascending: true });

    if (error) {
        console.error('Error fetching organizer discounts:', error);
        return [];
    }

    return data || [];
}

/**
 * Validate a promo code
 */
export async function validatePromoCode(code: string, organizerId: string) {
    const supabase = createClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('organizer_id', organizerId)
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

    if (error || !data) {
        return { valid: false, error: 'Invalid promo code', promo: null };
    }

    // Check validity period
    if (data.valid_from && new Date(data.valid_from) > new Date(now)) {
        return { valid: false, error: 'Promo code not yet active', promo: null };
    }
    if (data.valid_until && new Date(data.valid_until) < new Date(now)) {
        return { valid: false, error: 'Promo code has expired', promo: null };
    }

    // Check usage limits
    if (data.max_total_uses && data.current_total_uses >= data.max_total_uses) {
        return { valid: false, error: 'Promo code usage limit reached', promo: null };
    }

    return { valid: true, error: null, promo: data };
}
