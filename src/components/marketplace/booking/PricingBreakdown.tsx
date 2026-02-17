"use client";

import { BookingPricingBreakdown } from "@/lib/database.types";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Tag, Users, Package as PackageIcon, Info } from "lucide-react";

interface PricingBreakdownProps {
    breakdown: BookingPricingBreakdown;
    pricingModel: "fixed" | "packages" | "per_person" | "configured";
    guestCount?: number;
    provinceName?: string;
    className?: string;
    showTotalCard?: boolean;
    discountAmount?: number;
    theme?: "light" | "dark"; // Add theme prop
    appliedDiscount?: {
        type: 'discount' | 'promo_code';
        name: string;
        discount_type: 'percentage' | 'flat_amount' | 'percentage_capped';
        discount_value: number;
    } | null;
    isQuoteMode?: boolean;
}

export function PricingBreakdown({
    breakdown,
    pricingModel,
    guestCount = 1,
    provinceName,
    className,
    showTotalCard = false,
    discountAmount = 0,
    theme = "light", // Destructure theme with default value
    appliedDiscount,
    isQuoteMode = false
}: PricingBreakdownProps) {
    if (!breakdown) return null;

    const formatPrice = (price: number) =>
        "$" + price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const isDark = theme === "dark";
    const textMuted = isDark ? "text-blue-100" : "text-slate-600";
    const textMain = isDark ? "text-white" : "text-slate-900";
    const textLabel = isDark ? "text-blue-200" : "text-slate-400";
    const borderCol = isDark ? "border-white/10" : "border-slate-100";
    const separatorCol = isDark ? "bg-white/20" : "bg-slate-200";

    if (isQuoteMode) {
        return (
            <div className={cn("space-y-4", className)}>
                {/* Simplified Quote View */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className={cn(textMuted, "font-medium")}>Service Type</span>
                        <span className={cn(textMain, "font-bold")}>
                            {pricingModel === 'packages' ? breakdown.package_name :
                                pricingModel === 'per_person' ? 'Per Person Rate' : 'Standard Service'}
                        </span>
                    </div>
                </div>

                {/* Add-ons List */}
                {breakdown.addons && breakdown.addons.length > 0 && (
                    <div className={cn("space-y-2 pt-2 border-t", borderCol)}>
                        <span className={cn("text-[10px] font-bold uppercase tracking-widest block mb-1", textLabel)}>
                            Selected Options
                        </span>
                        {breakdown.addons.map((addon, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                                <span className={cn(textMuted, "font-medium flex items-center gap-2")}>
                                    <div className={cn("h-1.5 w-1.5 rounded-full", isDark ? "bg-white/40" : "bg-primary/40")} />
                                    {addon.name}
                                </span>
                                <span className={cn(textMain, "font-bold text-xs opacity-70")}>Included</span>
                            </div>
                        ))}
                    </div>
                )}

                {showTotalCard && (
                    <div className={cn("rounded-2xl p-6 mt-4 flex justify-between items-center shadow-xl", isDark ? "bg-white/10 ring-1 ring-white/20" : "bg-slate-900 shadow-slate-200/50")}>
                        <div className="flex flex-col">
                            <span className={cn("text-[10px] font-black uppercase tracking-[0.3em]", isDark ? "text-blue-200" : "text-slate-400")}>Quote Status</span>
                            <span className={cn("text-xl font-black tracking-tighter", isDark ? "text-white" : "text-white")}>
                                Pending Review
                            </span>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className={cn("space-y-4", className)}>
            {/* 1. Base Cost / Package Section */}
            <div className="space-y-3">
                {pricingModel === "fixed" && (breakdown.subtotal - (breakdown.addons?.reduce((sum, a) => sum + a.price, 0) || 0)) > 0 && (
                    <div className="flex justify-between items-center text-sm">
                        <span className={cn(textMuted, "font-medium")}>Base Service Price</span>
                        <span className={cn(textMain, "font-bold")}>
                            {formatPrice(breakdown.subtotal - (breakdown.addons?.reduce((sum, a) => sum + a.price, 0) || 0))}
                        </span>
                    </div>
                )}

                {pricingModel === "packages" && (
                    <div className="flex justify-between items-center text-sm">
                        <span className={cn(textMuted, "font-medium flex items-center gap-2")}>
                            <PackageIcon className={cn("h-4 w-4", isDark ? "text-white/60" : "text-primary/60")} />
                            {breakdown.package_name || "Selected Package"}
                        </span>
                        <span className={cn(textMain, "font-bold")}>{formatPrice(breakdown.package_price || 0)}</span>
                    </div>
                )}

                {pricingModel === "per_person" && breakdown.price_per_person != null && (
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className={cn(textMuted, "font-medium")}>Base Price (per person)</span>
                            <span className={cn(textMain, "font-bold")}>{formatPrice(breakdown.price_per_person)}</span>
                        </div>
                        <div className={cn("flex justify-between items-center text-sm pl-4 border-l-2 py-2 px-3 rounded-r-lg", isDark ? "border-white/40 bg-white/10" : "border-primary/20 bg-primary/5")}>
                            <span className={cn("font-semibold flex items-center gap-2", isDark ? "text-white" : "text-primary")}>
                                <Users className="h-4 w-4" />
                                {breakdown.guest_count || guestCount} persons :
                            </span>
                            <span className={cn("font-black", textMain)}>{formatPrice(breakdown.price_per_person * (breakdown.guest_count || guestCount))}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Add-ons Section */}
            {breakdown.addons && breakdown.addons.length > 0 && (
                <div className={cn("space-y-2 pt-2 border-t", borderCol)}>
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest block mb-1", textLabel)}>
                        {pricingModel === 'configured' ? 'Service Breakdown' : 'Selected Enhancements'}
                    </span>
                    {breakdown.addons.map((addon, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                            <span className={cn(textMuted, "font-medium flex items-center gap-2")}>
                                <div className={cn("h-1.5 w-1.5 rounded-full", isDark ? "bg-white/40" : "bg-primary/40")} />
                                {addon.name}
                            </span>
                            <span className={cn(textMain, "font-bold")}>+ {formatPrice(addon.price)}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* 2b. Fixed Fees Section */}
            {((breakdown.fixed_fees && breakdown.fixed_fees.length > 0) || (breakdown.fixed_charges && breakdown.fixed_charges.length > 0)) && (
                <div className={cn("space-y-2 pt-2 border-t", borderCol)}>
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest block mb-1", textLabel)}>Fixed Service Charges</span>
                    {(breakdown.fixed_fees || breakdown.fixed_charges || []).map((fee, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                            <span className={cn(textMuted, "font-medium flex items-center gap-2")}>
                                <div className={cn("h-1.5 w-1.5 rounded-full", isDark ? "bg-white/40" : "bg-primary/40")} />
                                {fee.name}
                            </span>
                            <span className={cn(textMain, "font-bold")}>+ {formatPrice(fee.price)}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* 3. Subtotal (before discount) */}
            <Separator className={cn("my-3", isDark ? "bg-white/10" : "")} />
            <div className="flex justify-between items-center text-sm font-semibold">
                <span className={isDark ? "text-blue-100" : "text-slate-700"}>Subtotal</span>
                <span className={textMain}>{formatPrice(breakdown.subtotal)}</span>
            </div>

            {/* 4. Discount (if applied) */}
            {discountAmount > 0 && (
                <>
                    <div className={cn("flex flex-col gap-2 py-3 px-4 rounded-xl border-2", isDark ? "bg-white/5 border-white/20 text-white" : "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200")}>
                        <div className="flex justify-between items-center">
                            <span className={cn("flex items-center gap-2 text-sm font-bold", isDark ? "text-white" : "text-emerald-800")}>
                                <Tag className="h-4 w-4" />
                                {appliedDiscount?.type === 'promo_code' ? 'Promo Code' : 'Discount'} Applied
                            </span>
                            <span className={cn("text-sm font-black", isDark ? "text-white" : "text-emerald-700")}>- {formatPrice(discountAmount)}</span>
                        </div>
                        {appliedDiscount && (
                            <div className="flex items-center justify-between text-xs">
                                <span className={isDark ? "text-blue-100" : "text-emerald-700 font-medium"}>
                                    {appliedDiscount.name}
                                    {appliedDiscount.discount_type === 'percentage' && ` (${appliedDiscount.discount_value}% off)`}
                                    {appliedDiscount.discount_type === 'flat_amount' && ` ($${appliedDiscount.discount_value} off)`}
                                    {appliedDiscount.discount_type === 'percentage_capped' && ` (${appliedDiscount.discount_value}% off, capped)`}
                                </span>
                                {appliedDiscount.type === 'promo_code' && (
                                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider", isDark ? "bg-white text-blue-900" : "bg-emerald-600 text-white")}>
                                        Code
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <Separator className={cn("my-3", isDark ? "bg-white/10" : "")} />
                    <div className="flex justify-between items-center text-sm font-semibold">
                        <span className={isDark ? "text-blue-100" : "text-slate-700"}>Subtotal after discount</span>
                        <span className={textMain}>{formatPrice(breakdown.subtotal - discountAmount)}</span>
                    </div>
                </>
            )}

            {/* 6. Final Total */}
            {showTotalCard ? (
                <div className={cn("rounded-2xl p-6 mt-4 flex justify-between items-center shadow-xl", isDark ? "bg-white/10 ring-1 ring-white/20" : "bg-slate-900 shadow-slate-200/50")}>
                    <div className="flex flex-col">
                        <span className={cn("text-[10px] font-black uppercase tracking-[0.3em]", isDark ? "text-blue-200" : "text-slate-400")}>Total</span>
                        <span className={cn("text-3xl font-black tracking-tighter", isDark ? "text-white" : "text-white")}>
                            {formatPrice(breakdown.total_amount || breakdown.total)}
                            <span className={cn("text-xs font-bold ml-2 uppercase tracking-widest", isDark ? "text-white/60" : "text-slate-500")}>CAD</span>
                        </span>
                    </div>
                    <div className="text-right">
                        <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ring-1", isDark ? "bg-white/20 text-white ring-white/30" : "bg-primary/20 text-primary-foreground ring-primary/30")}>
                            <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", isDark ? "bg-white" : "bg-primary")} />
                            Secure Pay
                        </div>
                    </div>
                </div>
            ) : (
                <div className={cn("flex justify-between items-center pt-4 border-t-2 border-dotted mt-2", isDark ? "border-white/40" : "border-slate-900")}>
                    <span className={cn("text-lg font-black uppercase tracking-tighter", textMain)}>Total</span>
                    <span className={cn("text-2xl font-black tracking-tighter", isDark ? "text-white" : "text-primary")}>{formatPrice(breakdown.total_amount || breakdown.total)}</span>
                </div>
            )}
        </div>
    );
}
