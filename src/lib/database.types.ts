/**
 * Database Type Definitions
 * TypeScript interfaces for Supabase database tables
 */

export type UserRole = "customer" | "organizer" | "admin";
export type PricingType = "fixed" | "per_person" | "hourly";
export type BookingStatus = "pending" | "confirmed" | "rejected" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "refunded";

// Discount system types
export type DiscountType = "percentage" | "flat_amount" | "percentage_capped" | "free_service";
export type DiscountScope = "global" | "service_specific" | "category_specific";

// Dynamic Pricing Model types
export type ServicePricingModel = "fixed" | "packages" | "per_person";

// Canadian Province type (imported from canadian-tax.ts for consistency)



// Canadian Province type (imported from canadian-tax.ts for consistency)
export type CanadianProvince =
    | "Alberta"
    | "British Columbia"
    | "Manitoba"
    | "New Brunswick"
    | "Newfoundland and Labrador"
    | "Northwest Territories"
    | "Nova Scotia"
    | "Nunavut"
    | "Ontario"
    | "Prince Edward Island"
    | "Quebec"
    | "Saskatchewan"
    | "Yukon";

// Tax Rate from database
export interface TaxRate {
    province: string; // The code (e.g., 'ON', 'BC') or name
    name: string;
    gst_rate: number;
    pst_rate: number;
    hst_rate: number;
    created_at?: string;
    updated_at?: string;
}

// Service Package (for 'packages' pricing model)
export interface ServicePackage {
    id: string;
    service_id: string;
    name: string;
    description?: string;
    price: number;
    display_order: number;
    features: string[];
    is_popular: boolean;
    created_at: string;
    updated_at: string;
    addons?: ServiceAddon[]; // Package-specific addons
}

// Service Add-on (flat-fee extras)
export interface ServiceAddon {
    id: string;
    service_id: string;
    package_id?: string; // null = global addon available for all packages
    name: string;
    description?: string;
    price: number;
    is_active: boolean;
    created_at: string;
}

// Volume Discount Tier (for 'per_person' pricing model)
export interface VolumeDiscountTier {
    id: string;
    service_id: string;
    min_guests: number;
    price_per_person: number;
    display_order: number;
    created_at: string;
}

// Service Fixed Fee (one-time fees for per_person model)
export interface ServiceFixedFee {
    id: string;
    service_id: string;
    name: string;
    price: number;
    is_active: boolean;
    created_at: string;
}

// Complete pricing configuration for a service
export interface ServicePricingConfig {
    pricing_model: ServicePricingModel;
    province?: CanadianProvince;

    // Fixed model data
    base_price: number;
    fixed_addons?: ServiceAddon[];

    // Packages model data
    packages?: ServicePackage[];
    global_addons?: ServiceAddon[];

    // Per-person model data
    per_person_base_price?: number;
    max_guests?: number;
    has_volume_discounts?: boolean;
    volume_tiers?: VolumeDiscountTier[];
    fixed_fees?: ServiceFixedFee[];
}



// Pricing breakdown stored in bookings

// Pricing breakdown stored in bookings
export interface BookingPricingBreakdown {
    pricing_model: ServicePricingModel;
    base_amount: number;
    package_name?: string;
    package_price?: number;
    addons?: Array<{ name: string; price: number }>;
    package_addons?: Array<{ name: string; price: number }>;
    guest_count?: number;
    price_per_person?: number;
    fixed_fees?: Array<{ name: string; price: number }>;
    fixed_charges?: Array<{ name: string; price: number }>; // Alias for UI consistency
    volume_tier_applied?: string;
    subtotal: number;
    // tax fields
    tax_amount?: number;
    tax_rate?: number;
    service_fee?: number;
    total: number;
    total_amount?: number; // Alias for UI consistency
}



// Organizers table (New)
export interface Organizer {
    id: string;
    email: string;
    name: string;
    business_name: string;
    subdomain: string;
    storefront_enabled: boolean;
    custom_domain?: string;
    logo_url?: string;
    description?: string;
    staff_count?: number;
    features?: string[];
    gallery?: string[];
    differentiators?: string;
    is_verified: boolean;
    avg_rating: number;
    total_reviews: number;
    onboarding_completed: boolean;
    storefront_settings?: StorefrontSettings;
    locations_covered?: string[];
    created_at: string;
    updated_at: string;
}

// Customers table (New)
export interface Customer {
    id: string;
    email: string;
    name: string;
    organizer_id: string; // Strict link
    platform_origin?: string;
    created_at: string;
    updated_at: string;
}

// Deprecated: Profile (keeping for reference during refactor)
export interface Profile {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    // Legacy optional fields
    business_name?: string;
    subdomain?: string;
    storefront_enabled?: boolean;
    custom_domain?: string;
    onboarding_completed?: boolean;
    logo_url?: string;
    description?: string;
    gallery?: string[];
    created_at: string;
}


export interface Service {
    id: string;
    organizer_id: string;
    title: string;
    description: string;
    pricing_configuration_id?: string; // Pointer to detached configuration

    // core metadata
    features: string[];
    images: string[];
    rating: number;
    reviews: number;
    is_active: boolean;
    province?: string; // Added back for UI location display
    created_at: string;

    // Legacy/Compatibility Fields (Restored)
    base_price?: number;
    pricing_model?: ServicePricingModel;
    pricing_type?: PricingType;
    min_guests?: number;
    max_guests?: number;
    packages?: ServicePackage[];
    addons?: ServiceAddon[];
    volume_tiers?: VolumeDiscountTier[];
    fixed_fees?: ServiceFixedFee[];
}

export interface Booking {
    id: string;
    customer_id: string;
    customer_name: string;
    customer_email: string;
    service_id: string;
    service_name: string;
    organizer_id: string;
    organizer_name: string;
    event_date: string;
    event_time: string;
    start_time?: string;
    end_time?: string;
    status: BookingStatus;
    payment_status: PaymentStatus;
    pricing_display?: boolean;
    location?: string;
    created_at: string;

    // Completion Confirmation
    organizer_completed_at?: string;
    customer_completed_at?: string;

    // UI / Derived placeholders (Restored for Build)
    guest_count?: number;
    subtotal?: number;
    discount_amount?: number;
    total_price?: number;
    notes?: string;
    tax_amount?: number;
    tax_province?: string;
    pricing_breakdown?: BookingPricingBreakdown;

    // Schema Fields (Restored)
    configuration_snapshot?: PricingConfiguration;
    selection_state?: Record<string, string[]>;
    step_quantities?: Record<string, number>;
    proposed_price?: number;
}


export interface BlockedDate {
    id: string;
    organizer_id: string;
    blocked_date: string;
    reason: string;
    created_at: string;
}

// Extended profile for organizers
export interface OrganizerProfile {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    business_name?: string;
    subdomain?: string;
    storefront_enabled?: boolean;
    custom_domain?: string;
    logo_url?: string;
    description?: string;
    staff_count?: number;
    features?: string[];
    gallery?: string[];
    differentiators?: string;
    is_verified?: boolean;
    avg_rating?: number;
    total_reviews?: number;
    onboarding_completed?: boolean;
    created_at: string;
    storefront_settings?: StorefrontSettings;
    locations_covered?: string[];
}

// Template categories based on converted HTML templates
// Template categories based on converted HTML templates
export type TemplateCategory = 'variant-claude-sonnet-4';

// Color profile definition
export interface ColorProfile {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    muted: string;
    border?: string;
    success?: string;
    warning?: string;
    error?: string;
    info?: string;
}

// Storefront customization settings
export interface StorefrontSettings {
    id: string;
    organizer_id: string;

    // Branding
    business_name: string;
    tagline?: string;
    logo_url?: string;
    banner_url?: string;
    favicon_url?: string;
    auth_description?: string;

    // Auth Page Customization
    login_heading?: string;
    login_description?: string;
    signup_heading?: string;
    signup_description?: string;
    auth_background_url?: string;

    // Template Selection
    template?: 'modern' | 'classic' | 'elegant'; // Legacy template names
    template_category?: TemplateCategory; // New template system

    // Theme Colors (Standard field)
    theme_colors?: ColorProfile;

    // Computed/Legacy color accessors (aliases for compatibility)
    color_profile?: ColorProfile;
    custom_colors?: Partial<ColorProfile>;

    // Legacy color fields (for backward compatibility)
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    background_color?: string;
    text_color?: string;
    font_family?: string;

    // Component Visibility
    show_hero?: boolean;
    show_about?: boolean;
    show_services?: boolean;
    show_testimonials?: boolean;
    show_gallery?: boolean;
    show_contact?: boolean;
    show_social_links?: boolean;

    // Hero Section
    hero_title?: string;
    hero_subtitle?: string;
    hero_cta_text?: string;
    hero_cta_link?: string;

    // Content
    about_text?: string;
    welcome_message?: string;
    contact_email?: string;
    contact_phone?: string;
    address?: string;
    social_links?: Record<string, string>;

    // Testimonials & Gallery
    testimonials?: Array<{
        name: string;
        role?: string;
        content: string;
        rating?: number;
        image?: string;
    }>;
    gallery_images?: string[];
    gallery_testimonials?: Array<{
        image_url: string;
        testimonials: Array<{
            name: string;
            comment: string;
            date?: string;
        }>;
    }>;

    // SEO
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string[];
    og_image?: string;

    // Features
    show_reviews?: boolean;
    booking_requires_approval?: boolean;
    allow_guest_booking?: boolean;
    min_booking_notice_hours?: number;
    max_booking_days_ahead?: number;

    // Business Hours
    business_hours?: Record<string, {
        open: string;
        close: string;
        closed: boolean;
    }>;

    // Policies
    cancellation_policy?: string;
    terms_and_conditions?: string;
    privacy_policy?: string;

    // Analytics
    google_analytics_id?: string;
    facebook_pixel_id?: string;

    // Advanced
    custom_css?: string;
    layout_spacing?: 'compact' | 'comfortable' | 'spacious';
    pricing_display?: boolean;

    created_at: string;
    updated_at: string;
}

// Review interface
export interface Review {
    id: string;
    booking_id: string;
    customer_id: string;
    organizer_id: string;
    service_id: string;
    rating: number;
    title?: string;
    comment?: string;
    is_verified: boolean;
    created_at: string;
    customer_name?: string;
    service_name?: string;
}

// Legacy compatibility types (for gradual migration)
export interface LegacyService {
    id: string;
    organizerId: string;
    title: string;
    description: string;
    basePrice: number;
    pricingType: PricingType;
    minGuests?: number;
    maxGuests?: number;
    features: string[];
    images: string[];
    rating: number;
    reviews: number;
    isActive: boolean;
    createdAt: string;
    pricingConfigurationId?: string; // Needed for linking

    // Runtime Calculated Fields (Not in DB)
    min_price?: number;
    max_price?: number;

    // Added for compatibility with new templates
    price?: number | string;
    image_url?: string;
    tags?: string[];
    category?: string;
    location?: string;

    // Added for Dynamic Pricing
    pricing_model?: ServicePricingModel;
    province?: CanadianProvince;
    // packages?: ServicePackage[];
    // addons?: ServiceAddon[];
}

export interface LegacyBooking {
    id: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    serviceId: string;
    serviceName: string;
    organizerId: string;
    organizerName: string;
    eventDate: string;
    eventTime: string;
    guestCount: number;
    totalPrice: number;
    serviceFee: number;
    notes: string;
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    createdAt: string;
    serviceImage?: string;
    discountId?: string;
    promoCodeId?: string;
    discountAmount?: number;
    originalPrice?: number;
    pricingBreakdown?: BookingPricingBreakdown;
    serviceDescription?: string;

    // New Snapshot Fields
    configurationSnapshot?: PricingConfiguration;
    selectionState?: Record<string, string[]>;
    stepQuantities?: Record<string, number>;
}

// Conversion utilities
export function serviceToLegacy(service: Service): LegacyService {
    return {
        id: service.id,
        organizerId: service.organizer_id,
        title: service.title,
        description: service.description,
        pricingConfigurationId: service.pricing_configuration_id,
        basePrice: 0, // Fallback to 0
        pricingType: 'fixed', // Default or derived? "pricing_type" removed from DB. Defaults to fixed.
        minGuests: 0, // Removed from DB
        maxGuests: 0, // Removed from DB
        features: service.features,
        images: service.images,
        rating: service.rating,
        reviews: service.reviews,
        isActive: service.is_active,
        createdAt: service.created_at,
        min_price: 0,
        max_price: 0,

        // Compatibility fields
        price: 0,
        image_url: service.images?.[0] || '',
        pricing_model: 'fixed', // Removed from DB, default to fixed
        province: undefined, // Removed from Service

    };
}

export function bookingToLegacy(booking: Booking): LegacyBooking {
    type BookingWithService = Booking & {
        services: { images: string[]; description: string } | null | { images: string[]; description: string }[];
    };

    const typedBooking = booking as unknown as BookingWithService;
    const serviceInfo = Array.isArray(typedBooking.services)
        ? typedBooking.services[0]
        : typedBooking.services;

    const serviceImages = serviceInfo?.images;
    const serviceDescription = serviceInfo?.description;

    return {
        id: booking.id,
        customerId: booking.customer_id,
        customerName: booking.customer_name,
        customerEmail: booking.customer_email,
        serviceId: booking.service_id,
        serviceName: booking.service_name,
        organizerId: booking.organizer_id,
        organizerName: booking.organizer_name,
        eventDate: booking.event_date,
        eventTime: booking.event_time,
        guestCount: 0, // removed
        totalPrice: 0, // removed (should be calculated from snapshot)
        serviceFee: 0, // removed
        notes: "", // removed
        status: booking.status,
        paymentStatus: booking.payment_status,
        createdAt: booking.created_at,
        serviceImage: Array.isArray(serviceImages) && serviceImages.length > 0
            ? serviceImages[0]
            : undefined,
        // discount fields explicitly removed
        discountId: undefined,
        promoCodeId: undefined,
        discountAmount: 0,
        // originalPrice removed
        pricingBreakdown: undefined, // removed
        serviceDescription: serviceDescription,

        // Map Snapshots
        configurationSnapshot: booking.configuration_snapshot,
        selectionState: booking.selection_state,
        stepQuantities: booking.step_quantities
    };
}

// ============================================================================
// EVENT DOCUMENTATION
export interface EventDetails {
    id: string;
    booking_id: string;
    event_date: string;
    customer_name: string;
    organizer_name: string;
    services_taken?: string;
    images?: Array<{
        url: string;
        heading: string;
        caption: string;
    }>;
    created_at: string;
}

// ============================================================================
// DISCOUNT SYSTEM INTERFACES
// ============================================================================

export interface Discount {
    id: string;
    organizer_id: string;
    name: string;
    description?: string;
    internal_code?: string;
    is_active: boolean;
    discount_type: DiscountType;
    discount_value: number;
    max_discount_amount?: number;
    scope: DiscountScope;
    applicable_service_ids?: string[];
    applicable_category_ids?: string[];
    min_cart_value?: number;
    first_time_customer_only: boolean;
    valid_from?: string;
    valid_until?: string;
    max_total_uses?: number;
    max_uses_per_user?: number;
    current_total_uses: number;
    priority: number;
    created_at: string;
    updated_at: string;
    created_by?: string;
}

export interface PromoCode {
    id: string;
    organizer_id: string;
    code: string;
    description?: string;
    is_active: boolean;
    discount_type: DiscountType;
    discount_value: number;
    max_discount_amount?: number;
    scope: DiscountScope;
    applicable_service_ids?: string[];
    applicable_category_ids?: string[];
    min_cart_value?: number;
    first_time_customer_only: boolean;
    valid_from?: string;
    valid_until?: string;
    max_total_uses?: number;
    max_uses_per_user?: number;
    current_total_uses: number;
    created_at: string;
    updated_at: string;
    created_by?: string;
}

export interface DiscountUsageLog {
    id: string;
    discount_id?: string;
    promo_code_id?: string;
    organizer_id: string;
    user_id: string;
    booking_id?: string;
    discount_type: DiscountType;
    discount_value: number;
    applied_discount_amount: number;
    original_amount: number;
    final_amount: number;
    promo_code_used?: string;
    applied_at: string;
}

// Cart item for pricing calculation
export interface CartItem {
    service_id: string;
    service_name: string;
    category?: string;
    price: number;
    quantity: number;
    pricing_type: PricingType;
}

// Pricing breakdown per item
export interface PricingBreakdown {
    service_id: string;
    service_name: string;
    base_price: number;
    quantity: number;
    subtotal: number;
    discount_applicable: boolean;
    discount_amount: number;
    final_price: number;
}

// Checkout line item for pricing API responses
export interface CheckoutLineItem {
    service_id: string;
    service_name: string;
    base_price: number;
    quantity: number;
    subtotal: number;
    discount_applicable: boolean;
    discount_amount: number;
    final_price: number;
    // Dynamic pricing fields
    pricing_model?: ServicePricingModel;
    tax_amount?: number;
    tax_province?: CanadianProvince;
    addons?: Array<{ name: string; price: number }>;
    fixed_fees?: Array<{ name: string; price: number }>;
}

// Applied discount info
export interface AppliedDiscount {
    type: 'discount' | 'promo_code';
    id: string;
    code?: string;
    name: string;
    discount_type: DiscountType;
    discount_value: number;
    max_discount_amount?: number;
}

// Final pricing response from backend
export interface PricingResponse {
    base_total: number;
    discount_applied: AppliedDiscount | null;
    discount_amount: number;
    final_total: number;
    breakdown: CheckoutLineItem[];
    metadata?: {
        is_first_time_customer: boolean;
        promo_code_remaining_uses?: number;
        discount_remaining_uses?: number;
        calculated_at: string;
    };
}

// Promo code validation response
export interface PromoCodeValidation {
    valid: boolean;
    error?: string;
    message?: string;
    promo_code?: {
        id: string;
        code: string;
        discount_type: DiscountType;
        discount_value: number;
        max_discount_amount?: number;
    };
    preview?: {
        base_total: number;
        discount_amount: number;
        final_total: number;
    };
}

// ============================================================================
// BOOKING MODAL SYSTEM INTERFACES
// ============================================================================

// Weekly schedule structure for organizer availability
export interface TimeSlot {
    start: string; // HH:MM format
    end: string;   // HH:MM format
}

export interface WeeklySchedule {
    monday: TimeSlot[];
    tuesday: TimeSlot[];
    wednesday: TimeSlot[];
    thursday: TimeSlot[];
    friday: TimeSlot[];
    saturday: TimeSlot[];
    sunday: TimeSlot[];
}

// Draft booking (incomplete booking in progress)
export interface DraftBooking {
    id: string;
    user_id: string;
    service_id: string;
    organizer_id: string;

    // Step 1: Pricing selections
    pricing_model: ServicePricingModel;
    selected_package_id?: string;
    selected_addon_ids: string[];
    guest_count?: number;
    subtotal?: number;
    tax_amount?: number;
    total_amount?: number;

    // Step 2: Event details
    event_date?: string; // ISO date string
    event_time?: string; // HH:MM format

    // Step 3: Promo code
    promo_code_id?: string;
    discount_amount: number;

    // Additional notes
    notes?: string;

    proposed_price?: number;
    location?: string;



    // Metadata
    expires_at: string;
    created_at: string;
    updated_at: string;
}

// Message Reactions
export interface MessageReaction {
    id: string;
    message_id: string;
    conversation_id: string; // Added via migration 00Z
    user_id: string;
    emoji: string;
    created_at: string;
}

// Organizer availability configuration
export interface OrganizerAvailability {
    id: string;
    organizer_id: string;

    // Weekly schedule
    weekly_schedule: WeeklySchedule;

    // Blocked dates
    blocked_dates: string[]; // Array of ISO date strings

    // Booking buffer (minutes between bookings)
    buffer_minutes: number;

    // Advance booking limits
    min_advance_hours: number;
    max_advance_days: number;

    // Default event duration (minutes)
    default_event_duration: number;

    created_at: string;
    updated_at: string;
}

// Booking time slot (for conflict checking)
export interface BookingTimeSlot {
    id: string;
    booking_id: string;
    organizer_id: string;
    start_time: string; // ISO timestamp
    end_time: string;   // ISO timestamp
    created_at: string;
}

// ============================================================================
// ADMIN SYSTEM INTERFACES
// ============================================================================

export type AdminRole = 'super_admin' | 'support' | 'moderator';

export interface Admin {
    id: string;
    email: string;
    full_name: string;
    role: AdminRole;
    last_login_at?: string;
    created_at: string;
    updated_at: string;
}

export interface AuditLog {
    id: string;
    admin_id: string;
    action: string;
    resource_type: string;
    resource_id?: string;
    details: Record<string, unknown>;
    ip_address?: string;
    created_at: string;
}

// ============================================================================

// ============================================================================
// PRICING FRAMEWORK INTERFACES
// ============================================================================

import { ConfigStep, Rule } from "@/types/pricing";

// Pricing Configuration (Detached)
export interface PricingConfiguration {
    id: string;
    organizer_id: string;
    pricing_mode?: string; // Optional metadata or runtime field
    steps: ConfigStep[];
    rules: Rule[];
    metadata?: Record<string, any>;
    created_at: string;
    updated_at: string;
}

// ============================================================================
// CHAT SYSTEM INTERFACES
// ============================================================================

export type ChatParticipant = Customer | Organizer;

export interface Conversation {
    id: string;
    customer_id: string;
    organizer_id: string;
    booking_id?: string;
    last_message?: string;
    last_message_at: string;
    created_at: string;
    updated_at: string;
    // Join data (optional)
    customer?: Customer;
    organizer?: Organizer;

    // Quote System Fields (REMOVED - MOVED TO quotes TABLE)
}

export interface Quote {
    id: string;
    customer_id: string;
    organizer_id: string;
    booking_id?: string;
    status: 'pending' | 'finalizing' | 'completed' | 'cancelled' | 'rejected';
    quote_data?: any;
    proposed_price?: number;
    last_message?: string;
    last_message_at: string;
    created_at: string;
    updated_at: string;

    // Join Data
    customer?: Customer;
    organizer?: Organizer;
    booking?: { service_name: string; event_date: string };
    unread_count?: number; // Runtime
}

export interface QuoteWithDetails extends Quote {
    customer: Customer;
    organizer: Organizer;
    booking?: { service_name: string; event_date: string };
}

export interface Message {
    id: string;
    conversation_id?: string | null;
    quote_id?: string | null;
    sender_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
    reactions?: MessageReaction[];
}

export interface ConversationWithDetails extends Conversation {
    customer: Customer;
    organizer: Organizer;
    unread_count?: number;
    booking?: { service_name: string; event_date: string };
}

export interface AiConversation {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

export interface AiMessage {
    id: string;
    conversation_id: string;
    role: "user" | "assistant" | "system" | "tool";
    content: string | null;
    model?: string;
    tool_calls?: Record<string, unknown>[];
    tool_call_id?: string;
    created_at: string;
}

// Main Database Definition
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: Partial<Profile>; // Allow partials for flexibility, or strict if needed
                Update: Partial<Profile>;
            };
            services: {
                Row: Service;
                Insert: Partial<Service>;
                Update: Partial<Service>;
            };
            bookings: {
                Row: Booking;
                Insert: Partial<Booking>;
                Update: Partial<Booking>;
            };
            blocked_dates: {
                Row: BlockedDate;
                Insert: Partial<BlockedDate>;
                Update: Partial<BlockedDate>;
            };
            organizer_profiles: {
                Row: OrganizerProfile;
                Insert: Partial<OrganizerProfile>;
                Update: Partial<OrganizerProfile>;
            };
            storefront_settings: {
                Row: StorefrontSettings;
                Insert: Partial<StorefrontSettings>;
                Update: Partial<StorefrontSettings>;
            };
            audit_logs: {
                Row: AuditLog;
                Insert: Partial<AuditLog>;
                Update: Partial<AuditLog>;
            };
            ai_conversations: {
                Row: AiConversation;
                Insert: Partial<AiConversation>;
                Update: Partial<AiConversation>;
            };
            ai_messages: {
                Row: AiMessage;
                Insert: Partial<AiMessage>;
                Update: Partial<AiMessage>;
            };
            conversations: {
                Row: Conversation;
                Insert: Partial<Conversation>;
                Update: Partial<Conversation>;
            };
            quotes: {
                Row: Quote;
                Insert: Partial<Quote>;
                Update: Partial<Quote>;
            };
            messages: {
                Row: Message;
                Insert: Partial<Message>;
                Update: Partial<Message>;
            };
            promo_codes: {
                Row: PromoCode;
                Insert: Partial<PromoCode>;
                Update: Partial<PromoCode>;
            };
            discounts: {
                Row: Discount;
                Insert: Partial<Discount>;
                Update: Partial<Discount>;
            };
            discount_usage_logs: {
                Row: DiscountUsageLog;
                Insert: Partial<DiscountUsageLog>;
                Update: Partial<DiscountUsageLog>;
            };
            reviews: {
                Row: Review;
                Insert: Partial<Review>;
                Update: Partial<Review>;
            };
            // Add pricing configurations table
            pricing_configurations: {
                Row: PricingConfiguration;
                Insert: Partial<PricingConfiguration>;
                Update: Partial<PricingConfiguration>;
            };
        };
        Views: {
            [key: string]: unknown;
        };
        Functions: {
            [key: string]: unknown;
        };
        Enums: {
            [key: string]: unknown;
        };
    };
}
