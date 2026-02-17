/**
 * Premium Demo Storefront Data
 * Provides impressive, realistic fallback data with demo services
 */

import type { OrganizerProfile, StorefrontSettings, LegacyService } from "./database.types";

/**
 * Get premium demo organizer data with rich content
 */
export function getPremiumDemoData(subdomain: string): OrganizerProfile {
    const capitalizedName = subdomain.charAt(0).toUpperCase() + subdomain.slice(1);
    const businessName = `${capitalizedName} Events & Celebrations`;

    return {
        id: `demo-${subdomain}`,
        email: `hello@${subdomain}events.com`,
        name: capitalizedName,
        role: "organizer",
        business_name: businessName,
        subdomain: subdomain,
        storefront_enabled: true,
        custom_domain: undefined,
        logo_url: undefined,
        description: `${businessName} is your premier partner in creating unforgettable experiences. With over 10 years of expertise in event planning and execution, we specialize in transforming your vision into reality. Our dedicated team of professionals brings creativity, precision, and passion to every celebration, ensuring that your special moments are nothing short of extraordinary.\n\nFrom intimate gatherings to grand celebrations, we handle every detail with care and excellence. Our comprehensive services cover everything from elegant catering and stunning decorations to seamless event coordination. We pride ourselves on our attention to detail, personalized approach, and commitment to exceeding expectations.\n\nLet us help you create memories that last a lifetime.`,
        staff_count: 25,
        features: [
            "Professional Event Planning",
            "Custom Menu Design",
            "Premium Decor Services",
            "Full-Service Coordination",
            "Experienced Staff",
            "Flexible Packages"
        ],
        gallery: [
            "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1519167758481-83f29da8c2b0?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&h=600&fit=crop"
        ],
        differentiators: "What sets us apart is our unwavering commitment to excellence and personalization. We don't just plan events; we craft experiences tailored to your unique story and style.",
        is_verified: true,
        avg_rating: 4.9,
        total_reviews: 127,
        created_at: new Date().toISOString(),
        storefront_settings: getPremiumStorefrontSettings(subdomain, businessName),
    };
}

/**
 * Get premium storefront settings
 */
export function getPremiumStorefrontSettings(
    subdomain: string,
    businessName?: string
): StorefrontSettings {
    const name = businessName || `${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)} Events & Celebrations`;

    return {
        id: `demo-settings-${subdomain}`,
        organizer_id: `demo-${subdomain}`,

        // Branding
        business_name: name,
        tagline: "Creating Unforgettable Moments, One Celebration at a Time",
        logo_url: undefined,
        banner_url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1920&h=600&fit=crop",
        favicon_url: undefined,

        // Theme - Elegant purple to gold gradient
        primary_color: "#8b5cf6",
        secondary_color: "#d946ef",
        accent_color: "#f59e0b",
        background_color: "#ffffff",
        text_color: "#1f2937",
        font_family: "Inter, sans-serif",

        // Content
        about_text: `Welcome to ${name}!\n\nWe are passionate about transforming your special occasions into extraordinary experiences. With a decade of expertise in event planning and execution, our team brings together creativity, professionalism, and meticulous attention to detail.\n\nOur Services:\n• Gourmet Catering - From intimate dinners to grand banquets\n• Elegant Decorations - Stunning themes and custom designs\n• Complete Event Planning - Stress-free coordination from start to finish\n• Professional Staff - Experienced, courteous, and dedicated\n\nWhat Makes Us Different:\nWe believe every celebration tells a unique story. Our approach is deeply personalized, ensuring that your event reflects your vision, style, and personality. We don't just meet expectations—we exceed them.\n\nOur Promise:\n✓ Uncompromising quality in every detail\n✓ Transparent pricing with no hidden costs\n✓ Flexible packages tailored to your needs\n✓ Dedicated support throughout your journey\n\nLet's create something beautiful together.`,
        welcome_message: `Welcome to ${name}`,
        contact_email: `hello@${subdomain}events.com`,
        contact_phone: "+1 (555) 123-4567",
        address: "123 Celebration Avenue, Event City, EC 12345",
        social_links: {
            facebook: "https://facebook.com",
            instagram: "https://instagram.com",
            twitter: "https://twitter.com",
            pinterest: "https://pinterest.com"
        },

        // SEO
        meta_title: `${name} - Premium Event Planning & Catering Services`,
        meta_description: `Transform your celebrations with ${name}. Professional event planning, gourmet catering, and elegant decorations. Serving you with excellence for over 10 years.`,
        meta_keywords: ["event planning", "catering", "wedding services", "party planning", "decorations", subdomain, "celebrations"],
        og_image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&h=630&fit=crop",

        // Features
        show_reviews: true,
        show_gallery: true,
        show_testimonials: true,
        booking_requires_approval: false,
        allow_guest_booking: true,
        min_booking_notice_hours: 72,
        max_booking_days_ahead: 365,

        // Business Hours
        business_hours: {
            monday: { open: "09:00", close: "18:00", closed: false },
            tuesday: { open: "09:00", close: "18:00", closed: false },
            wednesday: { open: "09:00", close: "18:00", closed: false },
            thursday: { open: "09:00", close: "18:00", closed: false },
            friday: { open: "09:00", close: "19:00", closed: false },
            saturday: { open: "10:00", close: "17:00", closed: false },
            sunday: { open: "11:00", close: "16:00", closed: false },
        },

        // Policies
        cancellation_policy: "We understand that plans change. Cancellations made 7+ days before your event receive a full refund. Cancellations 3-7 days prior receive a 50% refund. Unfortunately, we cannot offer refunds for cancellations within 72 hours of your event. We're happy to reschedule your booking at no additional charge (subject to availability).",
        terms_and_conditions: "By booking our services, you agree to our terms and conditions. Full payment is required to confirm your booking. We reserve the right to modify services based on availability and circumstances beyond our control.",
        privacy_policy: "We respect your privacy and protect your personal information. Your data is used solely for service delivery and will never be shared with third parties without your consent.",

        // Analytics
        google_analytics_id: undefined,
        facebook_pixel_id: undefined,

        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
}

/**
 * Get demo services for impressive showcase
 */
export function getDemoServices(subdomain: string): LegacyService[] {
    const organizerId = `demo-${subdomain}`;

    return [
        {
            id: `demo-service-1-${subdomain}`,
            organizerId,
            title: "Premium Wedding Catering Package",
            description: "Elevate your special day with our exquisite wedding catering service. Our culinary team creates custom menus featuring gourmet cuisine, from elegant appetizers to stunning multi-course meals. We accommodate all dietary preferences and cultural traditions, ensuring every guest enjoys an unforgettable dining experience. Includes professional service staff, premium tableware, and elegant presentation.",
            category: "catering",
            basePrice: 125,
            pricingType: "per_person",
            minGuests: 50,
            maxGuests: 300,
            features: [
                "Custom menu design with tasting session",
                "Professional chef and service staff",
                "Premium ingredients and gourmet preparation",
                "Elegant table settings and presentation",
                "Dietary accommodations (vegan, gluten-free, etc.)",
                "Beverage service and bar setup",
                "Cake cutting service",
                "Cleanup and waste management"
            ],
            images: [
                "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&h=600&fit=crop",
                "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
                "https://images.unsplash.com/photo-1478145787956-f6f12c59624d?w=800&h=600&fit=crop"
            ],
            rating: 4.9,
            reviews: 45,
            location: "Available across the city",
            isActive: true,
            createdAt: new Date().toISOString(),
        },
        {
            id: `demo-service-2-${subdomain}`,
            organizerId,
            title: "Luxury Event Decoration & Design",
            description: "Transform your venue into a breathtaking masterpiece with our luxury decoration service. Our creative team designs and executes stunning themes tailored to your vision. From romantic weddings to corporate galas, we handle every detail—floral arrangements, lighting design, drapery, centerpieces, and more. We source premium materials and work with top vendors to create an atmosphere that wows your guests.",
            category: "decoration",
            basePrice: 8500,
            pricingType: "fixed",
            minGuests: undefined,
            maxGuests: undefined,
            features: [
                "Personalized theme consultation",
                "Custom floral arrangements and centerpieces",
                "Professional lighting design",
                "Elegant drapery and backdrops",
                "Table settings and linens",
                "Entrance and stage decoration",
                "Photo booth setup and props",
                "Setup and teardown included"
            ],
            images: [
                "https://images.unsplash.com/photo-1519167758481-83f29da8c2b0?w=800&h=600&fit=crop",
                "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop",
                "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop"
            ],
            rating: 4.8,
            reviews: 38,
            location: "Available across the city",
            isActive: true,
            createdAt: new Date().toISOString(),
        },
        {
            id: `demo-service-3-${subdomain}`,
            organizerId,
            title: "Corporate Event Planning & Coordination",
            description: "Impress your clients and colleagues with flawlessly executed corporate events. Our professional planning team manages every aspect—from venue selection and vendor coordination to day-of execution. Whether it's a conference, product launch, or company celebration, we ensure a seamless experience that reflects your brand's excellence. Includes timeline management, guest coordination, and on-site supervision.",
            category: "catering",
            basePrice: 5000,
            pricingType: "fixed",
            minGuests: 20,
            maxGuests: 500,
            features: [
                "Comprehensive event planning and timeline",
                "Venue selection and negotiation",
                "Vendor coordination and management",
                "Budget planning and tracking",
                "Guest list management and RSVPs",
                "Day-of coordination and supervision",
                "Audio-visual setup coordination",
                "Post-event wrap-up and reporting"
            ],
            images: [
                "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&h=600&fit=crop",
                "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop"
            ],
            rating: 5.0,
            reviews: 29,
            location: "Available across the city",
            isActive: true,
            createdAt: new Date().toISOString(),
        },
        {
            id: `demo-service-4-${subdomain}`,
            organizerId,
            title: "Intimate Dinner Party Catering",
            description: "Create an unforgettable dining experience in the comfort of your home or chosen venue. Perfect for birthdays, anniversaries, or special gatherings of 10-30 guests. Our chef prepares a custom multi-course meal using fresh, seasonal ingredients. Enjoy restaurant-quality cuisine with personalized service, allowing you to relax and enjoy time with your guests.",
            category: "catering",
            basePrice: 3500,
            pricingType: "fixed",
            minGuests: 10,
            maxGuests: 30,
            features: [
                "Private chef service",
                "Custom 4-course menu",
                "Fresh, locally-sourced ingredients",
                "Professional table service",
                "Wine pairing recommendations",
                "Kitchen cleanup included",
                "Dietary accommodations",
                "Elegant plating and presentation"
            ],
            images: [
                "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
                "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop"
            ],
            rating: 4.9,
            reviews: 52,
            location: "In-home or venue of your choice",
            isActive: true,
            createdAt: new Date().toISOString(),
        }
    ];
}
