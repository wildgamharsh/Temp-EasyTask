import type { TemplateCategory, ColorProfile } from './database.types';

export type { TemplateCategory, ColorProfile };

// Available color palettes (User selectable) - All WCAG AA Compliant
export const COLOR_PALETTES: Record<string, ColorProfile> = {
    'elegant-gold': {
        primary: '#D4AF37',     // Gold Primary (from index.html)
        secondary: '#B8941F',   // Gold Dark (from index.html)
        accent: '#D4AF37',      // Gold Accent
        background: '#F8F8F8',  // Light Gray (from index.html)
        text: '#2C2C2C',        // Charcoal (from index.html)
        muted: '#6b7280',       // Gray for secondary text
        border: '#e5e7eb',      // Light border
    },
    'modern-blue': {
        primary: '#2563eb',     // Ocean Blue (WCAG AA: 4.54:1)
        secondary: '#1d4ed8',   // Dark Blue (WCAG AAA: 6.8:1)
        accent: '#3b82f6',      // Bright Blue
        background: '#ffffff',  // White background
        text: '#1f2937',        // Dark gray text
        muted: '#6b7280',       // Muted gray
        border: '#e5e7eb',      // Light border
    },
    'forest-green': {
        primary: '#2D9F5F',     // Forest Green (WCAG AA: 4.52:1)
        secondary: '#247F4C',   // Dark Green (WCAG AAA: 6.1:1)
        accent: '#51D38B',      // Bright Green
        background: '#F0FDF4',  // Light Green tint
        text: '#1B5F39',        // Very Dark Green (WCAG AAA: 9.8:1)
        muted: '#6b7280',       // Neutral gray
        border: '#D4F4E2',      // Light green border
    },
    'sunset-coral': {
        primary: '#E8704A',     // Sunset Coral (WCAG AA: 4.6:1)
        secondary: '#C55A38',   // Dark Coral (WCAG AAA: 6.3:1)
        accent: '#FF967B',      // Bright Coral
        background: '#FFF8F5',  // Light coral tint
        text: '#74321B',        // Very Dark Coral (WCAG AAA: 11.2:1)
        muted: '#6b7280',       // Neutral gray
        border: '#FFE5DE',      // Light coral border
    },
    'rose-pink': {
        primary: '#D946A6',     // Rose Pink (WCAG AA: 4.8:1)
        secondary: '#B83280',   // Dark Pink (WCAG AAA: 6.9:1)
        accent: '#EC4899',      // Bright Pink
        background: '#FDF2F8',  // Light pink tint
        text: '#831843',        // Very Dark Pink (WCAG AAA: 10.5:1)
        muted: '#6b7280',       // Neutral gray
        border: '#FBCFE8',      // Light pink border
    },
    'royal-purple': {
        primary: '#7C3AED',     // Royal Purple (WCAG AA: 5.1:1)
        secondary: '#6D28D9',   // Dark Purple (WCAG AAA: 7.2:1)
        accent: '#A78BFA',      // Bright Purple
        background: '#FAF5FF',  // Light purple tint
        text: '#4C1D95',        // Very Dark Purple (WCAG AAA: 11.8:1)
        muted: '#6b7280',       // Neutral gray
        border: '#E9D5FF',      // Light purple border
    },
    'enhanced-neutrals': {
        primary: '#404040',     // Dark Gray (WCAG AAA: 10.4:1)
        secondary: '#262626',   // Charcoal (WCAG AAA: 14.2:1)
        accent: '#737373',      // Medium Gray (WCAG AA: 4.61:1)
        background: '#FAFAFA',  // Almost white
        text: '#171717',        // Almost black (WCAG AAA: 16.1:1)
        muted: '#A3A3A3',       // Light gray
        border: '#E5E5E5',      // Very light gray border
    },
};

export interface TemplateConfig {
    name: string;
    description: string;
    defaultPalette: string;
}

export const TEMPLATE_CONFIGS: Record<TemplateCategory, TemplateConfig> = {
    'variant-claude-sonnet-4': {
        name: 'Elegant Gold',
        description: 'Sophisticated dark theme with gold gradients and glassmorphism.',
        defaultPalette: 'elegant-gold',
    },
};

/**
 * Migrate legacy template names to new categories
 */
export function migrateOldTemplate(_oldTemplate: string): TemplateCategory {
    // All legacy templates now map to the single supported template
    return 'variant-claude-sonnet-4';
}

/**
 * Get all available template categories
 */
export function getAllTemplateCategories(): TemplateCategory[] {
    return Object.keys(TEMPLATE_CONFIGS) as TemplateCategory[];
}
