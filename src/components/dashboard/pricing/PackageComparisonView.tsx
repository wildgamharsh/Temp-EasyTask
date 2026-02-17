"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { ServicePackage } from "@/lib/database.types";
import { cn } from "@/lib/utils";

interface PackageComparisonViewProps {
    packages: ServicePackage[];
}

export function PackageComparisonView({ packages }: PackageComparisonViewProps) {
    if (packages.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>Add packages to see comparison</p>
            </div>
        );
    }

    // Collect all unique features across all packages
    const allFeatures = Array.from(
        new Set(packages.flatMap((pkg) => pkg.features))
    );

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                {/* Header Row */}
                <thead>
                    <tr className="border-b-2 border-gray-200">
                        <th className="text-left p-4 bg-gray-50 font-semibold text-gray-700 sticky left-0 z-10">
                            Features
                        </th>
                        {packages.map((pkg) => (
                            <th
                                key={pkg.id}
                                className={cn(
                                    "p-4 text-center min-w-[200px]",
                                    pkg.is_popular
                                        ? "bg-gradient-to-b from-amber-50 to-white border-x-2 border-amber-200"
                                        : "bg-white"
                                )}
                            >
                                <div className="space-y-2">
                                    {pkg.is_popular && (
                                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold rounded-full">
                                            ⭐ Popular
                                        </div>
                                    )}
                                    <div className="text-lg font-bold text-gray-900">
                                        {pkg.name || "Unnamed Package"}
                                    </div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        ${pkg.price.toFixed(2)}
                                    </div>
                                    {pkg.description && (
                                        <div className="text-xs text-gray-600 line-clamp-2">
                                            {pkg.description}
                                        </div>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* Feature Rows */}
                <tbody>
                    {allFeatures.map((feature, index) => (
                        <tr
                            key={index}
                            className={cn(
                                "border-b border-gray-100",
                                index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                            )}
                        >
                            <td className="p-4 text-sm text-gray-700 sticky left-0 z-10 bg-inherit font-medium">
                                {feature}
                            </td>
                            {packages.map((pkg) => {
                                const hasFeature = pkg.features.includes(feature);
                                return (
                                    <td
                                        key={pkg.id}
                                        className={cn(
                                            "p-4 text-center",
                                            pkg.is_popular && "bg-amber-50/30"
                                        )}
                                    >
                                        {hasFeature ? (
                                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100">
                                                <Check className="h-4 w-4 text-blue-600" />
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100">
                                                <X className="h-3 w-3 text-gray-400" />
                                            </div>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}

                    {/* Add-ons Row (if any) */}
                    {packages.some((pkg) => pkg.addons && pkg.addons.length > 0) && (
                        <>
                            <tr className="border-t-2 border-gray-200">
                                <td
                                    colSpan={packages.length + 1}
                                    className="p-3 bg-blue-50 text-sm font-semibold text-blue-900"
                                >
                                    Available Add-ons
                                </td>
                            </tr>
                            {packages.map((pkg) =>
                                (pkg.addons || []).map((addon, addonIndex) => (
                                    <tr
                                        key={`${pkg.id}-addon-${addonIndex}`}
                                        className="border-b border-gray-100 bg-blue-50/30"
                                    >
                                        <td className="p-4 text-sm text-gray-700 sticky left-0 z-10 bg-blue-50/30">
                                            {addon.name}
                                        </td>
                                        {packages.map((p) => (
                                            <td
                                                key={p.id}
                                                className="p-4 text-center text-sm"
                                            >
                                                {p.id === pkg.id ? (
                                                    <span className="text-blue-600 font-semibold">
                                                        +${addon.price.toFixed(2)}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </>
                    )}
                </tbody>
            </table>
        </div>
    );
}
