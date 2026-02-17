"use client";

import React from "react";
import { PricingModelSelector, PricingModel } from "../pricing/PricingModelSelector";
import { CompactPackageCard } from "../pricing/CompactPackageCard";
import { ProvinceDropdown } from "../shared/ProvinceDropdown";
import { ModernInput } from "../shared/ModernInput";
import { ServicePackage } from "@/lib/database.types";
import { DollarSign, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PricingBuilderStepProps {
    data: {
        pricingModel: PricingModel;
        price: number;
        packages: ServicePackage[];
        province: string;
        taxRate: number;
    };
    onUpdate: (data: any) => void;
}

export function PricingBuilderStep({ data, onUpdate }: PricingBuilderStepProps) {

    const handleAddPackage = () => {
        const newPackage: ServicePackage = {
            id: `temp-${Date.now()}`,
            service_id: "",
            name: "",
            description: "",
            price: 0,
            display_order: data.packages.length,
            features: [],
            is_popular: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        onUpdate({ packages: [...data.packages, newPackage] });
    };

    const handleUpdatePackage = (index: number, updates: Partial<ServicePackage>) => {
        const updatedPackages = [...data.packages];
        updatedPackages[index] = { ...updatedPackages[index], ...updates };
        onUpdate({ packages: updatedPackages });
    };

    const handleDeletePackage = (index: number) => {
        onUpdate({ packages: data.packages.filter((_, i) => i !== index) });
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. Model Selection */}
            <section>
                <PricingModelSelector
                    value={data.pricingModel}
                    onChange={(model) => onUpdate({ pricingModel: model })}
                />
            </section>

            {/* 2. Configuration Area */}
            {data.pricingModel && (
                <section className="space-y-8 border-t border-gray-100 pt-8 animate-in fade-in slide-in-from-bottom-2">

                    {/* Fixed Logic */}
                    {data.pricingModel === "fixed" && (
                        <div className="max-w-md space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Set Fixed Price</h3>
                            <ModernInput
                                label="Total Service Price"
                                type="number"
                                icon={DollarSign}
                                value={data.price || ""}
                                onChange={(e) => onUpdate({ price: parseFloat(e.target.value) || 0 })}
                                width="full"
                                placeholder="0.00"
                            />
                            <p className="text-sm text-gray-500">
                                This is the single, total price the client will pay for this service.
                            </p>
                        </div>
                    )}

                    {/* Per Person Logic */}
                    {data.pricingModel === "per_person" && (
                        <div className="max-w-md space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Set Rate Per Person</h3>
                            <ModernInput
                                label="Price Per Guest/Unit"
                                type="number"
                                icon={DollarSign}
                                value={data.price || ""}
                                onChange={(e) => onUpdate({ price: parseFloat(e.target.value) || 0 })}
                                width="full"
                                placeholder="0.00"
                            />
                            <p className="text-sm text-gray-500">
                                The total cost will be calculated based on the number of guests/units entered by the client.
                            </p>
                        </div>
                    )}

                    {/* Package Logic - Compact Cards */}
                    {data.pricingModel === "packages" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Pricing Packages</h3>
                                    <p className="text-sm text-gray-500">
                                        Create multiple tiers to give customers options
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleAddPackage}
                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Package
                                </Button>
                            </div>

                            {data.packages.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {data.packages.map((pkg, index) => (
                                        <CompactPackageCard
                                            key={pkg.id}
                                            package={pkg}
                                            onUpdate={(updates) => handleUpdatePackage(index, updates)}
                                            onDelete={() => handleDeletePackage(index)}
                                            canDelete={data.packages.length > 1}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                    <div className="text-gray-400 mb-3">
                                        <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-600 font-medium mb-1">No packages yet</p>
                                    <p className="text-gray-500 text-sm mb-4">Create your first pricing package</p>
                                    <Button
                                        type="button"
                                        onClick={handleAddPackage}
                                        variant="outline"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Package
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                </section>
            )}

            {/* 3. Location & Tax (Always visible at bottom) */}
            <section className="border-t border-gray-100 pt-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-xl">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-1">
                        Tax Configuration
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                        Select your province to automatically set the correct tax rate
                    </p>
                </div>
                <div className="space-y-4">
                    <ProvinceDropdown
                        label="Province / Region"
                        value={data.province}
                        onChange={(province, taxRate) => onUpdate({ province, taxRate })}
                    />
                    <ModernInput
                        label="Tax Rate (%)"
                        type="number"
                        min="0"
                        max="100"
                        value={data.taxRate || ""}
                        onChange={(e) => onUpdate({ taxRate: parseFloat(e.target.value) || 0 })}
                        width="half"
                        placeholder="13"
                        hint="Auto-filled when you select a province"
                    />
                </div>
            </section>
        </div>
    );
}
