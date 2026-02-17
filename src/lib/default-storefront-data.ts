/**
 * Default Storefront Data
 * Provides fallback data when organizer or storefront settings not found
 */

import type { OrganizerProfile, StorefrontSettings } from "./database.types";

/**
 * Get default organizer data for demo/preview mode
 */
export function getDefaultOrganizerData(subdomain: string): OrganizerProfile {
    const capitalizedName = subdomain.charAt(0).toUpperCase() + subdomain.slice(1);

    return {
        id: `demo-${subdomain}`,
        email: `${subdomain}@example.com`,
        name: capitalizedName,
        role: "organizer",
        business_name: `${capitalizedName} Events`,
        subdomain: subdomain,
        storefront_enabled: true,
        custom_domain: undefined,
        logo_url: undefined,
        description: `Welcome to ${capitalizedName} Events! We're setting up our storefront. Check back soon for our services and offerings.`,
        staff_count: undefined,
        features: undefined,
        gallery: undefined,
        differentiators: undefined,
        is_verified: false,
        avg_rating: 0,
        total_reviews: 0,
        created_at: new Date().toISOString(),
        storefront_settings: getDefaultStorefrontSettings(subdomain, capitalizedName),
    };
}

/**
 * Get default storefront settings
 */
export function getDefaultStorefrontSettings(
    subdomain: string,
    businessName?: string
): StorefrontSettings {
    const name = businessName || subdomain.charAt(0).toUpperCase() + subdomain.slice(1);

    return {
        id: `demo-settings-${subdomain}`,
        organizer_id: `demo-${subdomain}`,

        // Branding
        business_name: `${name} Events`,
        tagline: "Creating Memorable Experiences",
        logo_url: undefined,
        banner_url: undefined,
        favicon_url: undefined,

        // Theme - Modern purple gradient
        primary_color: "#2563eb",
        secondary_color: "#764ba2",
        accent_color: "#10b981",
        background_color: "#ffffff",
        text_color: "#1f2937",
        font_family: "Geist Sans",

        // Content
        about_text: `Welcome to ${name} Events! We're currently setting up our storefront. Our team is dedicated to providing exceptional event services. Stay tuned for our complete service catalog and booking options.`,
        welcome_message: `Welcome to ${name} Events`,
        contact_email: undefined,
        contact_phone: undefined,
        address: undefined,
        social_links: {},

        // SEO
        meta_title: `${name} Events - Professional Event Services`,
        meta_description: `Book professional event services with ${name} Events. Quality service providers for your special occasions.`,
        meta_keywords: ["events", "services", "booking", subdomain],
        og_image: undefined,

        // Features
        show_reviews: true,
        show_gallery: true,
        show_testimonials: true,
        booking_requires_approval: false,
        allow_guest_booking: true,
        min_booking_notice_hours: 24,
        max_booking_days_ahead: 365,

        // Business Hours - Default 9-5 weekdays
        business_hours: {
            monday: { open: "09:00", close: "17:00", closed: false },
            tuesday: { open: "09:00", close: "17:00", closed: false },
            wednesday: { open: "09:00", close: "17:00", closed: false },
            thursday: { open: "09:00", close: "17:00", closed: false },
            friday: { open: "09:00", close: "17:00", closed: false },
            saturday: { open: "10:00", close: "14:00", closed: false },
            sunday: { open: "", close: "", closed: true },
        },

        // Policies
        cancellation_policy: "Cancellations must be made at least 48 hours in advance for a full refund.",
        terms_and_conditions: undefined,
        privacy_policy: undefined,

        // Analytics
        google_analytics_id: undefined,
        facebook_pixel_id: undefined,

        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
}

/**
 * Merge organizer data with defaults
 * Ensures all required fields have values
 */
export function mergeWithDefaults(
    organizer: Partial<OrganizerProfile> | null,
    subdomain: string
): OrganizerProfile {
    if (!organizer) {
        return getDefaultOrganizerData(subdomain);
    }

    const defaults = getDefaultOrganizerData(subdomain);

    return {
        ...defaults,
        ...organizer,
        // Ensure storefront_settings exists
        storefront_settings: organizer.storefront_settings || defaults.storefront_settings,
    };
}
