"use client";

import React from "react";
import { DollarSign, Plus, Trash2, Users, ToggleLeft, ToggleRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VolumeDiscountTier, ServiceFixedFee, ServiceAddon } from "@/lib/database.types";

interface PerPersonConfigProps {
    basePrice: number;
    maxGuests?: number;
    hasVolumeDiscounts: boolean;
    volumeTiers: VolumeDiscountTier[];
    fixedFees: ServiceFixedFee[];
    addons: ServiceAddon[];
    onBasePriceChange: (price: number) => void;
    onMaxGuestsChange: (max: number | undefined) => void;
    onHasVolumeDiscountsChange: (has: boolean) => void;
    onVolumeTiersChange: (tiers: VolumeDiscountTier[]) => void;
    onFixedFeesChange: (fees: ServiceFixedFee[]) => void;
    onAddonsChange: (addons: ServiceAddon[]) => void;
    errors?: Record<string, string>;
}

export function PerPersonConfig({
    basePrice,
    maxGuests,
    hasVolumeDiscounts,
    volumeTiers,
    fixedFees,
    addons,
    onBasePriceChange,
    onMaxGuestsChange,
    onHasVolumeDiscountsChange,
    onVolumeTiersChange,
    onFixedFeesChange,
    onAddonsChange,
    errors = {},
}: PerPersonConfigProps) {
    // Add volume tier
    const handleAddTier = () => {
        const newTier: VolumeDiscountTier = {
            id: `temp-tier-${Date.now()}`,
            service_id: "",
            min_guests: 0,
            price_per_person: 0,
            display_order: volumeTiers.length,
            created_at: new Date().toISOString(),
        };
        onVolumeTiersChange([...volumeTiers, newTier]);
    };

    // Update volume tier
    const handleUpdateTier = (index: number, updates: Partial<VolumeDiscountTier>) => {
        const updated = [...volumeTiers];
        updated[index] = { ...updated[index], ...updates };
        onVolumeTiersChange(updated);
    };

    // Remove volume tier
    const handleRemoveTier = (index: number) => {
        onVolumeTiersChange(volumeTiers.filter((_, i) => i !== index));
    };

    // Add fixed fee
    const handleAddFee = () => {
        const newFee: ServiceFixedFee = {
            id: `temp-fee-${Date.now()}`,
            service_id: "",
            name: "",
            price: 0,
            is_active: true,
            created_at: new Date().toISOString(),
        };
        onFixedFeesChange([...fixedFees, newFee]);
    };

    // Update fixed fee
    const handleUpdateFee = (index: number, updates: Partial<ServiceFixedFee>) => {
        const updated = [...fixedFees];
        updated[index] = { ...updated[index], ...updates };
        onFixedFeesChange(updated);
    };

    // Remove fixed fee
    const handleRemoveFee = (index: number) => {
        onFixedFeesChange(fixedFees.filter((_, i) => i !== index));
    };

    // Add addon
    const handleAddAddon = () => {
        const newAddon: ServiceAddon = {
            id: `temp-addon-${Date.now()}`,
            service_id: "",
            name: "",
            price: 0,
            is_active: true,
            created_at: new Date().toISOString(),
        };
        onAddonsChange([...addons, newAddon]);
    };

    // Update addon
    const handleUpdateAddon = (index: number, updates: Partial<ServiceAddon>) => {
        const updated = [...addons];
        updated[index] = { ...updated[index], ...updates };
        onAddonsChange(updated);
    };

    // Remove addon
    const handleRemoveAddon = (index: number) => {
        onAddonsChange(addons.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6">
            {/* Base Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="perPersonPrice" className="mb-2 block">
                        Base Price Per Person (Tax Exclusive)
                    </Label>
                    <div className="relative max-w-xs">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="perPersonPrice"
                            type="number"
                            min={0}
                            step={0.01}
                            value={basePrice || ""}
                            onChange={(e) => onBasePriceChange(parseFloat(e.target.value) || 0)}
                            className="pl-10"
                            placeholder="0.00"
                        />
                    </div>
                    {errors.basePrice && (
                        <p className="text-sm text-destructive mt-1">{errors.basePrice}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="maxGuests" className="mb-2 block">
                        Maximum Guests
                    </Label>
                    <div className="relative max-w-xs">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="maxGuests"
                            type="number"
                            min={1}
                            value={maxGuests || ""}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                onMaxGuestsChange(isNaN(val) ? undefined : val);
                            }}
                            className="pl-10"
                            placeholder="Unlimited"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Leave empty for unlimited.
                    </p>
                </div>
            </div>

            {/* Fixed Fees */}
            <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <h3 className="text-sm font-medium">Fixed Fees (One-time)</h3>
                        <p className="text-xs text-muted-foreground">
                            e.g., Setup Fee, Travel Fee, Equipment Fee
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddFee}
                        className="gap-1"
                    >
                        <Plus className="h-4 w-4" />
                        Add Fee
                    </Button>
                </div>

                {fixedFees.length === 0 ? (
                    <div className="text-center py-4 bg-muted/30 rounded-lg border border-dashed">
                        <p className="text-sm text-muted-foreground">
                            No fixed fees added.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {fixedFees.map((fee, index) => (
                            <div
                                key={fee.id}
                                className="flex gap-2 bg-muted/30 p-2 rounded border"
                            >
                                <Input
                                    type="text"
                                    value={fee.name}
                                    onChange={(e) =>
                                        handleUpdateFee(index, { name: e.target.value })
                                    }
                                    placeholder="e.g., Venue Setup"
                                    className="flex-1"
                                />
                                <div className="relative w-24">
                                    <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        value={fee.price || ""}
                                        onChange={(e) =>
                                            handleUpdateFee(index, {
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
                                    onClick={() => handleRemoveFee(index)}
                                    className="text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Volume Discounts */}
            <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-medium">Volume Discounts</h3>
                        <p className="text-xs text-muted-foreground">
                            Offer lower rates for larger guest counts.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => onHasVolumeDiscountsChange(!hasVolumeDiscounts)}
                        className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                            hasVolumeDiscounts ? "bg-primary" : "bg-muted"
                        )}
                    >
                        <span
                            className={cn(
                                "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
                                hasVolumeDiscounts ? "translate-x-5" : "translate-x-0.5"
                            )}
                        />
                    </button>
                </div>

                {hasVolumeDiscounts && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <div className="space-y-3">
                            {volumeTiers.map((tier, index) => (
                                <div key={tier.id} className="flex gap-3 items-center">
                                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                                        If guests ≥
                                    </span>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={tier.min_guests || ""}
                                        onChange={(e) =>
                                            handleUpdateTier(index, {
                                                min_guests: parseInt(e.target.value) || 0,
                                            })
                                        }
                                        className="w-24"
                                        placeholder="e.g., 100"
                                    />
                                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                                        price is $
                                    </span>
                                    <Input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        value={tier.price_per_person || ""}
                                        onChange={(e) =>
                                            handleUpdateTier(index, {
                                                price_per_person: parseFloat(e.target.value) || 0,
                                            })
                                        }
                                        className="w-24"
                                        placeholder="New Price"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveTier(index)}
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleAddTier}
                            className="mt-3 text-primary gap-1"
                        >
                            <Plus className="h-4 w-4" />
                            Add Discount Tier
                        </Button>
                    </div>
                )}
            </div>

            {/* Global Add-ons */}
            <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <h3 className="text-sm font-medium">Optional Add-ons</h3>
                        <p className="text-xs text-muted-foreground">
                            Additional items customers can add to their booking
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddAddon}
                        className="gap-1"
                    >
                        <Plus className="h-4 w-4" />
                        Add Item
                    </Button>
                </div>

                {addons.length === 0 ? (
                    <div className="text-center py-4 bg-muted/30 rounded-lg border border-dashed">
                        <p className="text-sm text-muted-foreground">
                            No add-ons added.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {addons.map((addon, index) => (
                            <div
                                key={addon.id}
                                className="flex gap-3 items-center bg-muted/30 p-3 rounded-lg border"
                            >
                                <Input
                                    type="text"
                                    value={addon.name}
                                    onChange={(e) =>
                                        handleUpdateAddon(index, { name: e.target.value })
                                    }
                                    placeholder="Item name"
                                    className="flex-1"
                                />
                                <div className="relative w-28">
                                    <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        value={addon.price || ""}
                                        onChange={(e) =>
                                            handleUpdateAddon(index, {
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
                                    onClick={() => handleRemoveAddon(index)}
                                    className="text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PerPersonConfig;
