import { createClient } from "./supabase/client";

// ============================================================================
// TYPES
// ============================================================================

export interface Discount {
    id: string;
    organizer_id: string;
    name: string;
    description?: string;
    internal_code?: string;
    is_active: boolean;
    discount_type: 'percentage' | 'flat_amount' | 'percentage_capped' | 'free_service';
    discount_value: number;
    max_discount_amount?: number;
    scope: 'global' | 'service_specific' | 'category_specific';
    applicable_service_ids?: string[];
    applicable_category_ids?: string[];
    min_cart_value?: number;
    first_time_customer_only: boolean;
    valid_from?: string;
    valid_until?: string;
    max_total_uses?: number;
    max_uses_per_user?: number;
    current_total_uses: number;
    priority: number;
}

export interface PromoCode extends Discount {
    code: string;
}

export interface DiscountCalculation {
    originalPrice: number;
    discountAmount: number;
    finalPrice: number;
    discountApplied: Discount | PromoCode;
    savingsPercentage: number;
}

// ============================================================================
// CORE DISCOUNT ENGINE
// ============================================================================

/**
 * Get all applicable discounts for a service
 */
export async function getApplicableDiscounts(
    serviceId: string,
    organizerId: string,
    customerId?: string
): Promise<Discount[]> {
    const supabase = createClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .eq('organizer_id', organizerId)
        .eq('is_active', true)
        .or(`valid_from.is.null,valid_from.lte.${now}`)
        .or(`valid_until.is.null,valid_until.gte.${now}`)
        .order('priority', { ascending: true });

    if (error) {
        console.error('Error fetching discounts:', error);
        return [];
    }

    // Filter discounts based on scope and applicability
    const applicable = data.filter(discount => {
        // Check scope
        if (discount.scope === 'service_specific') {
            if (!discount.applicable_service_ids?.includes(serviceId)) {
                return false;
            }
        }
        // Note: category_specific would require service category info

        // Check usage limits
        if (discount.max_total_uses && discount.current_total_uses >= discount.max_total_uses) {
            return false;
        }

        // Check first-time customer restriction (if customerId provided)
        if (discount.first_time_customer_only && customerId) {
            // Would need to check if customer has previous bookings
            // For now, we'll allow it
        }

        return true;
    });

    return applicable;
}

/**
 * Calculate discount amount for a given price
 */
export function calculateDiscount(
    price: number,
    discount: Discount | PromoCode,
    guestCount: number = 1
): DiscountCalculation {
    let discountAmount = 0;
    const totalPrice = price * guestCount;

    switch (discount.discount_type) {
        case 'percentage':
            discountAmount = (totalPrice * discount.discount_value) / 100;
            if (discount.max_discount_amount) {
                discountAmount = Math.min(discountAmount, discount.max_discount_amount);
            }
            break;

        case 'flat_amount':
            discountAmount = discount.discount_value;
            break;

        case 'percentage_capped':
            discountAmount = (totalPrice * discount.discount_value) / 100;
            if (discount.max_discount_amount) {
                discountAmount = Math.min(discountAmount, discount.max_discount_amount);
            }
            break;

        case 'free_service':
            discountAmount = totalPrice;
            break;
    }

    // Ensure discount doesn't exceed total price
    discountAmount = Math.min(discountAmount, totalPrice);

    const finalPrice = totalPrice - discountAmount;
    const savingsPercentage = (discountAmount / totalPrice) * 100;

    return {
        originalPrice: totalPrice,
        discountAmount,
        finalPrice,
        discountApplied: discount,
        savingsPercentage
    };
}

/**
 * Validate and fetch a promo code
 */
export async function validatePromoCode(
    code: string,
    organizerId: string,
    serviceId: string,
    customerId?: string
): Promise<{ valid: boolean; promo?: PromoCode; error?: string }> {
    const supabase = createClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('organizer_id', organizerId)
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

    if (error || !data) {
        return { valid: false, error: 'Invalid promo code' };
    }

    // Check validity period
    if (data.valid_from && new Date(data.valid_from) > new Date(now)) {
        return { valid: false, error: 'Promo code not yet active' };
    }
    if (data.valid_until && new Date(data.valid_until) < new Date(now)) {
        return { valid: false, error: 'Promo code has expired' };
    }

    // Check usage limits
    if (data.max_total_uses && data.current_total_uses >= data.max_total_uses) {
        return { valid: false, error: 'Promo code usage limit reached' };
    }

    // Check scope
    if (data.scope === 'service_specific') {
        if (!data.applicable_service_ids?.includes(serviceId)) {
            return { valid: false, error: 'Promo code not applicable to this service' };
        }
    }

    return { valid: true, promo: data as PromoCode };
}

/**
 * Get the best discount from a list (highest savings)
 */
export function getBestDiscount(
    discounts: Discount[],
    price: number,
    guestCount: number = 1
): Discount | null {
    if (discounts.length === 0) return null;

    let bestDiscount: Discount | null = null;
    let maxSavings = 0;

    for (const discount of discounts) {
        // Check min cart value
        if (discount.min_cart_value && price * guestCount < discount.min_cart_value) {
            continue;
        }

        const calculation = calculateDiscount(price, discount, guestCount);
        if (calculation.discountAmount > maxSavings) {
            maxSavings = calculation.discountAmount;
            bestDiscount = discount;
        }
    }

    return bestDiscount;
}

/**
 * Format discount for display
 */
export function formatDiscountBadge(discount: Discount | PromoCode): string {
    switch (discount.discount_type) {
        case 'percentage':
        case 'percentage_capped':
            return `${discount.discount_value}% OFF`;
        case 'flat_amount':
            return `$${discount.discount_value} OFF`;
        case 'free_service':
            return 'FREE';
        default:
            return 'DISCOUNT';
    }
}

/**
 * Check if discount is expiring soon (within 7 days)
 */
export function isDiscountExpiringSoon(discount: Discount | PromoCode): boolean {
    if (!discount.valid_until) return false;

    const expiryDate = new Date(discount.valid_until);
    const now = new Date();
    const daysUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
}
