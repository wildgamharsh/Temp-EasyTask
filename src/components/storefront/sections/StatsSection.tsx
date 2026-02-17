/**
 * Stats Section Component
 * Displays key metrics and statistics
 */

"use client";

import { TrendingUp, Users, Star, Calendar } from "lucide-react";
import BlockLayout, { BlockContainer } from "../BlockLayout";

interface StatsSectionProps {
    stats: {
        servicesCount: number;
        totalReviews: number;
        avgRating: number;
        staffCount?: number;
    };
    variant?: 'modern' | 'classic' | 'elegant';
}

export default function StatsSection({ stats, variant = 'modern' }: StatsSectionProps) {
    const statItems = [
        {
            icon: Calendar,
            value: stats.servicesCount,
            label: 'Active Services',
            show: stats.servicesCount > 0
        },
        {
            icon: Star,
            value: stats.avgRating ? stats.avgRating.toFixed(1) : 'New',
            label: 'Average Rating',
            show: true
        },
        {
            icon: Users,
            value: stats.totalReviews || 0,
            label: 'Happy Clients',
            show: true
        },
        {
            icon: TrendingUp,
            value: stats.staffCount || '—',
            label: 'Team Members',
            show: !!stats.staffCount
        }
    ].filter(item => item.show);

    if (statItems.length === 0) return null;

    if (variant === 'modern') {
        return (
            <BlockLayout variant={variant} blockType="stats">
                <BlockContainer variant={variant}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {statItems.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={index}
                                    className="text-center p-6 rounded-xl bg-white shadow-md hover:shadow-xl transition-shadow"
                                >
                                    <div
                                        className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                                        style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)' }}
                                    >
                                        <Icon className="w-7 h-7" style={{ color: 'var(--color-primary)' }} />
                                    </div>
                                    <div
                                        className="text-4xl font-bold mb-2"
                                        style={{ color: 'var(--color-primary)' }}
                                    >
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-gray-600 font-medium">
                                        {stat.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </BlockContainer>
            </BlockLayout>
        );
    }

    if (variant === 'classic') {
        return (
            <BlockLayout variant={variant} blockType="stats">
                <BlockContainer variant={variant} maxWidth="lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                        {statItems.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div key={index} className="text-center">
                                    <Icon
                                        className="w-8 h-8 mx-auto mb-4"
                                        style={{ color: 'var(--color-primary)' }}
                                    />
                                    <div
                                        className="text-5xl font-serif font-semibold mb-2"
                                        style={{ color: 'var(--color-primary)' }}
                                    >
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-gray-600 uppercase tracking-wider">
                                        {stat.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </BlockContainer>
            </BlockLayout>
        );
    }

    // Elegant variant
    return (
        <BlockLayout variant={variant} blockType="stats">
            <BlockContainer variant={variant}>
                <div className="flex flex-wrap justify-around gap-12">
                    {statItems.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="text-center">
                                <Icon
                                    className="w-6 h-6 mx-auto mb-3"
                                    style={{ color: 'var(--color-primary)' }}
                                />
                                <div
                                    className="text-4xl font-light mb-1"
                                    style={{ color: 'var(--color-primary)' }}
                                >
                                    {stat.value}
                                </div>
                                <div className="text-xs text-gray-500 font-light uppercase tracking-wide">
                                    {stat.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </BlockContainer>
        </BlockLayout>
    );
}
