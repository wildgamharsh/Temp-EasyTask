"use client";

import React, { useState } from "react";
import {
    DollarSign,
    Plus,
    Trash2,
    GripVertical,
    ChevronDown,
    ChevronUp,
    Star,
    X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ServicePackage, ServiceAddon } from "@/lib/database.types";

interface PackagesConfigProps {
    packages: ServicePackage[];
    globalAddons: ServiceAddon[];
    onPackagesChange: (packages: ServicePackage[]) => void;
    onGlobalAddonsChange: (addons: ServiceAddon[]) => void;
    errors?: Record<string, string>;
}

export function PackagesConfig({
    packages,
    globalAddons,
    onPackagesChange,
    onGlobalAddonsChange,
    errors = {},
}: PackagesConfigProps) {
    const [expandedPackages, setExpandedPackages] = useState<Set<string>>(new Set());

    // Toggle package expansion
    const togglePackage = (packageId: string) => {
        const newExpanded = new Set(expandedPackages);
        if (newExpanded.has(packageId)) {
            newExpanded.delete(packageId);
        } else {
            newExpanded.add(packageId);
        }
        setExpandedPackages(newExpanded);
    };

    // Add a new package
    const handleAddPackage = () => {
        const newPackage: ServicePackage = {
            id: `temp-${Date.now()}`,
            service_id: "",
            name: "",
            description: "",
            price: 0,
            display_order: packages.length,
            features: [],
            is_popular: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            addons: [],
        };
        onPackagesChange([...packages, newPackage]);
        setExpandedPackages(new Set([...expandedPackages, newPackage.id]));
    };

    // Update a package
    const handleUpdatePackage = (index: number, updates: Partial<ServicePackage>) => {
        const updated = [...packages];
        updated[index] = { ...updated[index], ...updates };
        onPackagesChange(updated);
    };

    // Remove a package
    const handleRemovePackage = (index: number) => {
        onPackagesChange(packages.filter((_, i) => i !== index));
    };

    // Add feature to a package
    const handleAddFeature = (packageIndex: number) => {
        const pkg = packages[packageIndex];
        handleUpdatePackage(packageIndex, {
            features: [...pkg.features, ""],
        });
    };

    // Update feature
    const handleUpdateFeature = (
        packageIndex: number,
        featureIndex: number,
        value: string
    ) => {
        const pkg = packages[packageIndex];
        const newFeatures = [...pkg.features];
        newFeatures[featureIndex] = value;
        handleUpdatePackage(packageIndex, { features: newFeatures });
    };

    // Remove feature
    const handleRemoveFeature = (packageIndex: number, featureIndex: number) => {
        const pkg = packages[packageIndex];
        handleUpdatePackage(packageIndex, {
            features: pkg.features.filter((_, i) => i !== featureIndex),
        });
    };

    // Add package-specific addon
    const handleAddPackageAddon = (packageIndex: number) => {
        const pkg = packages[packageIndex];
        const newAddon: ServiceAddon = {
            id: `temp-addon-${Date.now()}`,
            service_id: "",
            package_id: pkg.id,
            name: "",
            price: 0,
            is_active: true,
            created_at: new Date().toISOString(),
        };
        handleUpdatePackage(packageIndex, {
            addons: [...(pkg.addons || []), newAddon],
        });
    };

    // Update package addon
    const handleUpdatePackageAddon = (
        packageIndex: number,
        addonIndex: number,
        updates: Partial<ServiceAddon>
    ) => {
        const pkg = packages[packageIndex];
        const newAddons = [...(pkg.addons || [])];
        newAddons[addonIndex] = { ...newAddons[addonIndex], ...updates };
        handleUpdatePackage(packageIndex, { addons: newAddons });
    };

    // Remove package addon
    const handleRemovePackageAddon = (packageIndex: number, addonIndex: number) => {
        const pkg = packages[packageIndex];
        handleUpdatePackage(packageIndex, {
            addons: (pkg.addons || []).filter((_, i) => i !== addonIndex),
        });
    };

    // Add global addon
    const handleAddGlobalAddon = () => {
        const newAddon: ServiceAddon = {
            id: `temp-global-${Date.now()}`,
            service_id: "",
            name: "",
            price: 0,
            is_active: true,
            created_at: new Date().toISOString(),
        };
        onGlobalAddonsChange([...globalAddons, newAddon]);
    };

    // Update global addon
    const handleUpdateGlobalAddon = (index: number, updates: Partial<ServiceAddon>) => {
        const updated = [...globalAddons];
        updated[index] = { ...updated[index], ...updates };
        onGlobalAddonsChange(updated);
    };

    // Remove global addon
    const handleRemoveGlobalAddon = (index: number) => {
        onGlobalAddonsChange(globalAddons.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6">
            {/* Package Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-sm font-medium">Your Packages</h3>
                    <p className="text-xs text-muted-foreground">
                        Create multiple pricing tiers for your customers
                    </p>
                </div>
                <Button
                    type="button"
                    onClick={handleAddPackage}
                    className="gap-1"
                >
                    <Plus className="h-4 w-4" />
                    New Package
                </Button>
            </div>

            {/* Empty State */}
            {packages.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-xl border-2 border-dashed">
                    <div className="text-muted-foreground mb-3">
                        <svg
                            className="h-12 w-12 mx-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                        </svg>
                    </div>
                    <p className="text-muted-foreground font-medium">
                        No packages created yet.
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                        Start by clicking &quot;New Package&quot; above.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {packages.map((pkg, pIndex) => (
                        <div
                            key={pkg.id}
                            className="bg-background border rounded-xl overflow-hidden shadow-sm"
                        >
                            {/* Package Header */}
                            <div className="bg-muted/30 p-4 border-b flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        className="text-muted-foreground hover:text-foreground cursor-grab"
                                    >
                                        <GripVertical className="h-5 w-5" />
                                    </button>
                                    <Input
                                        type="text"
                                        value={pkg.name}
                                        onChange={(e) =>
                                            handleUpdatePackage(pIndex, { name: e.target.value })
                                        }
                                        placeholder="Package Name (e.g., Gold)"
                                        className="bg-transparent font-semibold border-0 border-b border-transparent focus:border-primary px-0 focus-visible:ring-0"
                                    />
                                    <div className="relative w-32">
                                        <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            min={0}
                                            step={0.01}
                                            value={pkg.price || ""}
                                            onChange={(e) =>
                                                handleUpdatePackage(pIndex, {
                                                    price: parseFloat(e.target.value) || 0,
                                                })
                                            }
                                            className="pl-6 font-medium"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleUpdatePackage(pIndex, { is_popular: !pkg.is_popular })
                                        }
                                        className={cn(
                                            "p-1.5 rounded transition-colors",
                                            pkg.is_popular
                                                ? "text-amber-500 bg-amber-100 dark:bg-amber-900/30"
                                                : "text-muted-foreground hover:text-amber-500"
                                        )}
                                        title={pkg.is_popular ? "Remove popular tag" : "Mark as popular"}
                                    >
                                        <Star className={cn("h-4 w-4", pkg.is_popular && "fill-current")} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => togglePackage(pkg.id)}
                                        className="text-muted-foreground hover:text-foreground p-1"
                                    >
                                        {expandedPackages.has(pkg.id) ? (
                                            <ChevronUp className="h-5 w-5" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5" />
                                        )}
                                    </button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemovePackage(pIndex)}
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Package Body (Collapsible) */}
                            {expandedPackages.has(pkg.id) && (
                                <div className="p-4 space-y-4">
                                    {/* Description */}
                                    <div>
                                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Description
                                        </Label>
                                        <textarea
                                            value={pkg.description || ""}
                                            onChange={(e) =>
                                                handleUpdatePackage(pIndex, {
                                                    description: e.target.value,
                                                })
                                            }
                                            rows={2}
                                            placeholder="Briefly describe this package..."
                                            className="mt-1 w-full text-sm border rounded-md px-3 py-2 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>

                                    {/* Included Features */}
                                    <div>
                                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                                            Included Features
                                        </Label>
                                        <div className="space-y-2">
                                            {pkg.features.map((feat, fIndex) => (
                                                <div key={fIndex} className="flex gap-2">
                                                    <Input
                                                        type="text"
                                                        value={feat}
                                                        onChange={(e) =>
                                                            handleUpdateFeature(pIndex, fIndex, e.target.value)
                                                        }
                                                        placeholder="e.g., Full Venue Decor"
                                                        className="flex-1"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveFeature(pIndex, fIndex)}
                                                        className="text-muted-foreground hover:text-destructive"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleAddFeature(pIndex)}
                                                className="text-primary"
                                            >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Add Feature
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Package-Specific Add-ons */}
                                    <div className="pt-2 border-t">
                                        <details className="group">
                                            <summary className="flex justify-between items-center cursor-pointer list-none text-sm font-medium">
                                                <span>Package-Specific Add-ons</span>
                                                <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                                            </summary>
                                            <div className="mt-3 space-y-2">
                                                <p className="text-xs text-muted-foreground mb-2">
                                                    Add extra items available only for this package.
                                                </p>
                                                {(pkg.addons || []).map((addon, aIndex) => (
                                                    <div key={addon.id} className="flex gap-2">
                                                        <Input
                                                            type="text"
                                                            value={addon.name}
                                                            onChange={(e) =>
                                                                handleUpdatePackageAddon(pIndex, aIndex, {
                                                                    name: e.target.value,
                                                                })
                                                            }
                                                            placeholder="Addon Name"
                                                            className="flex-1"
                                                        />
                                                        <div className="relative w-24">
                                                            <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                step={0.01}
                                                                value={addon.price || ""}
                                                                onChange={(e) =>
                                                                    handleUpdatePackageAddon(pIndex, aIndex, {
                                                                        price: parseFloat(e.target.value) || 0,
                                                                    })
                                                                }
                                                                className="pl-6"
                                                            />
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                handleRemovePackageAddon(pIndex, aIndex)
                                                            }
                                                            className="text-muted-foreground hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleAddPackageAddon(pIndex)}
                                                    className="text-primary"
                                                >
                                                    <Plus className="h-3 w-3 mr-1" />
                                                    Add Add-on
                                                </Button>
                                            </div>
                                        </details>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Global Add-ons */}
            {packages.length > 0 && (
                <div className="mt-8 p-4 bg-muted/30 border rounded-lg border-l-4 border-l-amber-400">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-bold">Global Add-ons</h3>
                        <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded">
                            Applies to all packages
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                        These fees (e.g., Setup Fee, Travel) are added to the final package total.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {globalAddons.map((addon, index) => (
                            <div
                                key={addon.id}
                                className="flex gap-2 bg-background p-2 rounded border"
                            >
                                <Input
                                    type="text"
                                    value={addon.name}
                                    onChange={(e) =>
                                        handleUpdateGlobalAddon(index, { name: e.target.value })
                                    }
                                    placeholder="Fee Name"
                                    className="flex-1 border-0 p-0 focus-visible:ring-0"
                                />
                                <div className="relative w-20">
                                    <DollarSign className="absolute left-1 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        value={addon.price || ""}
                                        onChange={(e) =>
                                            handleUpdateGlobalAddon(index, {
                                                price: parseFloat(e.target.value) || 0,
                                            })
                                        }
                                        className="pl-5 border-0 p-0 focus-visible:ring-0"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveGlobalAddon(index)}
                                    className="h-auto text-muted-foreground hover:text-destructive"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddGlobalAddon}
                            className="flex items-center justify-center p-2 border border-dashed rounded text-muted-foreground hover:text-primary hover:border-primary text-sm transition-colors"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Global Fee
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PackagesConfig;
