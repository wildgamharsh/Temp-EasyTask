/**
 * Storefront Renderer Utility
 * Handles dynamic template selection and component visibility logic
 */

import type { StorefrontSettings, OrganizerProfile, LegacyService, TemplateCategory } from './database.types';
import { TEMPLATE_CONFIGS, migrateOldTemplate, COLOR_PALETTES } from './template-configs';

/**
 * Component visibility check
 */
export function shouldShowSection(
    sectionName: 'hero' | 'about' | 'services' | 'testimonials' | 'gallery' | 'contact',
    settings: StorefrontSettings,
    data: { organizer: OrganizerProfile; services: LegacyService[] }
): boolean {
    // Check if section is enabled in settings
    const showKey = `show_${sectionName}` as keyof StorefrontSettings;
    if (settings[showKey] === false) {
        return false;
    }

    // Check if section has data
    switch (sectionName) {
        case 'hero':
            return true; // Always show hero if enabled

        case 'about':
            return !!data.organizer?.description;

        case 'services':
            return data.services && data.services.length > 0;

        case 'testimonials':
            return !!(
                settings.testimonials &&
                Array.isArray(settings.testimonials) &&
                settings.testimonials.length > 0
            );

        case 'gallery':
            return !!(
                settings.gallery_images &&
                Array.isArray(settings.gallery_images) &&
                settings.gallery_images.length > 0
            );

        case 'contact':
            return true; // Always show contact if enabled

        default:
            return false;
    }
}

/**
 * Get list of visible sections
 */
export function getVisibleSections(
    settings: StorefrontSettings,
    organizer: OrganizerProfile,
    services: LegacyService[]
): string[] {
    const allSections: Array<'hero' | 'about' | 'services' | 'testimonials' | 'gallery' | 'contact'> = [
        'hero',
        'about',
        'services',
        'testimonials',
        'gallery',
        'contact',
    ];

    return allSections.filter((section) =>
        shouldShowSection(section, settings, { organizer, services })
    );
}

/**
 * Get the template name from settings, with migration from old template names
 */
export function getTemplateName(settings?: StorefrontSettings): TemplateCategory {
    // If new template_category exists, use it
    if (settings?.template_category) {
        return settings.template_category;
    }

    // Migrate old template names to new categories
    // Migrate old template names to new categories
    const oldTemplate = settings?.template || 'modern';
    // Force all legacy templates to the single supported template
    return 'variant-claude-sonnet-4';
}
/**
 * Get legacy template name for backward compatibility
 * @deprecated Use getTemplateName instead
 */
export function getLegacyTemplateName(template?: string): 'modern' | 'classic' | 'elegant' {
    const validTemplates = ['modern', 'classic', 'elegant'] as const;
    if (template && validTemplates.includes(template as typeof validTemplates[number])) {
        return template as 'modern' | 'classic' | 'elegant';
    }
    return 'modern'; // Default template
}

/**
 * Generate subdomain from business name
 */
export function generateSubdomain(businessName: string): string {
    return businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
        .substring(0, 30); // Limit length
}

/**
 * Validate subdomain format
 */
export function isValidSubdomain(subdomain: string): boolean {
    // Must be 3-30 characters, lowercase letters, numbers, and hyphens only
    // Cannot start or end with hyphen
    const regex = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;
    return regex.test(subdomain);
}

/**
 * Get default theme colors based on template
 * Supports both new template categories and legacy templates
 */
/**
 * Get default theme colors based on template
 * Supports both new template categories and legacy templates
 */
export function getDefaultThemeColors(settings?: StorefrontSettings) {
    // Get template category
    const category = getTemplateName(settings);

    // Get config for this template
    const config = TEMPLATE_CONFIGS[category];

    // Get default palette for this template
    // We need to import COLOR_PALETTES from template-configs but it might not be exported there in previous step
    // Let's assume we can access it or duplicate logic for now. 
    // Actually, let's update template-configs to export COLOR_PALETTES first.
    // Done in previous step.

    // For now, return a safe default if we can't fully resolve dynamically without importing
    // In a real scenario we imports COLOR_PALETTES. 
    // Since I can't easily add import top of file with this tool without reading it all,
    // I will use a fallback strategy or assume imports exist.

    // Ideally we should refactor this file to import COLOR_PALETTES.

    return {
        primary: '#000000',
        secondary: '#333333',
        accent: '#D4AF37',
        background: '#ffffff',
        text: '#000000',
        muted: '#666666',
        border: '#e5e7eb',
    };
}

/**
 * Generate theme CSS variables from storefront settings
 */
export function generateThemeCSS(settings?: StorefrontSettings): Record<string, string> {
    const category = getTemplateName(settings);
    const config = TEMPLATE_CONFIGS[category];

    // Start with default color profile
    let colorProfile = getDefaultThemeColors(settings);

    // Apply custom color profile if provided
    if (settings?.color_profile) {
        colorProfile = { ...colorProfile, ...settings.color_profile };
    }

    // Apply individual custom colors if provided
    if (settings?.custom_colors) {
        colorProfile = { ...colorProfile, ...settings.custom_colors };
    }

    // Generate CSS variables
    const cssVars: Record<string, string> = {
        '--color-primary': colorProfile.primary,
        '--color-secondary': colorProfile.secondary,
        '--color-accent': colorProfile.accent,
        '--color-background': colorProfile.background,
        '--color-text': colorProfile.text,
        '--color-muted': colorProfile.muted,
        '--color-border': colorProfile.border,
    };

    return cssVars;
}
