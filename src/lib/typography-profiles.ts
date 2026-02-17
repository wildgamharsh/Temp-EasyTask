/**
 * Typography Profile Management System
 * Handles font loading, CSS generation, and typography utilities
 */


// Define TypographyProfile locally
export interface TypographyProfile {
    headingFont: string;
    bodyFont: string;
    displayFont?: string;
    headingWeight: number;
    bodyWeight: number;
    headingLineHeight: number;
    bodyLineHeight: number;
    headingLetterSpacing: string;
    bodyLetterSpacing: string;
}

/**
 * Font pairing presets for each template category
 */
export const FONT_PAIRINGS: Record<string, { heading: string; body: string; display?: string }> = {
    // Minimal Modern pairings
    'roboto-roboto': {
        heading: 'Roboto',
        body: 'Roboto',
    },
    'montserrat-open-sans': {
        heading: 'Montserrat',
        body: 'Open Sans',
    },
    'poppins-inter': {
        heading: 'Poppins',
        body: 'Inter',
    },

    // Dark Elegant / Luxury pairings
    'playfair-inter': {
        heading: 'Playfair Display',
        body: 'Inter',
    },
    'cormorant-lato': {
        heading: 'Cormorant Garamond',
        body: 'Lato',
    },
    'libre-baskerville-source-sans': {
        heading: 'Libre Baskerville',
        body: 'Source Sans Pro',
    },

    // Luxury Premium pairings
    'playfair-inter-cinzel': {
        heading: 'Playfair Display',
        body: 'Inter',
        display: 'Cinzel',
    },
    'cormorant-lato-cinzel': {
        heading: 'Cormorant Garamond',
        body: 'Lato',
        display: 'Cinzel',
    },
    'bodoni-moda-raleway': {
        heading: 'Bodoni Moda',
        body: 'Raleway',
    },

    // Warm Sophisticated pairings
    'playfair-nunito': {
        heading: 'Playfair Display',
        body: 'Nunito',
    },
    'merriweather-open-sans': {
        heading: 'Merriweather',
        body: 'Open Sans',
    },
    'lora-karla': {
        heading: 'Lora',
        body: 'Karla',
    },
};

/**
 * Generate Google Fonts import URL
 */
export function generateFontImportUrl(profile: TypographyProfile): string {
    const fonts: string[] = [];

    // Add heading font
    fonts.push(`${profile.headingFont.replace(/ /g, '+')}:wght@${profile.headingWeight}`);

    // Add body font if different
    if (profile.bodyFont !== profile.headingFont) {
        fonts.push(`${profile.bodyFont.replace(/ /g, '+')}:wght@${profile.bodyWeight}`);
    }

    // Add display font if present
    if (profile.displayFont && profile.displayFont !== profile.headingFont) {
        fonts.push(`${profile.displayFont.replace(/ /g, '+')}:wght@700`);
    }

    const fontQuery = fonts.join('&family=');
    return `https://fonts.googleapis.com/css2?family=${fontQuery}&display=swap`;
}

/**
 * Apply typography profile to generate CSS custom properties
 */
export function applyTypographyProfile(profile: TypographyProfile): Record<string, string> {
    const cssVars: Record<string, string> = {
        '--font-heading': `'${profile.headingFont}', serif`,
        '--font-body': `'${profile.bodyFont}', sans-serif`,
        '--font-weight-heading': profile.headingWeight.toString(),
        '--font-weight-body': profile.bodyWeight.toString(),
        '--line-height-heading': profile.headingLineHeight.toString(),
        '--line-height-body': profile.bodyLineHeight.toString(),
        '--letter-spacing-heading': profile.headingLetterSpacing,
        '--letter-spacing-body': profile.bodyLetterSpacing,
    };

    // Add display font if present
    if (profile.displayFont) {
        cssVars['--font-display'] = `'${profile.displayFont}', serif`;
    }

    return cssVars;
}

/**
 * Generate CSS string from typography profile
 */
export function generateTypographyCSS(profile: TypographyProfile): string {
    const cssVars = applyTypographyProfile(profile);

    const cssLines = Object.entries(cssVars).map(
        ([key, value]) => `  ${key}: ${value};`
    );

    return `:root {\n${cssLines.join('\n')}\n}`;
}

/**
 * Get typography profile with custom overrides
 */
export function getTypographyProfile(
    baseProfile: TypographyProfile,
    customTypography?: Partial<TypographyProfile>
): TypographyProfile {
    if (!customTypography) return baseProfile;

    return {
        ...baseProfile,
        ...customTypography,
    };
}

/**
 * Validate typography profile
 */
export interface TypographyValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export function validateTypographyProfile(profile: TypographyProfile): TypographyValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check font weights
    if (profile.headingWeight < 100 || profile.headingWeight > 900) {
        errors.push('Heading font weight must be between 100 and 900');
    }
    if (profile.bodyWeight < 100 || profile.bodyWeight > 900) {
        errors.push('Body font weight must be between 100 and 900');
    }

    // Check line heights
    if (profile.headingLineHeight < 1 || profile.headingLineHeight > 2) {
        warnings.push('Heading line height should typically be between 1 and 2');
    }
    if (profile.bodyLineHeight < 1.2 || profile.bodyLineHeight > 2) {
        warnings.push('Body line height should typically be between 1.2 and 2');
    }

    // Check for readability
    if (profile.bodyWeight < 300) {
        warnings.push('Body font weight below 300 may be hard to read');
    }
    if (profile.bodyLineHeight < 1.5) {
        warnings.push('Body line height below 1.5 may reduce readability');
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Get recommended font pairings for a template category
 */
export function getRecommendedPairings(category: string): string[] {
    const pairingsByCategory: Record<string, string[]> = {
        minimal_modern: ['roboto-roboto', 'montserrat-open-sans', 'poppins-inter'],
        dark_elegant: ['playfair-inter', 'cormorant-lato', 'libre-baskerville-source-sans'],
        luxury_premium: ['playfair-inter-cinzel', 'cormorant-lato-cinzel', 'bodoni-moda-raleway'],
        warm_sophisticated: ['playfair-nunito', 'merriweather-open-sans', 'lora-karla'],
    };

    return pairingsByCategory[category] || [];
}

/**
 * Create typography profile from font pairing
 */
export function createProfileFromPairing(
    pairingKey: string,
    baseProfile: TypographyProfile
): TypographyProfile {
    const pairing = FONT_PAIRINGS[pairingKey];
    if (!pairing) return baseProfile;

    return {
        ...baseProfile,
        headingFont: pairing.heading,
        bodyFont: pairing.body,
        displayFont: pairing.display,
    };
}

/**
 * Font size scale utilities
 */
export const FONT_SIZE_SCALES = {
    compact: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
    },
    standard: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
    },
    generous: {
        xs: '0.875rem',
        sm: '1rem',
        base: '1.125rem',
        lg: '1.25rem',
        xl: '1.5rem',
        '2xl': '1.875rem',
        '3xl': '2.25rem',
        '4xl': '3rem',
        '5xl': '3.75rem',
        '6xl': '4.5rem',
    },
};

/**
 * Generate responsive font size CSS
 */
export function generateResponsiveFontSize(
    minSize: string,
    maxSize: string,
    minViewport: string = '320px',
    maxViewport: string = '1200px'
): string {
    return `clamp(${minSize}, calc(${minSize} + (${maxSize} - ${minSize}) * ((100vw - ${minViewport}) / (${maxViewport} - ${minViewport}))), ${maxSize})`;
}
