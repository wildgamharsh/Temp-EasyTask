"use client";

import React from "react";
import { Check } from "lucide-react";
import { ServiceAddon, ServicePricingModel } from "@/lib/database.types";
import { formatCAD } from "@/lib/canadian-tax";

interface StorefrontAddonsListProps {
    addons: ServiceAddon[];
    pricingModel: ServicePricingModel;
}

export function StorefrontAddonsList({
    addons,
    pricingModel,
}: StorefrontAddonsListProps) {
    const activeAddons = addons.filter(a => a.is_active !== false);

    if (activeAddons.length === 0) {
        return null;
    }

    return (
        <div className="bg-white/80 backdrop-blur-sm border border-white/40 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center font-serif">
                <Check className="w-5 h-5 text-[var(--color-primary)] mr-3" />
                Optional Add-ons
            </h2>
            <p className="text-sm text-gray-600 mb-6">
                Enhance your experience with these optional extras
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeAddons.map((addon) => (
                    <div
                        key={addon.id}
                        className="flex items-start justify-between p-4 rounded-xl border border-gray-200 hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/5 transition-all group"
                    >
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[var(--color-primary)] transition-colors">
                                {addon.name}
                            </h3>
                            {addon.description && (
                                <p className="text-sm text-gray-600 line-clamp-2">
                                    {addon.description}
                                </p>
                            )}
                        </div>
                        <div className="ml-4 flex-shrink-0">
                            <span className="text-lg font-bold text-[var(--color-primary)]">
                                +{formatCAD(addon.price)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default StorefrontAddonsList;
