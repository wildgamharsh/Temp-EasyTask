/**
 * Color Profile Management System
 * Handles color profile operations, validation, and CSS generation
 */

import type { ColorProfile } from './template-configs';

/**
 * Apply color profile to generate CSS custom properties
 */
export function applyColorProfile(profile: ColorProfile): Record<string, string> {
    const cssVars: Record<string, string> = {
        '--color-primary': profile.primary,
        '--color-secondary': profile.secondary,
        '--color-accent': profile.accent,
        '--color-background': profile.background,
        '--color-text': profile.text,
        '--color-muted': profile.muted,
        '--color-border': profile.border || profile.muted,
    };

    // Add optional colors if provided (using type assertion for extended profiles)
    // Add optional colors if provided
    if (profile.success) cssVars['--color-success'] = profile.success;
    if (profile.warning) cssVars['--color-warning'] = profile.warning;
    if (profile.error) cssVars['--color-error'] = profile.error;
    if (profile.info) cssVars['--color-info'] = profile.info;

    // Generate hover and active variants
    const variants = generateColorVariants(profile);
    Object.assign(cssVars, variants);

    return cssVars;
}

/**
 * Generate color variants for hover and active states
 */
export function generateColorVariants(profile: ColorProfile): Record<string, string> {
    const variants: Record<string, string> = {};

    // Primary variants
    variants['--color-primary-hover'] = adjustBrightness(profile.primary, 10);
    variants['--color-primary-active'] = adjustBrightness(profile.primary, -10);

    // Secondary variants
    variants['--color-secondary-hover'] = adjustBrightness(profile.secondary, 10);
    variants['--color-secondary-active'] = adjustBrightness(profile.secondary, -10);

    // Accent variants
    variants['--color-accent-hover'] = adjustBrightness(profile.accent, 10);
    variants['--color-accent-active'] = adjustBrightness(profile.accent, -10);

    // Background variants (subtle)
    variants['--color-background-alt'] = adjustBrightness(profile.background, -5);

    // Text variants
    variants['--color-text-light'] = adjustOpacity(profile.text, 0.7);
    variants['--color-text-lighter'] = adjustOpacity(profile.text, 0.5);

    return variants;
}

/**
 * Adjust color brightness
 */
function adjustBrightness(color: string, percent: number): string {
    // Convert hex to RGB
    const rgb = hexToRgb(color);
    if (!rgb) return color;

    // Adjust brightness
    const factor = 1 + percent / 100;
    const r = Math.min(255, Math.max(0, Math.round(rgb.r * factor)));
    const g = Math.min(255, Math.max(0, Math.round(rgb.g * factor)));
    const b = Math.min(255, Math.max(0, Math.round(rgb.b * factor)));

    return rgbToHex(r, g, b);
}

/**
 * Adjust color opacity (returns rgba)
 */
function adjustOpacity(color: string, opacity: number): string {
    const rgb = hexToRgb(color);
    if (!rgb) return color;

    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    // Remove # if present
    hex = hex.replace('#', '');

    // Parse hex values
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    if (hex.length !== 6) return null;

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

/**
 * Calculate relative luminance (for contrast ratio)
 */
function getLuminance(color: string): number {
    const rgb = hexToRgb(color);
    if (!rgb) return 0;

    // Convert to sRGB
    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;

    // Apply gamma correction
    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);

    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Validate color profile for accessibility
 */
export interface ColorValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export function validateColorProfile(profile: ColorProfile): ColorValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check text on background contrast (WCAG AA requires 4.5:1 for normal text)
    const textBgContrast = getContrastRatio(profile.text, profile.background);
    if (textBgContrast < 4.5) {
        errors.push(`Text/background contrast ratio (${textBgContrast.toFixed(2)}:1) is below WCAG AA standard (4.5:1)`);
    } else if (textBgContrast < 7) {
        warnings.push(`Text/background contrast ratio (${textBgContrast.toFixed(2)}:1) is below WCAG AAA standard (7:1)`);
    }

    // Check accent on background contrast
    const accentBgContrast = getContrastRatio(profile.accent, profile.background);
    if (accentBgContrast < 3) {
        warnings.push(`Accent/background contrast ratio (${accentBgContrast.toFixed(2)}:1) is low. Consider a more contrasting accent color.`);
    }

    // Check if colors are valid hex
    const colors = [
        profile.primary,
        profile.secondary,
        profile.accent,
        profile.background,
        profile.text,
        profile.muted,
        profile.border,
    ].filter((c): c is string => c !== undefined);

    for (const color of colors) {
        if (!isValidHexColor(color)) {
            errors.push(`Invalid color format: ${color}. Use hex format (#RRGGBB)`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Check if string is valid hex color
 */
function isValidHexColor(color: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(color) || /^#[0-9A-Fa-f]{3}$/.test(color);
}

/**
 * Get color profile from custom colors object
 */
export function getColorProfile(
    baseProfile: ColorProfile,
    customColors?: Record<string, string>
): ColorProfile {
    if (!customColors) return baseProfile;

    return {
        ...baseProfile,
        ...customColors,
    };
}

/**
 * Generate CSS string from color profile
 */
export function generateColorCSS(profile: ColorProfile): string {
    const cssVars = applyColorProfile(profile);

    const cssLines = Object.entries(cssVars).map(
        ([key, value]) => `  ${key}: ${value};`
    );

    return `:root {\n${cssLines.join('\n')}\n}`;
}

/**
 * Preset color profiles for quick selection
 */
export const PRESET_COLOR_PROFILES: Record<string, ColorProfile> = {
    'classic-gold': {
        primary: '#1a1a1a',
        secondary: '#2a2a2a',
        accent: '#D4AF37',
        background: '#0a0a0a',
        text: '#ffffff',
        muted: '#888888',
        border: '#333333',
    },
    'rose-gold': {
        primary: '#1a1a1a',
        secondary: '#2a2a2a',
        accent: '#B76E79',
        background: '#0a0a0a',
        text: '#ffffff',
        muted: '#888888',
        border: '#333333',
    },
    'emerald': {
        primary: '#1a1a1a',
        secondary: '#2a2a2a',
        accent: '#50C878',
        background: '#0a0a0a',
        text: '#ffffff',
        muted: '#888888',
        border: '#333333',
    },
    'sapphire': {
        primary: '#1a1a1a',
        secondary: '#2a2a2a',
        accent: '#0F52BA',
        background: '#0a0a0a',
        text: '#ffffff',
        muted: '#888888',
        border: '#333333',
    },
    'warm-cream': {
        primary: '#2C3E50',
        secondary: '#34495E',
        accent: '#E67E22',
        background: '#FDFBF8',
        text: '#2C3E50',
        muted: '#7F8C8D',
        border: '#BDC3C7',
    },
};
