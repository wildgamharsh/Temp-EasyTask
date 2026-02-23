
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    MapPin, Star, Check, Share2, Heart,
    Info, Building, Shield, User, ArrowRight,
    MessageCircle, Phone, Mail, Calendar,
    Users, Clock, DollarSign
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LegacyService, OrganizerProfile, Discount } from "@/lib/database.types";
import { calculateEffectivePrice } from "@/lib/pricing-utils";

interface ServiceDetailLayoutProps {
    service: LegacyService;
    organizer: OrganizerProfile;
    isStorefront?: boolean;
    subdomain?: string;
    discounts?: Discount[];
}

export default function ServiceDetailLayout({
    service,
    organizer,
    isStorefront = false,
    subdomain,
    discounts
}: ServiceDetailLayoutProps) {
    const [scrolled, setScrolled] = useState(false);

    // Handle scroll effect for sticky header/elements if needed
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const images = service.images || [];
    const mainImage = images[0] || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800";

    // Fallback for missing data
    const features = service.features?.length > 0
        ? service.features
        : ["Professional Service", "Verified Provider", "Satisfaction Guaranteed"];

    const pricing = calculateEffectivePrice(
        Number(service.basePrice || service.price || 0),
        discounts || [],
        service.id,
        service.category
    );

    const price = pricing.finalPrice;
    const originalPrice = pricing.originalPrice;
    const isDiscounted = pricing.isDiscounted;
    const appliedDiscount = pricing.appliedDiscount;

    const currency = "USD"; // Default currency, could be props or settings
    const priceUnit = service.pricingType === 'per_person' ? '/person' : service.pricingType === 'hourly' ? '/hour' : '';

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-900 pb-20">
            {/* Breadcrumb - Only for marketplace vs storefront context distinction if needed */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <nav className="flex text-sm items-center" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-2">
                            <li>
                                <Link href={isStorefront ? `/storefront/${subdomain}` : "/"} className="text-gray-500 hover:text-primary transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li><span className="text-gray-400 mx-2">/</span></li>
                            <li>
                                <Link href={isStorefront ? `/storefront/${subdomain}#services` : "/services"} className="text-gray-500 hover:text-primary transition-colors">
                                    Services
                                </Link>
                            </li>
                            <li><span className="text-gray-400 mx-2">/</span></li>
                            <li><span className="text-gray-900 font-medium truncate max-w-[200px]">{service.title}</span></li>
                        </ol>
                    </nav>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Hero Image / Gallery */}
                        <section className="relative group rounded-2xl overflow-hidden shadow-sm">
                            <div className="aspect-video w-full bg-gray-200 relative">
                                <img
                                    src={mainImage}
                                    alt={service.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                            </div>

                            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                <div className="text-white">
                                    <Badge className="mb-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border-none capitalize">
                                        {service.category}
                                    </Badge>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="icon" variant="secondary" className="rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md">
                                        <Share2 className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="secondary" className="rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md">
                                        <Heart className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </section>

                        {/* Title & Meta */}
                        <section className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 sm:p-8 shadow-sm">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center flex-wrap gap-3 mb-3">
                                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                                            {service.title}
                                        </h1>
                                        {organizer.is_verified && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                <Check className="w-3 h-3 mr-1" /> Verified
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center text-gray-600 mb-4 gap-4 text-sm">
                                        <div className="flex items-center">
                                            <Star className="w-4 h-4 mr-1.5 text-yellow-400 fill-yellow-400" />
                                            <span className="font-semibold text-gray-900 mr-1">{service.rating || 'New'}</span>
                                            <span className="text-gray-500">({service.reviews} reviews)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Description */}
                        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <Info className="w-5 h-5 text-primary mr-3" />
                                About This Service
                            </h2>
                            <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
                                {service.description}
                            </p>
                        </section>

                        {/* Features */}
                        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <Check className="w-5 h-5 text-primary mr-3" />
                                What&apos;s Included
                            </h2>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-default border border-transparent hover:border-gray-100">
                                        <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                                            <Check className="w-3.5 h-3.5 text-primary" />
                                        </span>
                                        <span className="text-gray-700 font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Provider Info */}
                        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <Building className="w-5 h-5 text-primary mr-3" />
                                Service Provider
                            </h2>
                            <div className="flex items-start space-x-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-inner">
                                    {organizer.business_name?.[0] || organizer.name?.[0] || 'O'}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center flex-wrap gap-2 mb-1">
                                        <h3 className="font-semibold text-gray-900 text-lg">
                                            {organizer.business_name || organizer.name}
                                        </h3>
                                        {organizer.is_verified && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                <Shield className="w-3 h-3 mr-1" /> Verified Provider
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-500 text-sm mb-4">Member since {new Date(organizer.created_at).getFullYear()}</p>

                                    <Link
                                        href={isStorefront
                                            ? "/"
                                            : organizer.subdomain
                                                ? (process.env.NODE_ENV === 'development'
                                                    ? `http://${organizer.subdomain}.localhost:3000`
                                                    : `https://${organizer.subdomain}.zaaro.com`)
                                                : "#"
                                        }
                                        className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm transition-colors group"
                                    >
                                        <span>View Full Profile</span>
                                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column - Sticky Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">

                            {/* Pricing Card */}
                            <section className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                <div className="bg-gray-50/50 p-6 border-b border-gray-100">
                                    <div className="flex items-baseline justify-between mb-2">
                                        <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">Starting from</span>
                                    </div>
                                    <div className="flex items-baseline gap-1 flex-wrap">
                                        {isDiscounted && (
                                            <span className="text-lg line-through text-gray-400 mr-2">
                                                ${Number(originalPrice).toLocaleString()}
                                            </span>
                                        )}
                                        <span className={`text-3xl font-bold ${isDiscounted ? 'text-green-600' : 'text-gray-900'}`}>
                                            ${Number(price).toLocaleString()}
                                        </span>
                                        <span className="text-gray-500 font-medium">{priceUnit}</span>
                                        {isDiscounted && (
                                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 ml-2">
                                                {appliedDiscount?.discount_type === 'percentage'
                                                    ? `-${appliedDiscount.discount_value}% OFF`
                                                    : `-$${appliedDiscount?.discount_value} OFF`}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="mt-4 space-y-2">
                                        {service.minGuests && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Users className="w-4 h-4 mr-2 text-primary" />
                                                <span>{service.minGuests} - {service.maxGuests || '500+'} guests</span>
                                            </div>
                                        )}
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Calendar className="w-4 h-4 mr-2 text-primary" />
                                            <span>Minimum notice: 24 hours</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-3">
                                    <Button className="w-full h-12 text-lg font-semibold shadow-md hover:shadow-lg transition-all" size="lg" asChild>
                                        <Link href={isStorefront ? `/storefront/${subdomain}/book/${service.id}` : `/book?service=${service.id}`}>
                                            Book Now
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="w-full h-12" size="lg">
                                        Contact Organizer
                                    </Button>
                                </div>

                                <div className="px-6 pb-6 pt-2">
                                    <div className="grid grid-cols-2 gap-2 text-center text-xs text-gray-500">
                                        <div className="flex flex-col items-center p-2 rounded bg-gray-50">
                                            <Shield className="w-4 h-4 text-green-600 mb-1" />
                                            <span>Secure</span>
                                        </div>
                                        <div className="flex flex-col items-center p-2 rounded bg-gray-50">
                                            <Clock className="w-4 h-4 text-blue-600 mb-1" />
                                            <span>24/7 Support</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Quick Contact */}
                            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Have Questions?</h3>
                                <div className="space-y-3">
                                    <button className="w-full flex items-center p-3 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors group">
                                        <MessageCircle className="w-5 h-5 text-primary mr-3 group-hover:scale-110 transition-transform" />
                                        <span className="text-sm font-medium">Live Chat</span>
                                    </button>
                                    <button className="w-full flex items-center p-3 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors group">
                                        <Mail className="w-5 h-5 text-primary mr-3 group-hover:scale-110 transition-transform" />
                                        <span className="text-sm font-medium">Email Us</span>
                                    </button>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Sticky CTA */}
            <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-50 transition-transform duration-300 ${scrolled ? 'translate-y-0 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]' : 'translate-y-full'}`}>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs text-gray-500">Total</p>
                        <div className="flex items-baseline">
                            {isDiscounted && (
                                <span className="text-sm line-through text-gray-400 mr-1">
                                    ${originalPrice}
                                </span>
                            )}
                            <span className="font-bold text-lg text-gray-900">${price}</span>
                            <span className="text-xs text-gray-500 ml-1">{priceUnit}</span>
                        </div>
                    </div>
                    <Button className="flex-1 h-12 font-bold rounded-xl shadow-lg" asChild>
                        <Link href={isStorefront ? `/storefront/${subdomain}/book/${service.id}` : `/book?service=${service.id}`}>
                            Book Now
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
