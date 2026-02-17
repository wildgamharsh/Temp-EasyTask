/**
 * Block Registry System
 * Manages dynamic block rendering based on available data
 */

import type { StorefrontSettings, OrganizerProfile, LegacyService } from './database.types';

export type BlockType =
    | 'hero'
    | 'about'
    | 'services'
    | 'features'
    | 'stats'
    | 'testimonials'
    | 'gallery'
    | 'cta'
    | 'contact';

export interface BlockConfig {
    id: BlockType;
    label: string;
    priority: number; // Lower number = higher priority (for ordering)
    requiresData: boolean;
    checkDataAvailability: (data: BlockDataContext) => boolean;
}

export interface BlockDataContext {
    organizer: OrganizerProfile;
    services: LegacyService[];
    settings: StorefrontSettings;
}

export interface VisibleBlock {
    id: BlockType;
    label: string;
    priority: number;
    hasData: boolean;
}

/**
 * Block Registry - Defines all available blocks and their data requirements
 */
export const BLOCK_REGISTRY: Record<BlockType, BlockConfig> = {
    hero: {
        id: 'hero',
        label: 'Hero',
        priority: 1,
        requiresData: false, // Hero always shows if enabled
        checkDataAvailability: (data) => {
            return data.settings.show_hero !== false;
        }
    },
    about: {
        id: 'about',
        label: 'About',
        priority: 2,
        requiresData: true,
        checkDataAvailability: (data) => {
            if (data.settings.show_about === false) return false;
            return !!(
                data.organizer.description ||
                data.settings.about_text ||
                data.settings.welcome_message
            );
        }
    },
    services: {
        id: 'services',
        label: 'Services',
        priority: 3,
        requiresData: true,
        checkDataAvailability: (data) => {
            if (data.settings.show_services === false) return false;
            return data.services && data.services.length > 0;
        }
    },
    features: {
        id: 'features',
        label: 'Features',
        priority: 4,
        requiresData: true,
        checkDataAvailability: (data) => {
            return !!(
                data.organizer.features &&
                Array.isArray(data.organizer.features) &&
                data.organizer.features.length > 0
            );
        }
    },
    stats: {
        id: 'stats',
        label: 'Stats',
        priority: 5,
        requiresData: true,
        checkDataAvailability: (data) => {
            // Show stats if we have any meaningful metrics
            return !!(
                data.organizer.total_reviews ||
                data.organizer.staff_count ||
                data.services.length > 0
            );
        }
    },
    testimonials: {
        id: 'testimonials',
        label: 'Testimonials',
        priority: 6,
        requiresData: true,
        checkDataAvailability: (data) => {
            if (data.settings.show_testimonials === false) return false;
            return !!(
                data.settings.testimonials &&
                Array.isArray(data.settings.testimonials) &&
                data.settings.testimonials.length > 0
            );
        }
    },
    gallery: {
        id: 'gallery',
        label: 'Gallery',
        priority: 7,
        requiresData: true,
        checkDataAvailability: (data) => {
            if (data.settings.show_gallery === false) return false;
            return !!(
                data.settings.gallery_images &&
                Array.isArray(data.settings.gallery_images) &&
                data.settings.gallery_images.length > 0
            );
        }
    },
    cta: {
        id: 'cta',
        label: 'Call to Action',
        priority: 8,
        requiresData: false,
        checkDataAvailability: (data) => {
            // Show CTA if we have services to book
            return data.services && data.services.length > 0;
        }
    },
    contact: {
        id: 'contact',
        label: 'Contact',
        priority: 9,
        requiresData: false, // Contact always shows if enabled
        checkDataAvailability: (data) => {
            return data.settings.show_contact !== false;
        }
    }
};

/**
 * Get list of visible blocks based on available data
 */
export function getVisibleBlocks(context: BlockDataContext): VisibleBlock[] {
    const blocks: VisibleBlock[] = [];

    for (const blockType of Object.keys(BLOCK_REGISTRY) as BlockType[]) {
        const config = BLOCK_REGISTRY[blockType];
        const hasData = config.checkDataAvailability(context);

        if (hasData) {
            blocks.push({
                id: config.id,
                label: config.label,
                priority: config.priority,
                hasData: true
            });
        }
    }

    // Sort by priority (lower number = higher priority)
    return blocks.sort((a, b) => a.priority - b.priority);
}

/**
 * Check if a specific block should be visible
 */
export function shouldShowBlock(blockType: BlockType, context: BlockDataContext): boolean {
    const config = BLOCK_REGISTRY[blockType];
    if (!config) return false;
    return config.checkDataAvailability(context);
}

/**
 * Get navigation sections based on visible blocks
 */
export function getNavigationSections(context: BlockDataContext): Array<{ id: string; label: string }> {
    const visibleBlocks = getVisibleBlocks(context);

    // Only include blocks that make sense in navigation
    const navBlocks: BlockType[] = ['hero', 'about', 'services', 'testimonials', 'gallery', 'contact'];

    return visibleBlocks
        .filter(block => navBlocks.includes(block.id))
        .map(block => ({
            id: block.id,
            label: block.label
        }));
}

/**
 * Get block spacing class based on template variant
 */
export function getBlockSpacing(variant: 'modern' | 'classic' | 'elegant'): string {
    switch (variant) {
        case 'modern':
            return 'py-16 md:py-20'; // Standard spacing
        case 'classic':
            return 'py-20 md:py-28'; // Extra generous spacing
        case 'elegant':
            return 'py-12 md:py-16'; // Compact spacing
        default:
            return 'py-16 md:py-20';
    }
}

/**
 * Get container class based on template variant
 */
export function getContainerClass(variant: 'modern' | 'classic' | 'elegant'): string {
    const base = 'container mx-auto px-4';

    switch (variant) {
        case 'modern':
            return `${base} max-w-7xl`;
        case 'classic':
            return `${base} max-w-6xl`; // Narrower for elegance
        case 'elegant':
            return `${base} max-w-7xl`;
        default:
            return `${base} max-w-7xl`;
    }
}
