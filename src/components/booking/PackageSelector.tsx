"use client";

import React from "react";
import { Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { ServicePackage } from "@/lib/database.types";
import { formatCAD } from "@/lib/canadian-tax";

interface PackageSelectorProps {
    packages: ServicePackage[];
    selectedPackageId: string | null;
    onSelect: (packageId: string) => void;
}

export function PackageSelector({
    packages,
    selectedPackageId,
    onSelect,
}: PackageSelectorProps) {
    if (!packages || packages.length === 0) {
        return null;
    }

    // Sort packages by display_order
    const sortedPackages = [...packages].sort(
        (a, b) => (a.display_order || 0) - (b.display_order || 0)
    );

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Select a Package</h3>
            <div className="grid gap-4">
                {sortedPackages.map((pkg) => (
                    <div
                        key={pkg.id}
                        onClick={() => onSelect(pkg.id)}
                        className={cn(
                            "relative p-4 rounded-xl border-2 cursor-pointer transition-all",
                            "hover:border-primary/50 hover:shadow-md",
                            selectedPackageId === pkg.id
                                ? "border-primary bg-primary/5 shadow-md"
                                : "border-border bg-card"
                        )}
                    >
                        {/* Popular Badge */}
                        {pkg.is_popular && (
                            <div className="absolute -top-3 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                <Star className="h-3 w-3 fill-current" />
                                Popular
                            </div>
                        )}

                        <div className="flex items-start justify-between gap-4">
                            {/* Package Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-bold text-lg">{pkg.name}</h4>
                                    {selectedPackageId === pkg.id && (
                                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                                            <Check className="h-4 w-4" />
                                        </div>
                                    )}
                                </div>

                                {pkg.description && (
                                    <p className="text-sm text-muted-foreground mb-3">
                                        {pkg.description}
                                    </p>
                                )}

                                {/* Features */}
                                {pkg.features && pkg.features.length > 0 && (
                                    <ul className="space-y-1">
                                        {pkg.features.filter(f => f.trim()).map((feature, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-start gap-2 text-sm"
                                            >
                                                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Price */}
                            <div className="text-right flex-shrink-0">
                                <div className="text-2xl font-bold text-primary">
                                    {formatCAD(pkg.price)}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PackageSelector;
