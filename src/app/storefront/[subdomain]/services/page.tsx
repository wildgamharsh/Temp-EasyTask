import { notFound } from "next/navigation";
import { getOrganizerBySubdomain, getServicesByOrganizer } from "@/lib/supabase-data";
import { LegacyService, StorefrontSettings } from "@/lib/database.types";
import { ThemeProvider } from "@/components/storefront/ThemeProvider";
import { getDefaultThemeColors } from "@/lib/storefront-renderer";
import StorefrontServices from "./StorefrontServices";

interface PageProps {
    params: Promise<{
        subdomain: string;
    }>;
}

export default async function StorefrontServicesPage({ params }: PageProps) {
    const { subdomain } = await params;

    // 1. Fetch Organizer
    const organizer = await getOrganizerBySubdomain(subdomain);
    if (!organizer) {
        notFound();
    }

    // 2. Fetch Organizer's Services
    const services = await getServicesByOrganizer(organizer.id);

    // 3. Theme Configuration
    const settings = organizer.storefront_settings || {} as StorefrontSettings;
    const themeColors = getDefaultThemeColors(settings);

    let finalColors = { ...themeColors };
    if (settings.theme_colors) {
        finalColors = { ...finalColors, ...settings.theme_colors };
    }
    if (settings.custom_colors) {
        finalColors = { ...finalColors, ...settings.custom_colors };
    }

    return (
        <ThemeProvider colors={finalColors}>
            <StorefrontServices
                organizer={organizer}
                services={services || []}
                subdomain={subdomain}
            />
        </ThemeProvider>
    );
}
