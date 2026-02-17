"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ServicePackage } from "@/lib/database.types";
import { Trash2, Star, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompactPackageCardProps {
    package: ServicePackage;
    onUpdate: (updates: Partial<ServicePackage>) => void;
    onDelete: () => void;
    canDelete: boolean;
}

export function CompactPackageCard({ package: pkg, onUpdate, onDelete, canDelete }: CompactPackageCardProps) {
    const [newFeature, setNewFeature] = useState("");
    const [isExpanded, setIsExpanded] = useState(true);

    const handleAddFeature = () => {
        if (!newFeature.trim()) return;
        onUpdate({ features: [...pkg.features, newFeature.trim()] });
        setNewFeature("");
    };

    const handleRemoveFeature = (index: number) => {
        onUpdate({ features: pkg.features.filter((_, i) => i !== index) });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddFeature();
        }
    };

    return (
        <div className={cn(
            "relative rounded-lg border-2 transition-all duration-200",
            pkg.is_popular
                ? "border-amber-400 bg-amber-50/30 shadow-md shadow-amber-100"
                : "border-gray-200 bg-white hover:border-blue-200"
        )}>
            {/* Popular Badge */}
            {pkg.is_popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                    Popular
                </div>
            )}

            {/* Header */}
            <div className="p-4 border-b border-gray-100 space-y-3">
                <div className="flex items-start justify-between gap-2">
                    {/* Name Input */}
                    <input
                        type="text"
                        value={pkg.name}
                        onChange={(e) => onUpdate({ name: e.target.value })}
                        placeholder="Package Name"
                        className="flex-1 text-lg font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0 placeholder:text-gray-300"
                    />

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => onUpdate({ is_popular: !pkg.is_popular })}
                            className={cn(
                                "p-1.5 rounded-md transition-colors",
                                pkg.is_popular
                                    ? "text-amber-600 bg-amber-100"
                                    : "text-gray-300 hover:text-amber-500 hover:bg-amber-50"
                            )}
                            title="Mark as Popular"
                        >
                            <Star className={cn("h-4 w-4", pkg.is_popular && "fill-current")} />
                        </button>
                        {canDelete && (
                            <button
                                type="button"
                                onClick={onDelete}
                                className="p-1.5 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="Delete Package"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Price Input */}
                <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xl">$</span>
                    <input
                        type="number"
                        value={pkg.price || ""}
                        onChange={(e) => onUpdate({ price: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        className="w-32 text-2xl font-bold text-blue-600 bg-transparent border-none focus:outline-none focus:ring-0 p-0 placeholder:text-blue-200"
                    />
                </div>
            </div>

            {/* Features Section */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">Features</h4>
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                    >
                        {isExpanded ? "Collapse" : "Expand"}
                    </button>
                </div>

                {isExpanded && (
                    <div className="space-y-2">
                        {/* Feature List */}
                        {pkg.features.length > 0 ? (
                            <ul className="space-y-1.5">
                                {pkg.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2 group">
                                        <div className="flex-1 flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded px-2 py-1.5">
                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                            <span className="flex-1">{feature}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFeature(idx)}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-gray-400 text-center py-2">No features added yet</p>
                        )}

                        {/* Add Feature Input */}
                        <div className="flex gap-2 pt-2">
                            <input
                                type="text"
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Add a feature..."
                                className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                            />
                            <Button
                                type="button"
                                onClick={handleAddFeature}
                                disabled={!newFeature.trim()}
                                size="sm"
                                variant="secondary"
                                className="px-3"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
