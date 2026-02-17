/**
 * CTA (Call to Action) Section Component
 * Encourages users to take action (book a service)
 */

"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import BlockLayout, { BlockContainer } from "../BlockLayout";

interface CTASectionProps {
    businessName: string;
    subdomain: string;
    variant?: 'modern' | 'classic' | 'elegant';
}

export default function CTASection({ businessName, subdomain, variant = 'modern' }: CTASectionProps) {
    if (variant === 'modern') {
        return (
            <BlockLayout variant={variant} blockType="cta">
                <BlockContainer variant={variant}>
                    <div
                        className="relative rounded-2xl p-12 md:p-16 text-center overflow-hidden"
                        style={{
                            background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)`
                        }}
                    >
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                Ready to Book Your Event?
                            </h2>
                            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                                Let {businessName} make your special day unforgettable. Browse our services and book today!
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center">
                                <a href="#services">
                                    <Button
                                        size="lg"
                                        className="bg-white hover:bg-gray-100 text-gray-900 font-semibold px-8 py-6 text-lg group"
                                    >
                                        <Calendar className="mr-2 w-5 h-5" />
                                        View Services
                                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </a>
                                <a href="#contact">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
                                    >
                                        Contact Us
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </div>
                </BlockContainer>
            </BlockLayout>
        );
    }

    if (variant === 'classic') {
        return (
            <BlockLayout variant={variant} blockType="cta">
                <BlockContainer variant={variant} maxWidth="lg">
                    <div
                        className="border-4 rounded-lg p-12 md:p-16 text-center"
                        style={{ borderColor: 'var(--color-primary)' }}
                    >
                        <h2
                            className="text-4xl md:text-5xl font-serif font-semibold mb-6"
                            style={{ color: 'var(--color-primary)' }}
                        >
                            Begin Your Journey With Us
                        </h2>
                        <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
                            Experience the excellence of {businessName}. Our dedicated team is ready to bring your vision to life.
                        </p>
                        <a href="#services">
                            <Button
                                size="lg"
                                className="px-10 py-6 text-lg"
                                style={{ backgroundColor: 'var(--color-primary)' }}
                            >
                                Explore Our Services
                            </Button>
                        </a>
                    </div>
                </BlockContainer>
            </BlockLayout>
        );
    }

    // Elegant variant
    return (
        <BlockLayout variant={variant} blockType="cta">
            <BlockContainer variant={variant}>
                <div className="max-w-3xl">
                    <h2
                        className="text-5xl md:text-6xl font-light mb-6"
                        style={{ color: 'var(--color-primary)' }}
                    >
                        Let&apos;s Create Something Beautiful
                    </h2>
                    <p className="text-xl text-gray-600 font-light mb-8 leading-relaxed">
                        {businessName} is here to transform your event into an extraordinary experience.
                    </p>
                    <a href="#services">
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-2 px-8 py-6 font-light hover:bg-gray-50"
                            style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                        >
                            Discover Services
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </a>
                </div>
            </BlockContainer>
        </BlockLayout>
    );
}
