"use client";

import { useEffect } from 'react';

const FONTS = {
    'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
    'Playfair Display': 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap',
    'Roboto': 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
    'Lato': 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap',
    'Montserrat': 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap',
    'Merriweather': 'https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&display=swap',
};

/**
 * Template-based font loader
 * Automatically loads the correct fonts for each template variant
 */
export function TemplateFontsLoader({ variant }: { variant?: 'modern' | 'classic' | 'elegant' }) {
    useEffect(() => {
        const fontsToLoad: string[] = [];

        switch (variant) {
            case 'modern':
                fontsToLoad.push('Inter');
                break;
            case 'classic':
                fontsToLoad.push('Playfair Display', 'Inter');
                break;
            case 'elegant':
                fontsToLoad.push('Roboto');
                break;
            default:
                fontsToLoad.push('Inter');
        }

        fontsToLoad.forEach(fontName => {
            const fontUrl = FONTS[fontName as keyof typeof FONTS];
            if (fontUrl) {
                const linkId = `font-${fontName.replace(/\s+/g, '-').toLowerCase()}`;

                if (!document.getElementById(linkId)) {
                    const link = document.createElement('link');
                    link.id = linkId;
                    link.href = fontUrl;
                    link.rel = 'stylesheet';
                    document.head.appendChild(link);
                }
            }
        });
    }, [variant]);

    return null;
}

/**
 * Legacy font loader for backwards compatibility
 */
export default function GoogleFontsLoader({ fontFamily }: { fontFamily?: string }) {
    useEffect(() => {
        if (!fontFamily) return;

        // Extract font name from font-family string (e.g., '"Inter", sans-serif' -> 'Inter')
        const match = fontFamily.match(/"([^"]+)"/);
        const fontName = match ? match[1] : fontFamily.split(',')[0].trim();

        const fontUrl = FONTS[fontName as keyof typeof FONTS];

        if (fontUrl) {
            const linkId = `font-${fontName.replace(/\s+/g, '-').toLowerCase()}`;

            if (!document.getElementById(linkId)) {
                const link = document.createElement('link');
                link.id = linkId;
                link.href = fontUrl;
                link.rel = 'stylesheet';
                document.head.appendChild(link);
            }
        }
    }, [fontFamily]);

    return null;
}
