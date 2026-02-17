/**
 * Services Section Component
 * Displays list of services offered
 */

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { LegacyService } from "@/lib/database.types";
import { Star, Users, ArrowRight } from "lucide-react";

interface ServicesSectionProps {
    services: LegacyService[];
    subdomain: string;
    variant?: 'modern' | 'classic' | 'elegant';
}

function formatPrice(service: LegacyService) {
    // Check both new and legacy fields for robustness
    const isPerPerson = service.pricing_model === 'per_person' || service.pricingType === 'per_person';

    if (isPerPerson) {
        return (
            <span>
                ${service.basePrice}
                <span className="text-sm font-normal opacity-80">/person</span>
            </span>
        );
    }

    // Fixed and Packages models both use "Starting from"
    return `Starting from $${service.basePrice}`;
}

export default function ServicesSection({ services, subdomain, variant = 'modern' }: ServicesSectionProps) {
    if (!services || services.length === 0) {
        return (
            <section id="services" className="py-20 bg-gray-50">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>Our Services</h2>
                    <p className="text-gray-600">Services coming soon!</p>
                </div>
            </section>
        );
    }

    if (variant === 'modern') {
        return (
            <section id="services" className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: 'var(--color-primary)' }}>
                        Our Services
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service) => (
                            <Card key={service.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                                {service.images && service.images[0] && (
                                    <div className="h-48 overflow-hidden">
                                        <img
                                            src={service.images[0]}
                                            alt={service.title}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                )}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                                    <p className="text-gray-600 mb-4 line-clamp-3">{service.description}</p>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                                            {formatPrice(service)}
                                        </span>
                                        {service.rating && (
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                <span className="font-medium">{service.rating}</span>
                                            </div>
                                        )}
                                    </div>
                                    <Link href={`/storefront/${subdomain}/services/${service.id}`}>
                                        <Button className="w-full" style={{ backgroundColor: 'var(--color-primary)' }}>
                                            View Details
                                            <ArrowRight className="ml-2 w-4 h-4" />
                                        </Button>
                                    </Link>
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
            <section id="services" className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-serif font-bold mb-12 text-center" style={{ color: 'var(--color-primary)' }}>
                        Our Services
                    </h2>
                    <div className="max-w-4xl mx-auto space-y-6">
                        {services.map((service) => (
                            <div key={service.id} className="border-2 rounded-lg p-6 hover:shadow-lg transition-shadow" style={{ borderColor: 'var(--color-primary)' }}>
                                <div className="flex flex-col md:flex-row gap-6">
                                    {service.images && service.images[0] && (
                                        <img
                                            src={service.images[0]}
                                            alt={service.title}
                                            className="w-full md:w-48 h-48 object-cover rounded"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-serif font-bold mb-2">{service.title}</h3>
                                        <p className="text-gray-600 mb-4">{service.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
                                                {formatPrice(service)}
                                            </span>
                                            <Link href={`/storefront/${subdomain}/services/${service.id}`}>
                                                <Button variant="outline" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
                                                    Learn More
                                                </Button>
                                            </Link>
                                        </div>
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
        <section id="services" className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-5xl font-light mb-16" style={{ color: 'var(--color-primary)' }}>
                    What We Offer
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {services.map((service, index) => (
                        <div key={service.id} className={`${index % 2 === 1 ? 'md:mt-12' : ''}`}>
                            {service.images && service.images[0] && (
                                <div className="h-64 mb-6 overflow-hidden rounded-lg">
                                    <img
                                        src={service.images[0]}
                                        alt={service.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <h3 className="text-2xl font-light mb-3">{service.title}</h3>
                            <p className="text-gray-600 mb-4 font-light">{service.description}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-light" style={{ color: 'var(--color-primary)' }}>
                                    {formatPrice(service)}
                                </span>
                                <Link href={`/storefront/${subdomain}/services/${service.id}`}>
                                    <Button variant="ghost" className="font-light" style={{ color: 'var(--color-primary)' }}>
                                        Explore →
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
