/**
 * Block Layout Component
 * Smart layout engine that adapts to visible blocks
 */

"use client";

import React from 'react';
import type { BlockType } from '@/lib/storefront-blocks';

interface BlockLayoutProps {
    children: React.ReactNode;
    variant?: 'modern' | 'classic' | 'elegant';
    blockType?: BlockType;
    className?: string;
}

/**
 * Get background color based on block type and variant
 */
function getBlockBackground(blockType?: BlockType, variant?: string): string {
    if (!blockType) return 'bg-white';

    // Alternate backgrounds for visual rhythm
    const lightBlocks: BlockType[] = ['hero', 'services', 'gallery', 'contact'];
    const darkBlocks: BlockType[] = ['about', 'features', 'stats', 'testimonials', 'cta'];

    if (variant === 'classic') {
        // Classic uses more whitespace, less alternation
        return lightBlocks.includes(blockType) ? 'bg-white' : 'bg-gray-50';
    }

    if (variant === 'elegant') {
        // Elegant uses subtle grays
        return lightBlocks.includes(blockType) ? 'bg-white' : 'bg-gray-50';
    }

    // Modern uses more contrast
    return lightBlocks.includes(blockType) ? 'bg-white' : 'bg-gray-50';
}

/**
 * Get padding based on variant
 */
function getBlockPadding(variant?: 'modern' | 'classic' | 'elegant'): string {
    switch (variant) {
        case 'modern':
            return 'py-16 md:py-20';
        case 'classic':
            return 'py-20 md:py-28'; // Extra generous
        case 'elegant':
            return 'py-12 md:py-16'; // Compact
        default:
            return 'py-16 md:py-20';
    }
}

/**
 * Get border radius based on variant
 */
function getBorderRadius(variant?: 'modern' | 'classic' | 'elegant'): string {
    switch (variant) {
        case 'modern':
            return 'rounded-xl'; // 12px
        case 'classic':
            return 'rounded'; // 4px
        case 'elegant':
            return 'rounded-lg'; // 8px
        default:
            return 'rounded-xl';
    }
}

export default function BlockLayout({
    children,
    variant = 'modern',
    blockType,
    className = ''
}: BlockLayoutProps) {
    const background = getBlockBackground(blockType, variant);
    const padding = getBlockPadding(variant);

    return (
        <section
            id={blockType}
            className={`${background} ${padding} ${className}`}
            data-block={blockType}
        >
            {children}
        </section>
    );
}

/**
 * Block Container - Inner container with max-width
 */
interface BlockContainerProps {
    children: React.ReactNode;
    variant?: 'modern' | 'classic' | 'elegant';
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    className?: string;
}

export function BlockContainer({
    children,
    variant = 'modern',
    maxWidth = 'xl',
    className = ''
}: BlockContainerProps) {
    const maxWidthClass = {
        'sm': 'max-w-3xl',
        'md': 'max-w-4xl',
        'lg': 'max-w-5xl',
        'xl': variant === 'classic' ? 'max-w-6xl' : 'max-w-7xl',
        'full': 'max-w-full'
    }[maxWidth];

    return (
        <div className={`container mx-auto px-4 md:px-6 ${maxWidthClass} ${className}`}>
            {children}
        </div>
    );
}

/**
 * Block Grid - Responsive grid for block content
 */
interface BlockGridProps {
    children: React.ReactNode;
    columns?: 1 | 2 | 3 | 4;
    gap?: 'sm' | 'md' | 'lg';
    variant?: 'modern' | 'classic' | 'elegant';
    className?: string;
}

export function BlockGrid({
    children,
    columns = 3,
    gap = 'md',
    variant = 'modern',
    className = ''
}: BlockGridProps) {
    const gapClass = {
        'sm': 'gap-4',
        'md': variant === 'classic' ? 'gap-8' : 'gap-6',
        'lg': variant === 'classic' ? 'gap-12' : 'gap-8'
    }[gap];

    const columnsClass = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    }[columns];

    return (
        <div className={`grid ${columnsClass} ${gapClass} ${className}`}>
            {children}
        </div>
    );
}

/**
 * Block Card - Styled card component
 */
interface BlockCardProps {
    children: React.ReactNode;
    variant?: 'modern' | 'classic' | 'elegant';
    hover?: boolean;
    className?: string;
}

export function BlockCard({
    children,
    variant = 'modern',
    hover = true,
    className = ''
}: BlockCardProps) {
    const borderRadius = getBorderRadius(variant);

    const shadowClass = {
        'modern': 'shadow-md',
        'classic': 'shadow-sm',
        'elegant': 'shadow-sm'
    }[variant];

    const hoverClass = hover ? {
        'modern': 'hover:shadow-xl hover:scale-105 transition-all duration-300',
        'classic': 'hover:shadow-md transition-shadow duration-200',
        'elegant': 'hover:shadow-md transition-shadow duration-150'
    }[variant] : '';

    const borderClass = variant === 'classic' ? 'border-2 border-gray-200' : 'border border-gray-100';

    return (
        <div className={`bg-white ${borderRadius} ${shadowClass} ${hoverClass} ${borderClass} overflow-hidden ${className}`}>
            {children}
        </div>
    );
}

/**
 * Block Heading - Styled heading component
 */
interface BlockHeadingProps {
    children: React.ReactNode;
    level?: 1 | 2 | 3 | 4;
    variant?: 'modern' | 'classic' | 'elegant';
    align?: 'left' | 'center' | 'right';
    className?: string;
}

export function BlockHeading({
    children,
    level = 2,
    variant = 'modern',
    align = 'center',
    className = ''
}: BlockHeadingProps) {
    const Tag = `h${level}` as React.ElementType;

    const sizeClass = {
        1: 'text-4xl md:text-5xl lg:text-6xl',
        2: 'text-3xl md:text-4xl lg:text-5xl',
        3: 'text-2xl md:text-3xl',
        4: 'text-xl md:text-2xl'
    }[level];

    const alignClass = `text-${align}`;

    const weightClass = {
        'modern': 'font-bold',
        'classic': variant === 'classic' && level <= 2 ? 'font-serif font-semibold' : 'font-semibold',
        'elegant': 'font-light'
    }[variant];

    const marginClass = level <= 2 ? 'mb-12' : 'mb-6';

    return (
        <Tag
            className={`${sizeClass} ${alignClass} ${weightClass} ${marginClass} ${className}`}
            style={{ color: 'var(--color-primary)' }}
        >
            {children}
        </Tag>
    );
}
