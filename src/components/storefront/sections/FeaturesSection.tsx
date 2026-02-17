/**
 * Features Section Component
 * Displays organizer features in an icon grid layout
 */

"use client";

import { Check, Star, Award, Shield, Clock, Users } from "lucide-react";
import BlockLayout, { BlockContainer, BlockGrid, BlockHeading } from "../BlockLayout";

interface FeaturesSectionProps {
    features: string[];
    variant?: 'modern' | 'classic' | 'elegant';
}

// Icon mapping for common feature keywords
const FEATURE_ICONS: Record<string, typeof Check> = {
    'quality': Award,
    'verified': Shield,
    'experience': Star,
    'professional': Award,
    'certified': Shield,
    'fast': Clock,
    'team': Users,
    'expert': Star,
    'trusted': Shield,
    'reliable': Check,
};

function getFeatureIcon(feature: string): typeof Check {
    const lowerFeature = feature.toLowerCase();
    for (const [keyword, Icon] of Object.entries(FEATURE_ICONS)) {
        if (lowerFeature.includes(keyword)) {
            return Icon;
        }
    }
    return Check; // Default icon
}

export default function FeaturesSection({ features, variant = 'modern' }: FeaturesSectionProps) {
    if (!features || features.length === 0) return null;

    if (variant === 'modern') {
        return (
            <BlockLayout variant={variant} blockType="features">
                <BlockContainer variant={variant}>
                    <BlockHeading level={2} variant={variant}>
                        What Makes Us Special
                    </BlockHeading>

                    <BlockGrid columns={3} gap="md" variant={variant}>
                        {features.map((feature, index) => {
                            const Icon = getFeatureIcon(feature);
                            return (
                                <div
                                    key={index}
                                    className="group p-6 rounded-xl bg-white border border-gray-100 hover:shadow-lg hover:scale-105 transition-all duration-300"
                                >
                                    <div
                                        className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center group-hover:scale-110 transition-transform"
                                        style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)' }}
                                    >
                                        <Icon className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{feature}</h3>
                                </div>
                            );
                        })}
                    </BlockGrid>
                </BlockContainer>
            </BlockLayout>
        );
    }

    if (variant === 'classic') {
        return (
            <BlockLayout variant={variant} blockType="features">
                <BlockContainer variant={variant} maxWidth="lg">
                    <BlockHeading level={2} variant={variant}>
                        Our Distinctive Features
                    </BlockHeading>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {features.map((feature, index) => {
                            const Icon = getFeatureIcon(feature);
                            return (
                                <div
                                    key={index}
                                    className="flex items-start gap-4 p-6 border-2 rounded hover:shadow-md transition-shadow"
                                    style={{ borderColor: 'var(--color-primary)' }}
                                >
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: 'var(--color-primary)' }}
                                    >
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-serif text-lg font-semibold">{feature}</h3>
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
        <BlockLayout variant={variant} blockType="features">
            <BlockContainer variant={variant}>
                <BlockHeading level={2} variant={variant} align="left">
                    Features
                </BlockHeading>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const Icon = getFeatureIcon(feature);
                        return (
                            <div key={index} className="flex items-start gap-3">
                                <Icon
                                    className="w-5 h-5 mt-1 flex-shrink-0"
                                    style={{ color: 'var(--color-primary)' }}
                                />
                                <p className="font-light text-gray-700">{feature}</p>
                            </div>
                        );
                    })}
                </div>
            </BlockContainer>
        </BlockLayout>
    );
}
