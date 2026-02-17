import { notFound } from "next/navigation";
import { getOrganizerBySubdomain, getService } from "@/lib/supabase-data";
import { getPricingConfiguration } from "@/lib/pricing/data";
import { Service, StorefrontSettings } from "@/lib/database.types";
import { ThemeProvider } from "@/components/storefront/ThemeProvider";
import { getDefaultThemeColors } from "@/lib/storefront-renderer";
import { StorefrontServiceDetail } from "./StorefrontServiceDetail";

interface PageProps {
    params: Promise<{
        subdomain: string;
        id: string;
    }>;
}

export default async function StorefrontServiceDetailPage({ params }: PageProps) {
    const { subdomain, id } = await params;

    // 1. Fetch Organizer by Subdomain
    const organizer = await getOrganizerBySubdomain(subdomain);
    if (!organizer) {
        notFound();
    }

    // 2. Fetch Service Data
    const legacyService = await getService(id);
    if (!legacyService) {
        notFound();
    }

    // Verify service belongs to organizer
    if (legacyService.organizerId !== organizer.id) {
        notFound();
    }

    // 3. Fetch Full Pricing Configuration
    const pricingConfig = await getPricingConfiguration(id);

    // 4. Construct Service Object
    const service: Service = {
        id: legacyService.id,
        organizer_id: legacyService.organizerId,
        title: legacyService.title,
        description: legacyService.description,
        base_price: legacyService.basePrice,
        pricing_type: legacyService.pricingType,
        pricing_model: (pricingConfig?.pricing_mode as any) || legacyService.pricing_model || 'fixed',
        province: legacyService.province,
        min_guests: legacyService.minGuests,
        max_guests: legacyService.maxGuests,
        features: legacyService.features || [],
        images: legacyService.images || [],
        rating: legacyService.rating,
        reviews: legacyService.reviews,
        is_active: legacyService.isActive,
        created_at: legacyService.createdAt
    };

    // 5. Theme Configuration
    const settings = organizer.storefront_settings || {} as StorefrontSettings;
    const themeColors = getDefaultThemeColors(settings);

    let finalColors = { ...themeColors };
    if (settings.theme_colors) {
        finalColors = { ...finalColors, ...settings.theme_colors };
    }
    if (settings.custom_colors) {
        finalColors = { ...finalColors, ...settings.custom_colors };
    }

    // Calculate Starting Price if Configured
    let startingPrice: number | undefined = undefined;
    if (pricingConfig && pricingConfig.pricing_mode === 'configured') {
        // Dynamically import to avoid persistent build issues if any
        const { calculatePriceRange } = await import("@/lib/pricing/pricing-engine");
        const { minPrice } = calculatePriceRange(
            legacyService.basePrice || 0,
            pricingConfig.steps,
            pricingConfig.rules
        );
        startingPrice = minPrice;
    }

    return (
        <ThemeProvider colors={finalColors}>
            <StorefrontServiceDetail
                service={service}
                organizer={organizer}
                subdomain={subdomain}
                startingPrice={startingPrice}
                pricingConfig={pricingConfig}
            />
        </ThemeProvider>
    );
}
