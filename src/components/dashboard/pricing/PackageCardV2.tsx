"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    DollarSign,
    Star,
    GripVertical,
    Trash2,
    Copy,
    Plus,
    X,
    Check,
    ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ServicePackage, ServiceAddon } from "@/lib/database.types";
import { PastePreviewModal, PastePreviewItem } from "@/components/dashboard/PastePreviewModal";

interface PackageCardV2Props {
    package: ServicePackage;
    index: number;
    onUpdate: (updates: Partial<ServicePackage>) => void;
    onDelete: () => void;
    onDuplicate: () => void;
    isDragging?: boolean;
}

export function PackageCardV2({
    package: pkg,
    index,
    onUpdate,
    onDelete,
    onDuplicate,
    isDragging = false,
}: PackageCardV2Props) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [featureInput, setFeatureInput] = useState("");
    const [showAddons, setShowAddons] = useState(true); // Changed to true by default
    const [showPastePreview, setShowPastePreview] = useState(false);
    const [pasteItems, setPasteItems] = useState<PastePreviewItem[]>([]);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const descInputRef = useRef<HTMLTextAreaElement>(null);
    const featureInputRef = useRef<HTMLInputElement>(null);

    // Auto-focus when entering edit mode
    useEffect(() => {
        if (isEditingName && nameInputRef.current) {
            nameInputRef.current.focus();
            nameInputRef.current.select();
        }
    }, [isEditingName]);

    useEffect(() => {
        if (isEditingDescription && descInputRef.current) {
            descInputRef.current.focus();
            descInputRef.current.select();
        }
    }, [isEditingDescription]);

    // Handle feature addition
    const handleAddFeature = () => {
        if (featureInput.trim()) {
            onUpdate({
                features: [...pkg.features, featureInput.trim()],
            });
            setFeatureInput("");
            featureInputRef.current?.focus();
        }
    };

    const handleRemoveFeature = (index: number) => {
        onUpdate({
            features: pkg.features.filter((_, i) => i !== index),
        });
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const paste = e.clipboardData.getData("text");

        // 1. Try splitting by newline (Standard robust method)
        let parts = paste.split(/\r\n|\r|\n/).map(p => p.trim()).filter(p => p.length > 0);

        // 2. Fallback: If no newlines found, try user's "Capital Letter" heuristic
        if (parts.length === 1 && !paste.includes("\n") && !paste.includes(" ")) {
            const splitByCaps = paste.match(/[A-Z][a-z0-9]*/g);
            if (splitByCaps && splitByCaps.length > 1) {
                parts = splitByCaps;
            }
        }

        // If 5+ items detected, show preview modal
        if (parts.length >= 5) {
            e.preventDefault();
            const items: PastePreviewItem[] = parts.map(part => ({
                value: part,
                isDuplicate: pkg.features.includes(part),
            }));
            setPasteItems(items);
            setShowPastePreview(true);
            setFeatureInput("");
        } else if (parts.length > 1) {
            // For <5 items, use existing quick-add behavior
            e.preventDefault();
            const newFeatures = parts.filter(part => !pkg.features.includes(part));
            if (newFeatures.length > 0) {
                onUpdate({
                    features: [...pkg.features, ...newFeatures],
                });
                toast.success(`Added ${newFeatures.length} package features`);
            } else {
                toast.info("No new features found in paste");
            }
            setFeatureInput("");
        }
    };

    const handlePasteConfirm = (items: string[]) => {
        if (items.length > 0) {
            onUpdate({
                features: [...pkg.features, ...items],
            });
            toast.success(`Added ${items.length} features`);
        }
    };

    // Handle addon management
    const handleAddAddon = () => {
        const newAddon: ServiceAddon = {
            id: `temp-addon-${Date.now()}`,
            service_id: "",
            package_id: pkg.id,
            name: "",
            price: 0,
            is_active: true,
            created_at: new Date().toISOString(),
        };
        onUpdate({
            addons: [...(pkg.addons || []), newAddon],
        });
    };

    const handleUpdateAddon = (addonIndex: number, updates: Partial<ServiceAddon>) => {
        const newAddons = [...(pkg.addons || [])];
        newAddons[addonIndex] = { ...newAddons[addonIndex], ...updates };
        onUpdate({ addons: newAddons });
    };

    const handleRemoveAddon = (addonIndex: number) => {
        onUpdate({
            addons: (pkg.addons || []).filter((_, i) => i !== addonIndex),
        });
    };

    const hasAddons = pkg.addons && pkg.addons.length > 0;

    return (
        <div
            className={cn(
                "group relative bg-white border-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-lg",
                isDragging ? "opacity-50 scale-95" : "",
                pkg.is_popular ? "border-amber-400 ring-2 ring-amber-400/20" : "border-gray-200 hover:border-blue-300"
            )}
        >
            {/* Popular Badge */}
            {pkg.is_popular && (
                <div className="absolute -top-3 left-4 z-10">
                    <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md border-0">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Popular
                    </Badge>
                </div>
            )}

            {/* Main Content */}
            <div className="p-5 space-y-4">
                {/* Header Row */}
                <div className="flex items-start gap-3">
                    {/* Drag Handle */}
                    <button
                        type="button"
                        className="mt-2 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing transition-colors"
                        title="Drag to reorder"
                    >
                        <GripVertical className="h-5 w-5" />
                    </button>

                    {/* Name & Price */}
                    <div className="flex-1 space-y-2">
                        {/* Package Name */}
                        {isEditingName ? (
                            <Input
                                ref={nameInputRef}
                                type="text"
                                value={pkg.name}
                                onChange={(e) => onUpdate({ name: e.target.value })}
                                onBlur={() => setIsEditingName(false)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") setIsEditingName(false);
                                    if (e.key === "Escape") setIsEditingName(false);
                                }}
                                className="text-lg font-bold h-auto py-1 px-2"
                                placeholder="Package Name (e.g., Gold)"
                            />
                        ) : (
                            <h3
                                onClick={() => setIsEditingName(true)}
                                className="text-xl font-bold cursor-text hover:text-blue-600 transition-colors"
                                title="Click to edit"
                            >
                                {pkg.name || (
                                    <span className="text-muted-foreground italic">Click to add name...</span>
                                )}
                            </h3>
                        )}

                        {/* Description */}
                        {isEditingDescription ? (
                            <textarea
                                ref={descInputRef}
                                value={pkg.description || ""}
                                onChange={(e) => onUpdate({ description: e.target.value })}
                                onBlur={() => setIsEditingDescription(false)}
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") setIsEditingDescription(false);
                                }}
                                rows={2}
                                className="w-full text-sm text-muted-foreground border rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Brief description..."
                            />
                        ) : (
                            <p
                                onClick={() => setIsEditingDescription(true)}
                                className="text-sm text-gray-600 cursor-text hover:text-gray-900 transition-colors line-clamp-2"
                                title="Click to edit"
                            >
                                {pkg.description || (
                                    <span className="italic">Click to add description...</span>
                                )}
                            </p>
                        )}
                    </div>

                    {/* Price Input */}
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            type="number"
                            min={0}
                            step={0.01}
                            value={pkg.price || ""}
                            onChange={(e) => onUpdate({ price: parseFloat(e.target.value) || 0 })}
                            className="w-32 pl-8 text-lg font-bold text-right border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="0.00"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onUpdate({ is_popular: !pkg.is_popular })}
                            className={cn(
                                "h-8 w-8",
                                pkg.is_popular
                                    ? "text-amber-500 hover:text-amber-600"
                                    : "text-gray-400 hover:text-amber-500"
                            )}
                            title={pkg.is_popular ? "Remove popular badge" : "Mark as popular"}
                        >
                            <Star className={cn("h-4 w-4", pkg.is_popular && "fill-current")} />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={onDuplicate}
                            className="h-8 w-8 text-gray-400 hover:text-blue-600"
                            title="Duplicate package (Cmd+D)"
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={onDelete}
                            className="h-8 w-8 text-gray-400 hover:text-red-600"
                            title="Delete package"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Features Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Features
                        </label>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {pkg.features.length}
                        </span>
                    </div>

                    {/* Feature List */}
                    {pkg.features.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {pkg.features.map((feature, fIndex) => (
                                <div
                                    key={fIndex}
                                    className="group/feature flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-full text-sm transition-colors border border-blue-100"
                                >
                                    <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                    <span className="text-blue-900 font-medium">{feature}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFeature(fIndex)}
                                        className="ml-1 opacity-0 group-hover/feature:opacity-100 hover:text-red-600 transition-opacity"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Quick Add Feature */}
                    <div className="flex gap-2">
                        <Input
                            ref={featureInputRef}
                            type="text"
                            value={featureInput}
                            onChange={(e) => setFeatureInput(e.target.value)}
                            onPaste={handlePaste}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddFeature();
                                }
                            }}
                            placeholder="Type feature or paste list..."
                            className="flex-1 h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddFeature}
                            disabled={!featureInput.trim()}
                            className="h-9"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Add-ons Section */}
                <div className="pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => setShowAddons(!showAddons)}
                        className="flex items-center justify-between w-full text-left group/addons hover:text-blue-600 transition-colors mb-3"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider group-hover/addons:text-blue-600">
                                Package Add-ons
                            </span>
                            {hasAddons && (
                                <Badge variant="secondary" className="text-xs">
                                    {pkg.addons?.length}
                                </Badge>
                            )}
                        </div>
                        <ChevronDown
                            className={cn(
                                "h-4 w-4 text-gray-400 transition-transform",
                                showAddons && "rotate-180"
                            )}
                        />
                    </button>

                    {showAddons && (
                        <div className="space-y-2">
                            {(pkg.addons || []).length === 0 ? (
                                <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                    <p className="text-sm text-gray-500 mb-2">No add-ons yet</p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddAddon}
                                        className="text-xs"
                                    >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add First Add-on
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {(pkg.addons || []).map((addon, aIndex) => (
                                        <div key={addon.id} className="flex gap-2 items-center">
                                            <Input
                                                type="text"
                                                value={addon.name}
                                                onChange={(e) =>
                                                    handleUpdateAddon(aIndex, { name: e.target.value })
                                                }
                                                placeholder="Add-on name"
                                                className="flex-1 h-9 text-sm"
                                            />
                                            <div className="relative w-24">
                                                <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    step={0.01}
                                                    value={addon.price || ""}
                                                    onChange={(e) =>
                                                        handleUpdateAddon(aIndex, {
                                                            price: parseFloat(e.target.value) || 0,
                                                        })
                                                    }
                                                    className="pl-6 h-9 text-sm"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveAddon(aIndex)}
                                                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddAddon}
                                        className="w-full h-9 text-sm"
                                    >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add Add-on
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Paste Preview Modal */}
            <PastePreviewModal
                isOpen={showPastePreview}
                onClose={() => setShowPastePreview(false)}
                items={pasteItems}
                onConfirm={handlePasteConfirm}
                title="Add Package Features"
                type="features"
            />
        </div>
    );
}
