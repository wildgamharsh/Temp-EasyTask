"use client";

import React from "react";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ServiceAddon } from "@/lib/database.types";
import { formatCAD } from "@/lib/canadian-tax";

interface AddonSelectorProps {
    addons: ServiceAddon[];
    selectedAddonIds: string[];
    onToggle: (addonId: string) => void;
    title?: string;
}

export function AddonSelector({
    addons,
    selectedAddonIds,
    onToggle,
    title = "Optional Add-ons",
}: AddonSelectorProps) {
    if (!addons || addons.length === 0) {
        return null;
    }

    // Filter only active addons
    const activeAddons = addons.filter((addon) => addon.is_active !== false);

    if (activeAddons.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            <h3 className="font-semibold text-base">{title}</h3>
            <div className="grid gap-2 sm:grid-cols-2">
                {activeAddons.map((addon) => {
                    const isSelected = selectedAddonIds.includes(addon.id);
                    return (
                        <div
                            key={addon.id}
                            onClick={() => onToggle(addon.id)}
                            className={cn(
                                "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                                "hover:border-primary/50",
                                isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-border bg-card"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        "h-5 w-5 rounded border-2 flex items-center justify-center transition-colors",
                                        isSelected
                                            ? "bg-primary border-primary text-primary-foreground"
                                            : "border-muted-foreground/30"
                                    )}
                                >
                                    {isSelected ? (
                                        <Check className="h-3 w-3" />
                                    ) : (
                                        <Plus className="h-3 w-3 text-muted-foreground/50" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-sm">{addon.name}</p>
                                    {addon.description && (
                                        <p className="text-xs text-muted-foreground">
                                            {addon.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <span className="font-semibold text-sm text-primary">
                                +{formatCAD(addon.price)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default AddonSelector;
