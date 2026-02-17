"use client";

import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Discount, PromoCode, formatDiscountBadge, isDiscountExpiringSoon } from "@/lib/discount-engine";
import { Tag, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiscountBadgeProps {
    discount: Discount | PromoCode;
    variant?: "compact" | "full";
    className?: string;
}

export function DiscountBadge({ discount, variant = "compact", className }: DiscountBadgeProps) {
    const badgeText = formatDiscountBadge(discount);
    const isExpiring = isDiscountExpiringSoon(discount);

    if (variant === "compact") {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge
                            className={cn(
                                "bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs px-2 py-1 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all hover:scale-105",
                                isExpiring && "animate-pulse",
                                className
                            )}
                        >
                            <Tag className="h-3 w-3 mr-1" />
                            {badgeText}
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                        <div className="space-y-1">
                            <p className="font-bold">{discount.name}</p>
                            {discount.description && (
                                <p className="text-xs text-slate-400">{discount.description}</p>
                            )}
                            {discount.min_cart_value && (
                                <p className="text-xs text-slate-400">
                                    Min. purchase: ${discount.min_cart_value}
                                </p>
                            )}
                            {isExpiring && discount.valid_until && (
                                <p className="text-xs text-amber-400 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Expires {new Date(discount.valid_until).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    // Full variant with more details
    return (
        <div
            className={cn(
                "bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-3 space-y-2",
                isExpiring && "animate-pulse border-amber-400",
                className
            )}
        >
            <div className="flex items-center justify-between">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black">
                    <Tag className="h-3 w-3 mr-1" />
                    {badgeText}
                </Badge>
                {isExpiring && discount.valid_until && (
                    <span className="text-xs text-amber-600 flex items-center gap-1 font-bold">
                        <Clock className="h-3 w-3" />
                        Expires {new Date(discount.valid_until).toLocaleDateString()}
                    </span>
                )}
            </div>
            <div>
                <p className="font-bold text-sm text-slate-900">{discount.name}</p>
                {discount.description && (
                    <p className="text-xs text-slate-600 mt-1">{discount.description}</p>
                )}
            </div>
            {discount.min_cart_value && (
                <p className="text-xs text-slate-500">
                    Minimum purchase: ${discount.min_cart_value}
                </p>
            )}
        </div>
    );
}
