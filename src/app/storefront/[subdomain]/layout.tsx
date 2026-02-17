
import { notFound } from "next/navigation";
import { getOrganizerBySubdomain } from "@/lib/supabase-data";
import { getDefaultOrganizerData } from "@/lib/default-storefront-data";
import { getPremiumDemoData } from "@/lib/premium-demo-data";
import GoogleFontsLoader from "@/components/storefront/GoogleFontsLoader";
import type { Metadata } from "next";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
    const { subdomain } = await params;
    const organizer = await getOrganizerBySubdomain(subdomain);

    if (!organizer) {
        return {
            title: "Storefront Not Found",
        };
    }

    const settings = organizer.storefront_settings;

    return {
        title: settings?.meta_title || organizer.business_name || organizer.name,
        description:
            settings?.meta_description ||
            `Book services from ${organizer.business_name || organizer.name}`,
        keywords: settings?.meta_keywords,
        openGraph: {
            title: settings?.meta_title || organizer.business_name || organizer.name,
            description: settings?.meta_description,
            images: settings?.og_image ? [settings.og_image] : undefined,
        },
    };
}

export default async function StorefrontLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ subdomain: string }>;
}) {
    const { subdomain } = await params;
    let organizer = await getOrganizerBySubdomain(subdomain);

    // Use premium demo data if organizer not found (instead of 404)
    if (!organizer) {
        organizer = getPremiumDemoData(subdomain);
    }

    // Handle case where storefront_settings might not exist yet
    const settings = organizer.storefront_settings || {
        business_name: organizer.business_name || organizer.name,
        tagline: "Welcome to our services",
        logo_url: organizer.logo_url,
        banner_url: undefined,
        favicon_url: undefined,
        primary_color: "#2563eb",
        secondary_color: "#8b5cf6",
        accent_color: "#10b981",
        background_color: "#ffffff",
        text_color: "#1f2937",
        font_family: "Geist Sans",
        about_text: organizer.description || "",
        welcome_message: undefined,
        contact_email: undefined,
        contact_phone: undefined,
        address: undefined,
        social_links: {},
        meta_title: undefined,
        meta_description: undefined,
        meta_keywords: undefined,
        og_image: undefined,
        show_reviews: true,
        show_gallery: true,
        show_testimonials: true,
        booking_requires_approval: false,
        allow_guest_booking: true,
        min_booking_notice_hours: 24,
        max_booking_days_ahead: 365,
        business_hours: {},
        cancellation_policy: undefined,
        terms_and_conditions: undefined,
        privacy_policy: undefined,
        google_analytics_id: undefined,
        facebook_pixel_id: undefined,
        theme_colors: {
            primary: "#2563eb",
            secondary: "#8b5cf6",
            accent: "#10b981",
            background: "#ffffff",
            text: "#1f2937",
            muted: "#6b7280",
        }
    };

    // Apply custom theme if available
    const themeStyles = settings
        ? {
            "--storefront-primary": settings.theme_colors?.primary || settings.primary_color,
            "--storefront-secondary": settings.theme_colors?.secondary || settings.secondary_color,
            "--storefront-accent": settings.theme_colors?.accent || settings.accent_color,
            "--storefront-background": settings.theme_colors?.background || settings.background_color,
            "--storefront-text": settings.theme_colors?.text || settings.text_color,
            fontFamily: settings.font_family,
        }
        : {};

    return (
        <div
            className="min-h-screen flex flex-col"
            style={themeStyles as React.CSSProperties}
        >
            <GoogleFontsLoader fontFamily={settings?.font_family} />
            <main className="flex-1">{children}</main>


        </div>
    );
}
