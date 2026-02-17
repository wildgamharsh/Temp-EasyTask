"use client";

import React, { useState, useEffect } from "react";
import { Tag, Package, Users, MapPin, ChevronRight, Check, Loader2, Settings, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    ServicePricingModel,
    ServicePricingConfig,
    ServicePackage,
    ServiceAddon,
    VolumeDiscountTier,
    ServiceFixedFee,
    CanadianProvince,
    TaxRate,
} from "@/lib/database.types";
import { calculateTaxFromRates, formatCAD } from "@/lib/canadian-tax";
import { getTaxRates } from "@/lib/supabase-data";
import { FixedPriceConfig } from "./FixedPriceConfig";
import { PackagesConfigV2 } from "./PackagesConfigV2";
import { PerPersonConfig } from "./PerPersonConfig";

// Props for the main configurator
export interface PricingConfiguratorProps {
    value: ServicePricingConfig;
    onChange: (config: ServicePricingConfig) => void;
    serviceId?: string; // Required for ET1.0 config builder
    serviceName?: string;
    description?: string;
    images?: string[];
    features?: string[];
    errors?: Record<string, string>;
}

// Model selection card data
const PRICING_MODELS: Array<{
    id: ServicePricingModel;
    title: string;
    description: string;
    icon: React.ReactNode;
}> = [
        {
            id: "fixed",
            title: "Fixed Price",
            description: "One flat rate for the service. Ideal for simple setups.",
            icon: <Tag className="h-6 w-6" />,
        },
        {
            id: "packages",
            title: "Packages",
            description: "Multiple tiers (e.g., Silver, Gold, Platinum).",
            icon: <Package className="h-6 w-6" />,
        },
        {
            id: "per_person",
            title: "Per Person",
            description: "Price varies by guest count. Ideal for catering.",
            icon: <Users className="h-6 w-6" />,
        },
    ];

export function PricingConfigurator({
    value,
    onChange,
    serviceId = "",
    serviceName = "Your Service",
    description = "",
    images = [],
    features = [],
    errors = {},
}: PricingConfiguratorProps) {
    const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
    const [loadingTaxes, setLoadingTaxes] = useState(true);
    const [showAiAssistant, setShowAiAssistant] = useState(false);

    useEffect(() => {
        const fetchTaxes = async () => {
            try {
                const rates = await getTaxRates();
                setTaxRates(rates);
            } finally {
                setLoadingTaxes(false);
            }
        };
        fetchTaxes();
    }, []);

    const selectedTaxRate = taxRates.find(r => r.name === value.province || r.province === value.province);

    // Handler for pricing model change
    const handleModelChange = (model: ServicePricingModel) => {
        onChange({
            ...value,
            pricing_model: model,
        });
    };

    // Handler for province change
    const handleProvinceChange = (province: CanadianProvince) => {
        onChange({
            ...value,
            province,
        });
    };

    // Handler for fixed price config changes
    const handleFixedConfigChange = (updates: Partial<ServicePricingConfig>) => {
        onChange({
            ...value,
            ...updates,
        });
    };

    // Handler for packages config changes
    const handlePackagesConfigChange = (updates: Partial<ServicePricingConfig>) => {
        onChange({
            ...value,
            ...updates,
        });
    };

    // Handler for per-person config changes
    const handlePerPersonConfigChange = (updates: Partial<ServicePricingConfig>) => {
        onChange({
            ...value,
            ...updates,
        });
    };

    return (
        <div className="space-y-6">
            {/* Configuration */}
            <div className="space-y-6">
                {/* Step 1: Model Selection */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">
                                1
                            </span>
                            <CardTitle className="text-lg">Select Pricing Model</CardTitle>
                        </div>
                        <CardDescription>
                            Choose how you want to structure your pricing
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {PRICING_MODELS.map((model) => (
                                <button
                                    key={model.id}
                                    type="button"
                                    onClick={() => handleModelChange(model.id)}
                                    className={cn(
                                        "relative p-4 rounded-lg border-2 text-left transition-all duration-200 group hover:shadow-md",
                                        value.pricing_model === model.id
                                            ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50"
                                            : "border-gray-200 hover:border-blue-300 bg-white"
                                    )}
                                >
                                    <div className={cn(
                                        "mb-3 transition-transform group-hover:scale-110",
                                        value.pricing_model === model.id ? "text-blue-600" : "text-gray-400"
                                    )}>
                                        {model.icon}
                                    </div>
                                    <h3 className="font-semibold">{model.title}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {model.description}
                                    </p>
                                    {value.pricing_model === model.id && (
                                        <div className="absolute top-2 right-2 text-blue-600">
                                            <Check className="h-5 w-5" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Step 2: Province & Tax Settings */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">
                                2
                            </span>
                            <CardTitle className="text-lg">Location & Tax Settings</CardTitle>
                        </div>
                        <CardDescription>
                            Select your province for tax calculations
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="max-w-sm">
                                <Label htmlFor="province" className="mb-2 block">
                                    Province / Territory
                                </Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <select
                                        id="province"
                                        value={value.province || ""}
                                        onChange={(e) => handleProvinceChange(e.target.value as CanadianProvince)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-input rounded-lg appearance-none focus:bg-background focus:ring-2 focus:ring-primary/20 transition-colors"
                                        disabled={loadingTaxes}
                                    >
                                        <option value="" disabled>
                                            {loadingTaxes ? "Loading Taxes..." : "Select Province"}
                                        </option>
                                        {taxRates.map((rate) => (
                                            <option key={rate.province} value={rate.name}>
                                                {rate.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rotate-90 pointer-events-none" />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1.5">
                                    Determines applicable GST, HST, or PST.
                                </p>
                            </div>

                            {/* Tax Info Alert */}
                            {selectedTaxRate && (
                                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg flex gap-3 items-start">
                                    <div className="text-amber-600 mt-0.5">
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                                            Tax Rate Configured: {((selectedTaxRate.gst_rate + selectedTaxRate.pst_rate + selectedTaxRate.hst_rate) * 100).toFixed(0)}%
                                        </p>
                                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                            Based on {value.province}, the applicable taxes are{" "}
                                            <strong>{calculateTaxFromRates(100, selectedTaxRate).breakdown.join(" + ")}</strong>.
                                            Prices entered below should be tax-exclusive.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Step 3: Model-Specific Configuration */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">
                                3
                            </span>
                            <CardTitle className="text-lg">
                                Configure{" "}
                                {value.pricing_model === "fixed"
                                    ? "Fixed Price"
                                    : value.pricing_model === "packages"
                                        ? "Packages"
                                        : value.pricing_model === "per_person"
                                            ? "Per-Person Pricing"
                                            : "Service Pricing"}
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {value.pricing_model === "fixed" && (
                            <FixedPriceConfig
                                basePrice={value.base_price}
                                addons={value.fixed_addons || []}
                                onBasePriceChange={(price) =>
                                    handleFixedConfigChange({ base_price: price })
                                }
                                onAddonsChange={(addons) =>
                                    handleFixedConfigChange({ fixed_addons: addons })
                                }
                                errors={errors}
                            />
                        )}

                        {value.pricing_model === "packages" && (
                            <PackagesConfigV2
                                packages={value.packages || []}
                                globalAddons={value.global_addons || []}
                                onPackagesChange={(packages) =>
                                    handlePackagesConfigChange({ packages })
                                }
                                onGlobalAddonsChange={(addons) =>
                                    handlePackagesConfigChange({ global_addons: addons })
                                }
                                errors={errors}
                            />
                        )}

                        {value.pricing_model === "per_person" && (
                            <PerPersonConfig
                                basePrice={value.per_person_base_price ?? value.base_price}
                                maxGuests={value.max_guests}
                                hasVolumeDiscounts={value.has_volume_discounts || false}
                                volumeTiers={value.volume_tiers || []}
                                fixedFees={value.fixed_fees || []}
                                addons={value.fixed_addons || []}
                                onBasePriceChange={(price) =>
                                    handlePerPersonConfigChange({
                                        per_person_base_price: price,
                                        base_price: price,
                                    })
                                }
                                onMaxGuestsChange={(max) =>
                                    handlePerPersonConfigChange({ max_guests: max })
                                }
                                onHasVolumeDiscountsChange={(has) =>
                                    handlePerPersonConfigChange({ has_volume_discounts: has })
                                }
                                onVolumeTiersChange={(tiers) =>
                                    handlePerPersonConfigChange({ volume_tiers: tiers })
                                }
                                onFixedFeesChange={(fees) =>
                                    handlePerPersonConfigChange({ fixed_fees: fees })
                                }
                                onAddonsChange={(addons) =>
                                    handlePerPersonConfigChange({ fixed_addons: addons })
                                }
                                errors={errors}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default PricingConfigurator;
