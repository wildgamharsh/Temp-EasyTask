/**
 * About Section Component
 * Displays business description and features
 */

"use client";

import type { OrganizerProfile } from "@/lib/database.types";
import { Check } from "lucide-react";

interface AboutSectionProps {
    organizer: OrganizerProfile;
    variant?: 'modern' | 'classic' | 'elegant';
}

export default function AboutSection({ organizer, variant = 'modern' }: AboutSectionProps) {
    if (!organizer.description) return null;

    const features = organizer.features || [];

    if (variant === 'modern') {
        return (
            <section id="about" className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold mb-8 text-center" style={{ color: 'var(--color-primary)' }}>
                            About Us
                        </h2>
                        <div className="prose prose-lg max-w-none mb-8">
                            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                {organizer.description}
                            </p>
                        </div>

                        {features.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                {features.map((feature, index) => (
                                    <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent)' }}>
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-gray-700">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        );
    }

    if (variant === 'classic') {
        return (
            <section id="about" className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-serif font-bold mb-8" style={{ color: 'var(--color-primary)' }}>
                            About {organizer.business_name}
                        </h2>
                        <div className="bg-white p-8 rounded-lg shadow-sm border-2" style={{ borderColor: 'var(--color-primary)' }}>
                            <p className="text-gray-700 whitespace-pre-line leading-relaxed text-lg">
                                {organizer.description}
                            </p>
                        </div>

                        {features.length > 0 && (
                            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                                {features.map((feature, index) => (
                                    <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                                        <Check className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-accent)' }} />
                                        <p className="font-medium text-gray-800">{feature}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        );
    }

    // Elegant variant
    return (
        <section id="about" className="py-24 bg-gradient-to-b from-white to-gray-50">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-5xl font-light mb-12" style={{ color: 'var(--color-primary)' }}>
                        Our Story
                    </h2>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <p className="text-gray-700 whitespace-pre-line leading-relaxed text-lg font-light">
                                {organizer.description}
                            </p>
                        </div>
                        {features.length > 0 && (
                            <div className="space-y-4">
                                {features.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
                                        <span className="text-gray-700 font-light">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
