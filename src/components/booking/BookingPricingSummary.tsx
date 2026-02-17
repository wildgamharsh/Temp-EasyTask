"use client";

import React from "react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Info } from "lucide-react";
import { formatCAD, calculateTax, CANADIAN_TAX_RATES, CanadianProvince } from "@/lib/canadian-tax";
import { ServicePackage, ServiceAddon, ServiceFixedFee, VolumeDiscountTier } from "@/lib/database.types";

interface PricingBreakdownItem {
    label: string;
    amount: number;
    type?: "base" | "addon" | "fee" | "discount" | "subtotal" | "tax" | "total";
}

interface BookingPricingSummaryProps {
    pricingModel: "fixed" | "packages" | "per_person";
    province?: CanadianProvince;
    // Fixed pricing
    basePrice?: number;
    // Package pricing
    selectedPackage?: ServicePackage | null;
    // Per-person pricing
    perPersonPrice?: number;
    guestCount?: number;
    volumeTiers?: VolumeDiscountTier[];
    fixedFees?: ServiceFixedFee[];
    // Add-ons
    selectedAddons?: ServiceAddon[];
    // Discounts
    discountAmount?: number;
    discountName?: string;
    // Callbacks
    onTotalChange?: (subtotal: number, tax: number, total: number) => void;
}

export function BookingPricingSummary({
    pricingModel,
    province,
    basePrice = 0,
    selectedPackage,
    perPersonPrice = 0,
    guestCount = 1,
    volumeTiers = [],
    fixedFees = [],
    selectedAddons = [],
    discountAmount = 0,
    discountName,
    onTotalChange,
}: BookingPricingSummaryProps) {
    // Calculate breakdown items
    const breakdown: PricingBreakdownItem[] = [];
    let subtotal = 0;

    // Base pricing based on model
    switch (pricingModel) {
        case "fixed":
            subtotal = basePrice;
            breakdown.push({
                label: "Base Price",
                amount: basePrice,
                type: "base",
            });
            break;

        case "packages":
            if (selectedPackage) {
                subtotal = selectedPackage.price;
                breakdown.push({
                    label: selectedPackage.name,
                    amount: selectedPackage.price,
                    type: "base",
                });
            }
            break;

        case "per_person":
            // Check if volume discount applies
            let effectivePrice = perPersonPrice;
            let appliedTier: VolumeDiscountTier | null = null;

            if (volumeTiers.length > 0) {
                const sortedTiers = [...volumeTiers].sort(
                    (a, b) => b.min_guests - a.min_guests
                );
                for (const tier of sortedTiers) {
                    if (guestCount >= tier.min_guests) {
                        effectivePrice = tier.price_per_person;
                        appliedTier = tier;
                        break;
                    }
                }
            }

            const guestTotal = effectivePrice * guestCount;
            subtotal = guestTotal;
            breakdown.push({
                label: `${guestCount} guests × ${formatCAD(effectivePrice)}`,
                amount: guestTotal,
                type: "base",
            });

            if (appliedTier) {
                breakdown.push({
                    label: `Volume discount (${appliedTier.min_guests}+ guests)`,
                    amount: 0, // Info only
                    type: "discount",
                });
            }

            // Add fixed fees
            for (const fee of fixedFees.filter((f) => f.is_active !== false)) {
                subtotal += fee.price;
                breakdown.push({
                    label: fee.name,
                    amount: fee.price,
                    type: "fee",
                });
            }
            break;
    }

    // Add selected add-ons
    for (const addon of selectedAddons) {
        subtotal += addon.price;
        breakdown.push({
            label: addon.name,
            amount: addon.price,
            type: "addon",
        });
    }

    // Apply discount
    const afterDiscount = Math.max(0, subtotal - discountAmount);

    // Calculate tax
    let taxAmount = 0;
    let taxLabel = "";
    let total = afterDiscount;

    if (province && CANADIAN_TAX_RATES[province]) {
        const taxResult = calculateTax(afterDiscount, province);
        taxAmount = taxResult.taxAmount;
        total = taxResult.total;
        taxLabel = CANADIAN_TAX_RATES[province].name;
    }

    // Notify parent of total changes
    React.useEffect(() => {
        if (onTotalChange) {
            onTotalChange(afterDiscount, taxAmount, total);
        }
    }, [afterDiscount, taxAmount, total, onTotalChange]);

    return (
        <div className="space-y-4 text-sm">
            {/* Breakdown Items */}
            {breakdown.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                    <span
                        className={
                            item.type === "discount"
                                ? "text-green-600 flex items-center gap-1"
                                : "text-muted-foreground"
                        }
                    >
                        {item.type === "addon" && "+ "}
                        {item.type === "fee" && "+ "}
                        {item.label}
                    </span>
                    {item.amount > 0 && (
                        <span
                            className={
                                item.type === "discount"
                                    ? "text-green-600"
                                    : item.type === "addon" || item.type === "fee"
                                        ? "text-muted-foreground"
                                        : ""
                            }
                        >
                            {formatCAD(item.amount)}
                        </span>
                    )}
                </div>
            ))}

            {/* Discount (if applied) */}
            {discountAmount > 0 && (
                <>
                    <Separator />
                    <div className="flex justify-between items-center text-green-600">
                        <span className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            {discountName || "Discount"}
                        </span>
                        <span>-{formatCAD(discountAmount)}</span>
                    </div>
                </>
            )}

            <Separator />

            {/* Subtotal with original price if discount applied */}
            {discountAmount > 0 ? (
                <>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Original Price</span>
                        <span className="line-through text-muted-foreground">{formatCAD(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center font-semibold text-emerald-600">
                        <span>Discounted Price</span>
                        <span>{formatCAD(afterDiscount)}</span>
                    </div>
                </>
            ) : (
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCAD(afterDiscount)}</span>
                </div>
            )}

            {/* Tax */}
            {province ? (
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1">
                        {taxLabel}
                        <Badge variant="outline" className="text-xs py-0">
                            {(CANADIAN_TAX_RATES[province].rate * 100).toFixed(0)}%
                        </Badge>
                    </span>
                    <span>{formatCAD(taxAmount)}</span>
                </div>
            ) : (
                <div className="flex items-center gap-2 text-amber-600 text-xs">
                    <Info className="h-3 w-3" />
                    <span>Tax will be calculated based on service location</span>
                </div>
            )}

            <Separator />

            {/* Total */}
            <div className="flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatCAD(total)}</span>
            </div>

            {/* Tax Note */}
            {province && (
                <p className="text-xs text-muted-foreground text-center">
                    All prices in CAD. Tax calculated for {province}.
                </p>
            )}
        </div>
    );
}

export default BookingPricingSummary;
