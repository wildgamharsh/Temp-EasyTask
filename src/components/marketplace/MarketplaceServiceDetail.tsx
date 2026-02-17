"use client";

import { useState } from "react";
import Image from "next/image";
import {
    MapPin,
    Star,
    Check,
    Info,
    Building,
    ShieldCheck,
    CheckCircle2,
    MessageCircle,
    Phone,
    Mail,
    Globe,
    Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarketplaceBookingModal } from "@/components/marketplace/booking/MarketplaceBookingModal";
import { Service, OrganizerProfile, serviceToLegacy } from "@/lib/database.types";

interface MarketplaceServiceDetailProps {
    service: Service;
    organizer: OrganizerProfile;
    startingPrice?: number;
}

export function MarketplaceServiceDetail({ service, organizer, startingPrice }: MarketplaceServiceDetailProps) {

    // Helper to get Pricing Display
    const getPricingDisplay = () => {
        if (service.pricing_model === "fixed") {
            return {
                amount: service.base_price?.toLocaleString(),
                unit: "total",
                label: "Fixed Price",
            };
        } else if (service.pricing_model === "packages") {
            return {
                amount: "",
                unit: "",
                label: "Available Packages",
            };
        } else {
            // Configured or Dynamic
            // Use startingPrice if available, otherwise fall back to base_price
            const displayPrice = startingPrice !== undefined ? startingPrice : service.base_price;
            return {
                amount: displayPrice?.toLocaleString(),
                unit: "starts from",
                label: "Starting at",
            };
        }
    };

    const pricingDisplay = getPricingDisplay();

    return (
        <div className="font-sans text-slate-900">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

                <main className="py-2">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Hero Image & Info Overlay */}
                            <section className="relative group">
                                <div className="relative h-[400px] sm:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl bg-black">
                                    <Image
                                        src={
                                            (service.images && service.images[0]) ||
                                            "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2969&auto=format&fit=crop"
                                        }
                                        alt={service.title}
                                        fill
                                        className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80"
                                        priority
                                    />

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                    {/* Content Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 text-white">
                                        <div className="flex flex-wrap items-center gap-3 mb-4">
                                            <Badge className="bg-primary text-white border-none px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                                                <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                                                Verified & Vetted
                                            </Badge>
                                            <div className="flex items-center text-amber-400">
                                                <Star className="w-5 h-5 fill-current mr-2" />
                                                <span className="font-bold text-xl">{service.rating?.toFixed(1) || "New"}</span>
                                                <span className="text-white/60 text-sm ml-2">({service.reviews || 0} reviews)</span>
                                            </div>
                                        </div>

                                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight max-w-2xl">
                                            {service.title}
                                        </h1>

                                        <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm sm:text-base">
                                            <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                                                <MapPin className="w-5 h-5 mr-2 text-primary" />
                                                <span>{service.province || "Online / Remote"}</span>
                                            </div>
                                            <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                                                <Building className="w-5 h-5 mr-2 text-primary" />
                                                <span>{organizer?.business_name || "Enterprise Pro"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* About / Description */}
                            <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                                    <Info className="w-5 h-5 text-primary mr-3" />
                                    About This Service
                                </h2>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-line mb-8">
                                    {service.description}
                                </p>

                                {/* Features */}
                                {service.features && service.features.length > 0 && (
                                    <div className="mt-8 pt-8 border-t border-slate-100">
                                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                                            <Check className="w-5 h-5 text-primary mr-3" />
                                            What's Included
                                        </h3>
                                        <ul className="grid grid-cols-1 space-y-4">
                                            {service.features.map((feature: string, idx: number) => (
                                                <li
                                                    key={idx}
                                                    className="flex items-center space-x-4 group"
                                                >
                                                    <span className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center transition-colors">
                                                        <Check className="w-4 h-4 text-primary" />
                                                    </span>
                                                    <span className="text-slate-700 text-lg font-medium leading-relaxed">
                                                        {feature}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </section>

                            {/* PACKAGES SECTION */}
                            {service.pricing_model === "packages" &&
                                service.packages && service.packages.length > 0 && (
                                    <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                                            <Globe className="w-5 h-5 text-primary mr-3" />
                                            Available Packages
                                        </h2>
                                        <div className="space-y-6">
                                            {service.packages.map((pkg: any) => (
                                                <div
                                                    key={pkg.id}
                                                    className="rounded-xl border border-slate-200 bg-white p-6 hover:border-primary transition-all shadow-sm hover:shadow-md"
                                                >
                                                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                                                        <div>
                                                            <h3 className="font-bold text-slate-900 text-xl">
                                                                {pkg.name}
                                                            </h3>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-2xl font-bold text-primary">
                                                                ${pkg.price.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-500 mb-6 leading-relaxed">
                                                        {pkg.description}
                                                    </p>
                                                    {pkg.features && pkg.features.length > 0 && (
                                                        <div className="bg-slate-50 rounded-lg p-4">
                                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Package Features</p>
                                                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                {pkg.features.map((feature: string, i: number) => (
                                                                    <li
                                                                        key={i}
                                                                        className="text-sm text-slate-700 flex items-center"
                                                                    >
                                                                        <Check className="w-4 h-4 text-green-500 mr-2 shrink-0" />
                                                                        {feature}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                            {/* ADD-ONS SECTION */}
                            {service.addons && service.addons.length > 0 && (
                                <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                                        <Clock className="w-5 h-5 text-primary mr-3" />
                                        Optional Add-ons
                                    </h2>
                                    <div className="grid grid-cols-1 gap-3">
                                        {service.addons.map((addon: any) => (
                                            <div
                                                key={addon.id}
                                                className="flex items-center justify-between p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="bg-white p-2 rounded-lg border border-slate-200 text-primary">
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-slate-900">
                                                            {addon.name}
                                                        </h4>
                                                        <p className="text-sm text-slate-500">
                                                            {addon.description || "Enhance your booking"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block font-bold text-slate-900">
                                                        ${addon.price.toLocaleString()}
                                                    </span>
                                                    <span className="text-xs text-slate-500 uppercase">
                                                        Fixed
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Provider Info */}
                            <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                                    <Building className="w-5 h-5 text-primary mr-3" />
                                    Service Provider
                                </h2>
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg shrink-0 overflow-hidden">
                                        {organizer?.logo_url ? (
                                            <Image src={organizer.logo_url} alt="Logo" width={64} height={64} className="object-cover h-full w-full" />
                                        ) : (
                                            organizer?.business_name
                                                ?.substring(0, 2)
                                                .toUpperCase() || "OP"
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center flex-wrap gap-2 mb-1">
                                            <h3 className="font-bold text-xl text-slate-900">
                                                {organizer?.business_name || "Organizer Profile"}
                                            </h3>
                                            <Badge className="bg-primary/10 text-primary border-none">
                                                <ShieldCheck className="w-3 h-3 mr-1" /> Verified Provider
                                            </Badge>
                                        </div>
                                        <p className="text-slate-500 text-sm mb-4">
                                            Partner since {organizer?.created_at ? new Date(organizer.created_at).getFullYear() : '2024'}
                                        </p>
                                    </div>
                                </div>
                            </section>

                        </div>

                        {/* Right Column - Pricing & Actions (Sticky) */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">
                                {/* Pricing Card */}
                                <section className="relative bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
                                    {/* Minimalist Header */}
                                    <div className="relative bg-slate-50 p-8 border-b border-slate-100">

                                        <div className="relative z-10">

                                            {pricingDisplay.amount && (
                                                <div className="flex items-baseline gap-2 mb-6">
                                                    <span className="text-3xl font-bold text-slate-400">
                                                        $
                                                    </span>
                                                    <span className="text-6xl font-black text-slate-900 tracking-tight">
                                                        {pricingDisplay.amount}
                                                    </span>
                                                    {pricingDisplay.unit !== "total" && (
                                                        <span className="text-slate-500 text-xl font-medium">
                                                            /{pricingDisplay.unit}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Package List in Header */}
                                            {service.pricing_model === 'packages' && service.packages && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Choose Your Package</p>
                                                        <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold uppercase">
                                                            {service.packages.length} Options
                                                        </span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {service.packages.map((pkg: any, idx: number) => (
                                                            <div
                                                                key={pkg.id}
                                                                className="group relative bg-white border border-slate-200 rounded-2xl p-4 hover:border-primary transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-lg shadow-sm"
                                                            >
                                                                {/* Popular Badge */}
                                                                {pkg.is_popular && (
                                                                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg border-2 border-white">
                                                                        Popular
                                                                    </div>
                                                                )}

                                                                <div className="flex justify-between items-center">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-primary/10 transition-colors flex items-center justify-center border border-slate-100">
                                                                            <span className="text-slate-600 group-hover:text-primary font-black text-lg transition-colors">{idx + 1}</span>
                                                                        </div>
                                                                        <span className="font-bold text-slate-800 text-lg group-hover:text-primary transition-colors">
                                                                            {pkg.name}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className="font-black text-slate-900 text-2xl tracking-tight">
                                                                            ${pkg.price.toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="p-6 space-y-4 bg-white">
                                        <MarketplaceBookingModal service={serviceToLegacy(service)} />

                                        <Button
                                            variant="outline"
                                            className="w-full py-6 text-base font-semibold rounded-2xl border-2 border-slate-200 hover:border-primary hover:bg-slate-50 text-slate-700 transition-all duration-300"
                                        >
                                            <MessageCircle className="w-5 h-5 mr-2" />
                                            Contact Organizer
                                        </Button>
                                    </div>
                                </section>

                                {/* Quick Contact Card */}
                                <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                                    <h3 className="font-semibold text-slate-900 mb-4">
                                        Have Questions?
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex w-full items-center text-slate-500 hover:text-primary transition-colors text-sm group cursor-pointer">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-primary/10 flex items-center justify-center mr-3 transition-colors">
                                                <Phone className="w-4 h-4" />
                                            </div>
                                            <span>Schedule a Call</span>
                                        </div>
                                        <div className="flex w-full items-center text-slate-500 hover:text-primary transition-colors text-sm group cursor-pointer">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-primary/10 flex items-center justify-center mr-3 transition-colors">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <span>Email Support</span>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
