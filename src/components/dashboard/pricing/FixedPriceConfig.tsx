"use client";

import React from "react";
import { DollarSign, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ServiceAddon } from "@/lib/database.types";

interface FixedPriceConfigProps {
    basePrice: number;
    addons: ServiceAddon[];
    onBasePriceChange: (price: number) => void;
    onAddonsChange: (addons: ServiceAddon[]) => void;
    errors?: Record<string, string>;
}

export function FixedPriceConfig({
    basePrice,
    addons,
    onBasePriceChange,
    onAddonsChange,
    errors = {},
}: FixedPriceConfigProps) {
    // Add a new addon
    const handleAddAddon = () => {
        const newAddon: ServiceAddon = {
            id: `temp-${Date.now()}`,
            service_id: "",
            name: "",
            price: 0,
            is_active: true,
            created_at: new Date().toISOString(),
        };
        onAddonsChange([...addons, newAddon]);
    };

    // Update an addon
    const handleUpdateAddon = (index: number, updates: Partial<ServiceAddon>) => {
        const updated = [...addons];
        updated[index] = { ...updated[index], ...updates };
        onAddonsChange(updated);
    };

    // Remove an addon
    const handleRemoveAddon = (index: number) => {
        onAddonsChange(addons.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6">
            {/* Base Price */}
            <div>
                <Label htmlFor="basePrice" className="mb-2 block">
                    Base Price (Tax Exclusive)
                </Label>
                <div className="relative max-w-xs">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="basePrice"
                        type="number"
                        min={0}
                        step={0.01}
                        value={basePrice || ""}
                        onChange={(e) => onBasePriceChange(parseFloat(e.target.value) || 0)}
                        className="pl-10 text-lg font-semibold"
                        placeholder="0.00"
                    />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Enter the price before taxes.
                </p>
                {errors.basePrice && (
                    <p className="text-sm text-destructive mt-1">{errors.basePrice}</p>
                )}
            </div>

            {/* Flat-Fee Add-ons */}
            <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <h3 className="text-sm font-medium">Flat-Fee Add-ons</h3>
                        <p className="text-xs text-muted-foreground">
                            Optional extras customers can add to their booking
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
                    <div className="text-center py-6 bg-muted/30 rounded-lg border border-dashed">
                        <p className="text-sm text-muted-foreground">
                            No add-ons added yet. Click &quot;Add Item&quot; to create one.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
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
                                    placeholder="Item name (e.g., Extra Setup)"
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
                                        placeholder="0.00"
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

export default FixedPriceConfig;
