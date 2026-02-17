"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeColors {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    muted: string;
    border?: string;
}

const ThemeContext = createContext<ThemeColors>({
    primary: '#000000',
    secondary: '#333333',
    accent: '#666666',
    background: '#ffffff',
    text: '#000000',
    muted: '#666666',
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
    colors: ThemeColors;
    children: React.ReactNode;
}

export function ThemeProvider({ colors, children }: ThemeProviderProps) {
    // Ensure we have all necessary colors with fallbacks (Elegant Gold defaults)
    const themeColors = {
        primary: colors.primary || '#D4AF37',      // Gold Primary
        secondary: colors.secondary || '#B8941F',   // Gold Dark
        accent: colors.accent || '#D4AF37',         // Gold Accent
        background: colors.background || '#F8F8F8', // Light Gray
        text: colors.text || '#2C2C2C',             // Charcoal
        muted: colors.muted || '#6b7280',           // Gray
        border: colors.border || colors.muted || '#e5e7eb',
    };

    // Helper to convert hex to rgba
    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    return (
        <ThemeContext.Provider value={themeColors}>
            <style jsx global>{`
                :root {
                    /* Legacy variables for backward compatibility */
                    --color-primary: ${themeColors.primary};
                    --color-secondary: ${themeColors.secondary};
                    --color-accent: ${themeColors.accent};
                    --color-background: ${themeColors.background};
                    --color-text: ${themeColors.text};
                    --color-muted: ${themeColors.muted};
                    --color-border: ${themeColors.border};
                    
                    /* Template-specific variables (VariantClaudeSonnet4) */
                    /* Elegant Gold Palette (from index.html reference) */
                    --color-gold-primary: ${themeColors.primary};
                    --color-gold-dark: ${themeColors.secondary};
                    --color-charcoal-primary: ${themeColors.text};
                    --color-charcoal-dark: #1a1a1a;
                    --color-bg-light: ${themeColors.background};
                    --color-bg-white: #ffffff;
                    --color-bg-card: #ffffff;
                    --color-text-primary: ${themeColors.text};
                    --color-text-secondary: ${themeColors.muted};
                    --color-text-muted: #9ca3af;
                    --color-text-light: #ffffff;
                    --color-border-light: ${themeColors.border};
                    --color-border-gold: ${themeColors.accent};
                    
                    /* Gradients using updated variables */
                    --gradient-gold: linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%);
                    --gradient-charcoal: linear-gradient(135deg, ${themeColors.text} 0%, #1a1a1a 100%);
                    
                    /* Opacity Variants */
                    --color-gold-20: ${hexToRgba(themeColors.primary, 0.2)};
                    --color-gold-10: ${hexToRgba(themeColors.primary, 0.1)};
                    --color-gold-05: ${hexToRgba(themeColors.primary, 0.05)};
                    --color-white-95: rgba(255, 255, 255, 0.95);
                    --color-white-10: rgba(255, 255, 255, 0.1);
                    --color-black-20: rgba(0, 0, 0, 0.2);
                    --color-black-10: rgba(0, 0, 0, 0.1);
                    --color-black-25: rgba(0, 0, 0, 0.25);
                    /* Standard Shadcn Variables Override */
                    --primary: ${themeColors.primary};
                    --primary-foreground: #ffffff;
                    --ring: ${themeColors.primary};
                    --radius: 0.5rem;

            `}</style>
            {children}
        </ThemeContext.Provider>
    );
}

// Export preset types - All available palettes
export type ColorPresetName =
    | 'elegant-gold'
    | 'modern-blue'
    | 'forest-green'
    | 'sunset-coral'
    | 'rose-pink'
    | 'royal-purple'
    | 'enhanced-neutrals';

