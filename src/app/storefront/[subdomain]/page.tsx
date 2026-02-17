import { notFound } from "next/navigation";
import { getOrganizerBySubdomain, getServicesByOrganizer } from "@/lib/supabase-data";
import { getTemplateName, getDefaultThemeColors, generateThemeCSS } from "@/lib/storefront-renderer";
import { ThemeProvider } from "@/components/storefront/ThemeProvider";
import { VariantClaudeSonnet4 } from "@/components/storefront/templates";
import { serviceToLegacy, type LegacyService, type StorefrontSettings } from "@/lib/database.types";

export default async function StorefrontHome({
    params,
}: {
    params: Promise<{ subdomain: string }>;
}) {
    const { subdomain } = await params;

    // Fetch organizer data
    const organizerData = await getOrganizerBySubdomain(subdomain);

    if (!organizerData) {
        notFound();
    }

    const organizer = organizerData;

    // Get services
    const services = await getServicesByOrganizer(organizer.id);

    // Use settings or defaults if missing
    const settings = organizer.storefront_settings || {} as StorefrontSettings;

    // Get selected template
    const templateCategory = getTemplateName(settings);

    // Get theme colors
    const themeColors = getDefaultThemeColors(settings);
    // Merge with custom colors if present in settings, although getDefaultThemeColors or ThemeProvider might handle this.
    // Actually, `generateThemeCSS` is better for global injection but `ThemeProvider` takes a `colors` object.
    // Let's rely on `getDefaultThemeColors` strategy + manual override if `settings.theme_colors` is present.

    // settings.theme_colors from DB is the "saved" profile.
    // settings.color_profile is the "computed" one? No, `storefront-renderer` uses `settings.color_profile` as legacy?
    // Let's use `themeColors` derived from template defaults, then override with settings.

    let finalColors = { ...themeColors };
    if (settings.theme_colors) {
        finalColors = { ...finalColors, ...settings.theme_colors };
    }
    // Also check legacy/overrides if needed (custom_colors, or specific color fields)
    if (settings.custom_colors) {
        finalColors = { ...finalColors, ...settings.custom_colors };
    }

    // Determine which component to render
    // Determine which component to render
    // Since we only support one template now, we force it.
    // The getTemplateName logic in renderer also defaults to this, but we simplify here explicitly.
    const TemplateComponent = VariantClaudeSonnet4;

    return (
        <ThemeProvider colors={finalColors}>
            <TemplateComponent
                organizer={organizer}
                services={services}
                settings={settings}
            />
        </ThemeProvider>
    );
}
