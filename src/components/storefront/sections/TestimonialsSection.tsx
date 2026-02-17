/**
 * Testimonials Section Component
 */

"use client";

import { Card } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

interface Testimonial {
    name: string;
    role?: string;
    content: string;
    rating?: number;
    image?: string;
}

interface TestimonialsSectionProps {
    testimonials: Testimonial[];
    variant?: 'modern' | 'classic' | 'elegant';
}

export default function TestimonialsSection({ testimonials, variant = 'modern' }: TestimonialsSectionProps) {
    if (!testimonials || testimonials.length === 0) return null;

    if (variant === 'modern') {
        return (
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: 'var(--color-primary)' }}>
                        What Our Clients Say
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                                <div className="flex mb-3">
                                    {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-4 italic">&quot;{testimonial.content}&quot;</p>
                                <div className="flex items-center gap-3">
                                    {testimonial.image && (
                                        <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                                    )}
                                    <div>
                                        <p className="font-semibold">{testimonial.name}</p>
                                        {testimonial.role && <p className="text-sm text-gray-500">{testimonial.role}</p>}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (variant === 'classic') {
        return (
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-serif font-bold mb-12 text-center" style={{ color: 'var(--color-primary)' }}>
                        Testimonials
                    </h2>
                    <div className="max-w-4xl mx-auto space-y-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-white p-8 rounded-lg shadow-sm border-l-4" style={{ borderColor: 'var(--color-accent)' }}>
                                <Quote className="w-8 h-8 mb-4" style={{ color: 'var(--color-primary)' }} />
                                <p className="text-lg text-gray-700 mb-4 font-serif italic">{testimonial.content}</p>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold">{testimonial.name}</p>
                                        {testimonial.role && <p className="text-sm text-gray-500">{testimonial.role}</p>}
                                    </div>
                                    <div className="flex">
                                        {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // Elegant variant
    return (
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4">
                <h2 className="text-5xl font-light mb-16" style={{ color: 'var(--color-primary)' }}>
                    Client Stories
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="space-y-4">
                            <div className="flex">
                                {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-gray-700 font-light text-lg leading-relaxed">{testimonial.content}</p>
                            <p className="font-light">
                                <span className="font-medium">{testimonial.name}</span>
                                {testimonial.role && <span className="text-gray-500"> • {testimonial.role}</span>}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
