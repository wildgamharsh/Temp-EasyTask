"use client";

import React from "react";
import { Check, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ServicePackage, CanadianProvince } from "@/lib/database.types";
import { formatCAD, calculateTax, CANADIAN_TAX_RATES } from "@/lib/canadian-tax";
import { cn } from "@/lib/utils";

interface StorefrontPackageCardsProps {
    packages: ServicePackage[];
    province?: CanadianProvince;
    subdomain: string;
    serviceId: string;
}

export function StorefrontPackageCards({
    packages,
    province,
    subdomain,
    serviceId,
}: StorefrontPackageCardsProps) {
    if (!packages || packages.length === 0) {
        return null;
    }

    // Sort packages by display_order
    const sortedPackages = [...packages].sort(
        (a, b) => (a.display_order || 0) - (b.display_order || 0)
    );

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 font-serif">
                    Choose Your Package
                </h2>
                <p className="text-gray-600">
                    Select the perfect package for your event
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedPackages.map((pkg) => {
                    const taxInfo = province ? calculateTax(pkg.price, province) : null;
                    const isPopular = pkg.is_popular;

                    return (
                        <div
                            key={pkg.id}
                            className={cn(
                                "relative bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                                isPopular
                                    ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20"
                                    : "border-gray-200 hover:border-[var(--color-primary)]/50"
                            )}
                        >
                            {/* Popular Badge */}
                            {isPopular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                                    <Badge className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)] px-4 py-1 text-xs font-bold uppercase shadow-lg">
                                        <Star className="w-3 h-3 mr-1 fill-current" />
                                        Most Popular
                                    </Badge>
                                </div>
                            )}

                            {/* Package Header */}
                            <div className={cn(
                                "p-6 text-center",
                                isPopular
                                    ? "bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary)]/5"
                                    : "bg-gray-50"
                            )}>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 font-serif">
                                    {pkg.name}
                                </h3>
                                {pkg.description && (
                                    <p className="text-sm text-gray-600 mb-4">
                                        {pkg.description}
                                    </p>
                                )}

                                {/* Price */}
                                <div className="mb-2">
                                    <div className="flex items-baseline justify-center space-x-1">
                                        <span className="text-2xl font-bold text-gray-900">$</span>
                                        <span className="text-4xl font-extrabold text-gray-900">
                                            {pkg.price.toLocaleString()}
                                        </span>
                                    </div>
                                    {province && taxInfo && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            {formatCAD(taxInfo.total)} incl. tax
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Features List */}
                            <div className="p-6">
                                <ul className="space-y-3 mb-6">
                                    {pkg.features && pkg.features.length > 0 ? (
                                        pkg.features.filter(f => f.trim()).map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                                                    <Check className="w-3 h-3 text-green-600" />
                                                </div>
                                                <span className="text-sm text-gray-700 flex-1">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-sm text-gray-500 italic">
                                            No features listed
                                        </li>
                                    )}
                                </ul>

                                {/* CTA Button */}
                                <Button
                                    className={cn(
                                        "w-full h-11 rounded-xl font-semibold transition-all",
                                        isPopular
                                            ? "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-lg shadow-[var(--color-primary)]/25"
                                            : "bg-gray-900 hover:bg-gray-800 text-white"
                                    )}
                                    asChild
                                >
                                    <Link href={`/storefront/${subdomain}/book/${serviceId}?package=${pkg.id}`}>
                                        Select Package
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>
                            </div>

                            {/* Tax Note */}
                            {province && (
                                <div className="px-6 pb-4">
                                    <p className="text-xs text-gray-500 text-center">
                                        + {CANADIAN_TAX_RATES[province].name}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default StorefrontPackageCards;
