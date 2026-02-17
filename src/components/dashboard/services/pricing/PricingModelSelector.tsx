"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Check, Package, Clock, DollarSign } from "lucide-react";

export type PricingModel = "fixed" | "packages" | "per_person";

interface PricingModelSelectorProps {
    value: PricingModel;
    onChange: (value: PricingModel) => void;
}

export function PricingModelSelector({ value, onChange }: PricingModelSelectorProps) {
    const models = [
        {
            id: "fixed",
            label: "Fixed Price",
            description: "One simple price for the entire service.",
            icon: DollarSign,
        },
        {
            id: "packages",
            label: "Packages (Recommended)",
            description: "Good / Better / Best tiers. Proven to increase sales.",
            icon: Package,
            recommended: true,
        },
        {
            id: "per_person",
            label: "Per Person",
            description: "Price calculated based on guest count.",
            icon: Clock, // Using Clock as placeholder for Per Unit logic, often used for catering/hourly
        },
    ] as const;

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <h3 className="text-lg font-semibold text-gray-900">Choose Pricing Structure</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {models.map((model) => {
                    const isSelected = value === model.id;
                    const Icon = model.icon;

                    return (
                        <button
                            key={model.id}
                            type="button"
                            onClick={() => onChange(model.id)}
                            className={cn(
                                "relative flex flex-col items-start p-6 rounded-xl border-2 transition-all duration-200 text-left group hover:scale-[1.02]",
                                isSelected
                                    ? "border-blue-600 bg-blue-50/50 ring-4 ring-blue-500/10 shadow-lg shadow-blue-100/50"
                                    : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                            )}
                        >
                            {/* Recommended Badge */}
                            {(model as any).recommended && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                                    Recommended
                                </span>
                            )}

                            {/* Checkmark */}
                            <div
                                className={cn(
                                    "absolute top-4 right-4 h-6 w-6 rounded-full flex items-center justify-center transition-colors",
                                    isSelected
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-300 group-hover:bg-blue-100 group-hover:text-blue-400"
                                )}
                            >
                                <Check className="h-3.5 w-3.5" />
                            </div>

                            {/* Icon */}
                            <div
                                className={cn(
                                    "mb-4 p-3 rounded-lg transition-colors",
                                    isSelected
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600"
                                )}
                            >
                                <Icon className="h-6 w-6" />
                            </div>

                            <div className="space-y-1">
                                <span
                                    className={cn(
                                        "block font-bold text-gray-900",
                                        isSelected && "text-blue-700"
                                    )}
                                >
                                    {model.label}
                                </span>
                                <span className="block text-xs text-gray-500 leading-relaxed">
                                    {model.description}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
