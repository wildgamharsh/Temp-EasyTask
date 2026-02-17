/**
 * Hero Section Component
 * Displays hero banner with title, subtitle, and CTA
 */

"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { StorefrontSettings } from "@/lib/database.types";

interface HeroSectionProps {
    settings: StorefrontSettings;
    businessName: string;
    variant?: 'modern' | 'classic' | 'elegant';
}

export default function HeroSection({ settings, businessName, variant = 'modern' }: HeroSectionProps) {
    const title = settings.hero_title || `Welcome to ${businessName}`;
    const subtitle = settings.hero_subtitle || settings.tagline || "Creating memorable experiences";
    const ctaText = settings.hero_cta_text || "View Services";
    const ctaLink = settings.hero_cta_link || "#services";

    if (variant === 'modern') {
        return (
            <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Animated Gradient Background */}
                <div
                    className="absolute inset-0 animate-gradient"
                    style={{
                        backgroundImage: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 50%, var(--color-primary) 100%)`
                    }}
                />

                {/* Decorative Floating Shapes */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                {/* Content Container */}
                <div className="relative z-10 container mx-auto px-4 py-20">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Left: Text Content */}
                        <div className="text-white space-y-6">
                            <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-fade-in-up">
                                <span className="block">{title}</span>
                            </h1>
                            <p className="text-xl md:text-2xl opacity-90 leading-relaxed animate-fade-in-up stagger-1">
                                {subtitle}
                            </p>
                            <div className="flex flex-wrap gap-4 animate-fade-in-up stagger-2">
                                <a href={ctaLink}>
                                    <Button
                                        size="lg"
                                        className="bg-white hover:bg-gray-100 text-gray-900 font-semibold px-8 py-6 text-lg hover-lift group"
                                    >
                                        {ctaText}
                                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </a>
                                <a href="#about">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
                                    >
                                        Learn More
                                    </Button>
                                </a>
                            </div>
                        </div>

                        {/* Right: Visual Element */}
                        <div className="relative animate-fade-in-right">
                            <div className="relative aspect-square max-w-md mx-auto">
                                {/* Decorative Image Container */}
                                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-3xl rotate-6 animate-pulse" />
                                <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 hover-scale">
                                    <img
                                        src="/images/dec_1.png"
                                        alt="Hero"
                                        className="w-full h-full object-cover rounded-2xl shadow-2xl"
                                    />
                                </div>
                                {/* Floating Badge */}
                                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-2xl animate-bounce-in">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent)' }}>
                                            <span className="text-white font-bold text-xl">✓</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Trusted by 500+</p>
                                            <p className="text-sm text-gray-600">Happy Clients</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <a href="#about" className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors">
                        <span className="text-sm font-medium">Scroll Down</span>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </a>
                </div>

                {/* Bottom Fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
            </section>
        );
    }

    if (variant === 'classic') {
        return (
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center border-4 border-current p-12 rounded-lg" style={{ borderColor: 'var(--color-primary)' }}>
                        <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6" style={{ color: 'var(--color-primary)' }}>
                            {title}
                        </h1>
                        <p className="text-lg md:text-xl mb-8 text-gray-700">
                            {subtitle}
                        </p>
                        <a href={ctaLink}>
                            <Button
                                size="lg"
                                style={{ backgroundColor: 'var(--color-primary)' }}
                                className="text-white hover:opacity-90 px-8 py-6"
                            >
                                {ctaText}
                            </Button>
                        </a>
                    </div>
                </div>
            </section>
        );
    }

    // Elegant variant
    return (
        <section className="min-h-[500px] flex items-center bg-gradient-to-br from-white via-gray-50 to-white">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl">
                    <h1 className="text-6xl md:text-7xl font-light mb-6 leading-tight" style={{ color: 'var(--color-primary)' }}>
                        {title}
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 text-gray-600 font-light">
                        {subtitle}
                    </p>
                    <a href={ctaLink}>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-2 px-8 py-6 hover:bg-gray-50"
                            style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                        >
                            {ctaText}
                        </Button>
                    </a>
                </div>
            </div>
        </section>
    );
}
