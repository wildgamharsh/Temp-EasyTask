"use client";

import React from "react";
import { TrendingDown, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VolumeDiscountTier, CanadianProvince } from "@/lib/database.types";
import { formatCAD, calculateTax } from "@/lib/canadian-tax";
import { cn } from "@/lib/utils";

interface StorefrontVolumeTableProps {
    basePrice: number;
    volumeTiers: VolumeDiscountTier[];
    province?: CanadianProvince;
}

export function StorefrontVolumeTable({
    basePrice,
    volumeTiers,
    province,
}: StorefrontVolumeTableProps) {
    if (!volumeTiers || volumeTiers.length === 0) {
        return null;
    }

    // Sort tiers by min_guests
    const sortedTiers = [...volumeTiers].sort((a, b) => a.min_guests - b.min_guests);

    // Calculate savings percentage for each tier
    const tiersWithSavings = sortedTiers.map((tier) => {
        const savings = ((basePrice - tier.price_per_person) / basePrice) * 100;
        return { ...tier, savings };
    });

    // Find best value (highest savings)
    const bestValueTier = tiersWithSavings.reduce((best, current) =>
        current.savings > best.savings ? current : best
    );

    return (
        <div className="bg-white/80 backdrop-blur-sm border border-white/40 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center font-serif">
                    <TrendingDown className="w-5 h-5 text-[var(--color-primary)] mr-3" />
                    Volume Discounts
                </h2>
                <p className="text-sm text-gray-600">
                    Save more when you book for larger groups
                </p>
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                Guest Count
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                Price per Person
                            </th>
                            {province && (
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                    Incl. Tax
                                </th>
                            )}
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                Savings
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Base Price Row */}
                        <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 text-sm text-gray-700">
                                1 - {sortedTiers[0].min_guests - 1} guests
                            </td>
                            <td className="py-3 px-4 text-right text-sm font-semibold text-gray-900">
                                {formatCAD(basePrice)}
                            </td>
                            {province && (
                                <td className="py-3 px-4 text-right text-sm text-gray-600">
                                    {formatCAD(calculateTax(basePrice, province).total)}
                                </td>
                            )}
                            <td className="py-3 px-4 text-right text-sm text-gray-500">
                                —
                            </td>
                        </tr>

                        {/* Tier Rows */}
                        {tiersWithSavings.map((tier, index) => {
                            const isBestValue = tier.id === bestValueTier.id;
                            const taxInfo = province ? calculateTax(tier.price_per_person, province) : null;
                            const nextTier = tiersWithSavings[index + 1];
                            const maxGuests = nextTier ? nextTier.min_guests - 1 : null;

                            return (
                                <tr
                                    key={tier.id}
                                    className={cn(
                                        "border-b border-gray-100 transition-colors",
                                        isBestValue
                                            ? "bg-green-50 hover:bg-green-100"
                                            : "hover:bg-gray-50"
                                    )}
                                >
                                    <td className="py-3 px-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-700">
                                                {tier.min_guests}
                                                {maxGuests ? ` - ${maxGuests}` : '+'} guests
                                            </span>
                                            {isBestValue && (
                                                <Badge className="bg-green-600 text-white hover:bg-green-600 text-xs px-2 py-0">
                                                    <Sparkles className="w-3 h-3 mr-1" />
                                                    Best Value
                                                </Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-right text-sm font-semibold text-gray-900">
                                        {formatCAD(tier.price_per_person)}
                                    </td>
                                    {province && taxInfo && (
                                        <td className="py-3 px-4 text-right text-sm text-gray-600">
                                            {formatCAD(taxInfo.total)}
                                        </td>
                                    )}
                                    <td className="py-3 px-4 text-right text-sm font-semibold text-green-600">
                                        Save {tier.savings.toFixed(0)}%
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-3">
                {/* Base Price Card */}
                <div className="p-4 rounded-xl border border-gray-200 bg-white">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-700">
                            1 - {sortedTiers[0].min_guests - 1} guests
                        </span>
                        <span className="text-base font-bold text-gray-900">
                            {formatCAD(basePrice)}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500">Base price per person</p>
                </div>

                {/* Tier Cards */}
                {tiersWithSavings.map((tier, index) => {
                    const isBestValue = tier.id === bestValueTier.id;
                    const nextTier = tiersWithSavings[index + 1];
                    const maxGuests = nextTier ? nextTier.min_guests - 1 : null;

                    return (
                        <div
                            key={tier.id}
                            className={cn(
                                "p-4 rounded-xl border-2 transition-all",
                                isBestValue
                                    ? "border-green-500 bg-green-50"
                                    : "border-gray-200 bg-white"
                            )}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {tier.min_guests}
                                        {maxGuests ? ` - ${maxGuests}` : '+'} guests
                                    </span>
                                    {isBestValue && (
                                        <Badge className="bg-green-600 text-white hover:bg-green-600 text-xs px-2 py-0 ml-2">
                                            Best Value
                                        </Badge>
                                    )}
                                </div>
                                <span className="text-base font-bold text-gray-900">
                                    {formatCAD(tier.price_per_person)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500">Per person</span>
                                <span className="font-semibold text-green-600">
                                    Save {tier.savings.toFixed(0)}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Tax Note */}
            {province && (
                <p className="text-xs text-gray-500 mt-4 text-center">
                    Prices shown exclude tax. Tax calculated at checkout.
                </p>
            )}
        </div>
    );
}

export default StorefrontVolumeTable;
