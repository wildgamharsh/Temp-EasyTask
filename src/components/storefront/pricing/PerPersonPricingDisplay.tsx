"use client";

import React from "react";
import { Users, DollarSign, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    VolumeDiscountTier,
    ServiceFixedFee,
    ServiceAddon,
    CanadianProvince,
} from "@/lib/database.types";
import { formatCAD, calculateTax, CANADIAN_TAX_RATES } from "@/lib/canadian-tax";
import { StorefrontVolumeTable } from "./StorefrontVolumeTable";

interface PerPersonPricingDisplayProps {
    basePrice: number;
    volumeTiers?: VolumeDiscountTier[];
    fixedFees?: ServiceFixedFee[];
    addons?: ServiceAddon[];
    province?: CanadianProvince;
    subdomain: string;
    serviceId: string;
    isVerified?: boolean;
}

export function PerPersonPricingDisplay({
    basePrice,
    volumeTiers = [],
    fixedFees = [],
    addons = [],
    province,
    subdomain,
    serviceId,
    isVerified,
}: PerPersonPricingDisplayProps) {
    const activeFees = fixedFees.filter(f => f.is_active !== false);
    const activeAddons = addons.filter(a => a.is_active !== false);
    const hasVolumeTiers = volumeTiers.length > 0;

    // Calculate sample total for 50 guests
    const sampleGuests = 50;
    let sampleTotal = basePrice * sampleGuests;

    // Add fixed fees
    activeFees.forEach(fee => {
        sampleTotal += fee.price;
    });

    const taxInfo = province ? calculateTax(sampleTotal, province) : null;

    return (
        <div className="space-y-6">
            {/* Main Pricing Card */}
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl overflow-hidden border border-gray-200/50 ring-1 ring-black/5">
                {/* Header */}
                <div className="p-6 border-b bg-gradient-to-br from-gray-50 to-gray-100/50">
                    <div className="flex items-baseline justify-between mb-2">
                        <span className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                            Per Person Pricing
                        </span>
                        {isVerified && (
                            <span className="text-green-600 text-xs font-bold uppercase flex items-center gap-1">
                                <Users className="w-3 h-3" /> Verified
                            </span>
                        )}
                    </div>

                    {/* Base Price */}
                    <div className="flex-col mb-4">
                        <div className="flex items-baseline space-x-1">
                            <span className="text-2xl font-bold text-gray-900">$</span>
                            <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
                                {basePrice.toLocaleString()}
                            </span>
                            <span className="text-lg text-gray-600 ml-2">/ person</span>
                        </div>
                        {hasVolumeTiers && (
                            <p className="text-sm text-green-600 font-medium mt-2 flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                Volume discounts available
                            </p>
                        )}
                    </div>

                    {/* Sample Calculation */}
                    <div className="pt-4 border-t border-dashed border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">Example: {sampleGuests} guests</p>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>{sampleGuests} guests × {formatCAD(basePrice)}</span>
                                <span>{formatCAD(basePrice * sampleGuests)}</span>
                            </div>
                            {activeFees.map(fee => (
                                <div key={fee.id} className="flex justify-between text-gray-600">
                                    <span>{fee.name}</span>
                                    <span>{formatCAD(fee.price)}</span>
                                </div>
                            ))}
                            {province && taxInfo && (
                                <>
                                    <div className="flex justify-between text-gray-600 pt-1 border-t">
                                        <span>Subtotal</span>
                                        <span>{formatCAD(sampleTotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>{CANADIAN_TAX_RATES[province].name}</span>
                                        <span>{formatCAD(taxInfo.taxAmount)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-gray-900 pt-1 border-t">
                                        <span>Total</span>
                                        <span>{formatCAD(taxInfo.total)}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Fixed Fees */}
                {activeFees.length > 0 && (
                    <div className="px-6 py-4 bg-gray-50/50 border-b">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                            <Plus className="w-4 h-4 mr-2 text-gray-600" />
                            One-Time Fees
                        </h4>
                        <div className="space-y-2">
                            {activeFees.map((fee) => (
                                <div
                                    key={fee.id}
                                    className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-white transition-colors"
                                >
                                    <span className="text-gray-700">{fee.name}</span>
                                    <span className="text-gray-900 font-medium">
                                        {formatCAD(fee.price)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add-ons Preview */}
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
                                    <span className="text-gray-700">{addon.name}</span>
                                    <span className="text-gray-900 font-medium">
                                        +{formatCAD(addon.price)}
                                    </span>
                                </div>
                            ))}
                            {activeAddons.length > 3 && (
                                <p className="text-xs text-gray-500 pl-2">
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
                            Get Quote
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

            {/* Volume Discount Table */}
            {hasVolumeTiers && (
                <StorefrontVolumeTable
                    basePrice={basePrice}
                    volumeTiers={volumeTiers}
                    province={province}
                />
            )}
        </div>
    );
}

export default PerPersonPricingDisplay;
