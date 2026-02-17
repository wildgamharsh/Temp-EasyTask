import { Discount } from "@/lib/database.types";

export interface PricingResult {
    originalPrice: number;
    finalPrice: number;
    discountAmount: number;
    isDiscounted: boolean;
    appliedDiscount?: Discount;
}

/**
 * Calculates the best available price for a service given a list of active discounts.
 * 
 * Rules:
 * - Checks eligibility (scope, service_id, category_id)
 * - Checks constraints (min_cart_value, time window)
 * - Selects the discount that offers the lowest final price
 * - Handles percentage caps (max_discount_amount)
 */
export function calculateEffectivePrice(
    originalPrice: number,
    activeDiscounts: Discount[],
    serviceId: string,
    categoryName?: string
): PricingResult {
    let bestPrice = originalPrice;
    let bestDiscount: Discount | undefined = undefined;

    for (const discount of activeDiscounts) {
        // 1. Check Scope Eligibility
        const isEligible = checkEligibility(discount, serviceId, categoryName);
        if (!isEligible) continue;

        // 2. Check Time Validity (extra check, though fetched discounts should be active)
        const now = new Date();
        if (discount.valid_from && new Date(discount.valid_from) > now) continue;
        if (discount.valid_until && new Date(discount.valid_until) < now) continue;

        // 3. check min_cart_value (Assuming service price as cart value for single display)
        if (discount.min_cart_value && originalPrice < discount.min_cart_value) continue;

        // 4. Calculate Potential Price
        let potentialPrice = originalPrice;
        let discountAmount = 0;

        if (discount.discount_type === "percentage") {
            discountAmount = (originalPrice * discount.discount_value) / 100;
            // Apply cap if exists
            if (discount.max_discount_amount && discountAmount > discount.max_discount_amount) {
                discountAmount = discount.max_discount_amount;
            }
        } else if (discount.discount_type === "flat_amount") {
            discountAmount = discount.discount_value;
        } else if (discount.discount_type === "free_service") {
            discountAmount = originalPrice;
        }

        potentialPrice = Math.max(0, originalPrice - discountAmount); // No negative prices

        // 5. Compare with current best
        if (potentialPrice < bestPrice) {
            bestPrice = potentialPrice;
            bestDiscount = discount;
        }
    }

    return {
        originalPrice,
        finalPrice: bestPrice,
        discountAmount: originalPrice - bestPrice,
        isDiscounted: bestDiscount !== undefined,
        appliedDiscount: bestDiscount,
    };
}

function checkEligibility(discount: Discount, serviceId: string, categoryName?: string): boolean {
    if (discount.scope === "global") return true;

    if (discount.scope === "service_specific") {
        return discount.applicable_service_ids?.includes(serviceId) ?? false;
    }

    if (discount.scope === "category_specific") {
        // Assuming category match is case-insensitive if needed, or exact match
        return categoryName ? (discount.applicable_category_ids?.includes(categoryName) ?? false) : false;
    }

    return false;
}
