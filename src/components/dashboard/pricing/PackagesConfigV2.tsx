"use client";

import React, { useState, useEffect } from "react";
import { Plus, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ServicePackage, ServiceAddon } from "@/lib/database.types";
import { PackageCardV2 } from "./PackageCardV2";
import { toast } from "sonner";
import { PackageComparisonView } from "./PackageComparisonView";

interface PackagesConfigV2Props {
    packages: ServicePackage[];
    globalAddons: ServiceAddon[];
    onPackagesChange: (packages: ServicePackage[]) => void;
    onGlobalAddonsChange: (addons: ServiceAddon[]) => void;
    errors?: Record<string, string>;
}

const PACKAGE_TEMPLATES: any[] = [];

export function PackagesConfigV2({
    packages,
    globalAddons,
    onPackagesChange,
    onGlobalAddonsChange,
    errors = {},
}: PackagesConfigV2Props) {
    const [viewMode, setViewMode] = React.useState<"edit" | "compare">("edit");

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd/Ctrl + K: Add new package
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                handleAddPackage();
                toast.success("New package added", {
                    description: "Press Tab to navigate fields",
                });
            }

            // Cmd/Ctrl + S: Save (handled by parent form)
            // Cmd/Ctrl + D: Duplicate last package
            if ((e.metaKey || e.ctrlKey) && e.key === "d" && packages.length > 0) {
                e.preventDefault();
                handleDuplicatePackage(packages.length - 1);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [packages]);

    // Add a new blank package
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
    };

    // Update a package
    const handleUpdatePackage = (index: number, updates: Partial<ServicePackage>) => {
        const updated = [...packages];
        updated[index] = { ...updated[index], ...updates };
        onPackagesChange(updated);
    };

    // Duplicate a package
    const handleDuplicatePackage = (index: number) => {
        const original = packages[index];
        const duplicate: ServicePackage = {
            ...original,
            id: `temp-${Date.now()}`,
            name: `${original.name} (Copy)`,
            display_order: packages.length,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        onPackagesChange([...packages, duplicate]);
        toast.success("Package duplicated", {
            description: `Created copy of ${original.name}`,
        });
    };

    // Remove a package
    const handleRemovePackage = (index: number) => {
        const packageName = packages[index].name || "Package";
        onPackagesChange(packages.filter((_, i) => i !== index));
        toast.success("Package removed", {
            description: packageName,
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-sm font-medium flex items-center gap-2">
                        Your Packages
                        {packages.length > 0 && (
                            <Badge variant="secondary" className="font-normal">
                                {packages.length}
                            </Badge>
                        )}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        Create pricing tiers for your customers
                    </p>
                </div>
                {packages.length >= 2 && (
                    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setViewMode("edit")}
                            className={cn(
                                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                                viewMode === "edit"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                            )}
                        >
                            Edit Mode
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("compare")}
                            className={cn(
                                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                                viewMode === "compare"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                            )}
                        >
                            Compare View
                        </button>
                    </div>
                )}
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
                    <p className="text-muted-foreground font-medium mb-1">No packages yet</p>
                    <p className="text-muted-foreground text-sm mb-4">
                        Create your first pricing package
                    </p>
                    <div className="flex items-center justify-center gap-2">
                        <Button type="button" onClick={handleAddPackage} className="gap-1.5">
                            <Plus className="h-4 w-4" />
                            Create Package
                        </Button>
                    </div>
                </div>
            ) : viewMode === "compare" ? (
                /* Comparison View */
                <div className="space-y-4">
                    <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                        <PackageComparisonView packages={packages} />
                    </div>
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setViewMode("edit")}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            ← Back to Edit Mode
                        </button>
                    </div>
                </div>
            ) : (
                /* Package Cards */
                <div className="space-y-4">
                    {packages.map((pkg, index) => (
                        <PackageCardV2
                            key={pkg.id}
                            package={pkg}
                            index={index}
                            onUpdate={(updates) => handleUpdatePackage(index, updates)}
                            onDelete={() => handleRemovePackage(index)}
                            onDuplicate={() => handleDuplicatePackage(index)}
                        />
                    ))}

                    {/* Add Package Button - At End of List */}
                    <button
                        type="button"
                        onClick={handleAddPackage}
                        className="w-full p-6 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-lg transition-all group"
                    >
                        <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-blue-600">
                            <div className="p-3 rounded-full bg-gray-100 group-hover:bg-blue-100 transition-colors">
                                <Plus className="h-5 w-5" />
                            </div>
                            <div className="font-medium">Add Another Package</div>
                            <div className="text-xs flex items-center gap-1">
                                Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border text-[10px] font-mono">⌘K</kbd> to add
                            </div>
                        </div>
                    </button>
                </div>
            )}

            {/* Keyboard Shortcuts Help */}
            {packages.length > 0 && (
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
                    <div className="flex items-center gap-1.5">
                        <kbd className="px-2 py-0.5 bg-muted rounded border font-mono">⌘K</kbd>
                        <span>Add package</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <kbd className="px-2 py-0.5 bg-muted rounded border font-mono">⌘D</kbd>
                        <span>Duplicate last</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <kbd className="px-2 py-0.5 bg-muted rounded border font-mono">Enter</kbd>
                        <span>Add feature</span>
                    </div>
                </div>
            )}

            {/* Global Add-ons Section */}
            {packages.length > 0 && (
                <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-900 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            <span className="text-amber-600 dark:text-amber-400">⚡</span>
                            Global Add-ons
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                            Applies to all packages
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                        Optional extras available across all your packages. Press Enter to move between fields.
                    </p>

                    <div className="space-y-2">
                        {globalAddons.map((addon, index) => (
                            <div
                                key={addon.id}
                                className="flex gap-2 bg-background p-3 rounded-lg border group hover:border-primary/50 transition-colors"
                            >
                                <input
                                    type="text"
                                    value={addon.name}
                                    onChange={(e) => {
                                        const updated = [...globalAddons];
                                        updated[index] = { ...updated[index], name: e.target.value };
                                        onGlobalAddonsChange(updated);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            // Focus on price input
                                            const priceInput = e.currentTarget.parentElement?.querySelector('input[type="number"]') as HTMLInputElement;
                                            priceInput?.focus();
                                        }
                                    }}
                                    placeholder="Add-on name (e.g., Setup Fee)"
                                    className="flex-1 bg-transparent border-0 focus:outline-none text-sm px-2 focus:ring-0"
                                />
                                <div className="flex items-center gap-1 border-l pl-2">
                                    <span className="text-muted-foreground text-sm">$</span>
                                    <input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        value={addon.price || ""}
                                        onChange={(e) => {
                                            const updated = [...globalAddons];
                                            updated[index] = {
                                                ...updated[index],
                                                price: parseFloat(e.target.value) || 0,
                                            };
                                            onGlobalAddonsChange(updated);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                // Add new addon and focus on its name input
                                                const newAddon: ServiceAddon = {
                                                    id: `temp-global-${Date.now()}`,
                                                    service_id: "",
                                                    name: "",
                                                    price: 0,
                                                    is_active: true,
                                                    created_at: new Date().toISOString(),
                                                };
                                                onGlobalAddonsChange([...globalAddons, newAddon]);
                                                // Focus will be set automatically on the new input
                                                setTimeout(() => {
                                                    const inputs = document.querySelectorAll('.global-addon-name-input');
                                                    const lastInput = inputs[inputs.length - 1] as HTMLInputElement;
                                                    lastInput?.focus();
                                                }, 0);
                                            }
                                        }}
                                        className="w-24 bg-transparent border-0 focus:outline-none text-sm text-right focus:ring-0"
                                        placeholder="0.00"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onGlobalAddonsChange(globalAddons.filter((_, i) => i !== index));
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-1 transition-opacity"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => {
                                const newAddon: ServiceAddon = {
                                    id: `temp-global-${Date.now()}`,
                                    service_id: "",
                                    name: "",
                                    price: 0,
                                    is_active: true,
                                    created_at: new Date().toISOString(),
                                };
                                onGlobalAddonsChange([...globalAddons, newAddon]);
                                setTimeout(() => {
                                    const inputs = document.querySelectorAll('.global-addon-name-input');
                                    const lastInput = inputs[inputs.length - 1] as HTMLInputElement;
                                    lastInput?.focus();
                                }, 0);
                            }}
                            className="w-full flex items-center justify-center p-3 border-2 border-dashed border-amber-300 dark:border-amber-800 rounded-lg text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-400 text-sm transition-colors"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Global Add-on
                        </button>
                        <p className="text-xs text-muted-foreground text-center pt-1">
                            Press <kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px] font-mono">Enter</kbd> after price to add another
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
