"use client";

import React from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ServiceAddon, CanadianProvince } from "@/lib/database.types";
import { formatCAD, calculateTax, CANADIAN_TAX_RATES } from "@/lib/canadian-tax";

interface FixedPricingDisplayProps {
    basePrice: number;
    addons?: ServiceAddon[];
    province?: CanadianProvince;
    subdomain: string;
    serviceId: string;
    isVerified?: boolean;
}

export function FixedPricingDisplay({
    basePrice,
    addons = [],
    province,
    subdomain,
    serviceId,
    isVerified,
}: FixedPricingDisplayProps) {
    // Calculate tax if province is provided
    const taxInfo = province ? calculateTax(basePrice, province) : null;
    const activeAddons = addons.filter(a => a.is_active !== false);

    return (
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl overflow-hidden border border-gray-200/50 ring-1 ring-black/5">
            {/* Header / Price Highlight */}
            <div className="p-6 border-b bg-gradient-to-br from-gray-50 to-gray-100/50">
                <div className="flex items-baseline justify-between mb-2">
                    <span className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                        Fixed Price
                    </span>
                    {isVerified && (
                        <span className="text-green-600 text-xs font-bold uppercase flex items-center gap-1">
                            <Check className="w-3 h-3" /> Verified
                        </span>
                    )}
                </div>

                {/* Price Display */}
                <div className="flex-col">
                    <div className="flex items-baseline space-x-1">
                        <span className="text-2xl font-bold text-gray-900">$</span>
                        <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
                            {basePrice.toLocaleString()}
                        </span>
                    </div>
                    <div className="text-gray-500 text-sm font-medium mt-1">
                        One-time fee
                    </div>
                </div>

                {/* Tax Info */}
                {province && taxInfo && (
                    <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Subtotal</span>
                            <span>{formatCAD(basePrice)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>{CANADIAN_TAX_RATES[province].name}</span>
                            <span>{formatCAD(taxInfo.taxAmount)}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t">
                            <span>Total (incl. tax)</span>
                            <span>{formatCAD(taxInfo.total)}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Add-ons Section */}
            {activeAddons.length > 0 && (
                <div className="px-6 py-4 bg-gray-50/50 border-b">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <Plus className="w-4 h-4 mr-2 text-gray-600" />
                        Optional Add-ons
                    </h4>
                    <div className="space-y-2">
                        {activeAddons.slice(0, 3).map((addon) => (
                            <div
                                key={addon.id}
                                className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-white transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                    <span className="text-gray-700">{addon.name}</span>
                                </div>
                                <span className="text-gray-900 font-medium">
                                    +{formatCAD(addon.price)}
                                </span>
                            </div>
                        ))}
                        {activeAddons.length > 3 && (
                            <p className="text-xs text-gray-500 pl-4">
                                +{activeAddons.length - 3} more add-ons available
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="p-6 space-y-3">
                <Button
                    className="w-full h-12 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    asChild
                >
                    <Link href={`/storefront/${subdomain}/book/${serviceId}`}>
                        Book Now
                    </Link>
                </Button>
            </div>

            {/* Tax Note */}
            {province && (
                <div className="px-6 pb-4">
                    <p className="text-xs text-gray-500 text-center">
                        All prices in CAD. Tax calculated for {province}.
                    </p>
                </div>
            )}
        </div>
    );
}

export default FixedPricingDisplay;
