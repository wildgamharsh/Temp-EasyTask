import { NextRequest, NextResponse } from 'next/server';
import {
    validatePromoCode as getPromoCodeUtil, // Renamed for clarity since it fetches code
    isFirstTimeCustomer,
    getUserPromoCodeUsageCount
} from '@/lib/supabase-discounts';

interface ValidatePromoRequest {
    code: string;
    subtotal: number;
    organizerId: string;
    userId: string;
}

/**
 * POST /api/bookings/validate-promo
 * Validate promo code and calculate discount
 */
export async function POST(request: NextRequest) {
    try {
        const body: ValidatePromoRequest = await request.json();
        const { code, subtotal, organizerId, userId } = body;

        if (!code || !subtotal || !organizerId || !userId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // 1. Fetch and basic validate (expiry, total limits)
        const promoCode = await getPromoCodeUtil(organizerId, code);

        if (!promoCode) {
            return NextResponse.json({
                valid: false,
                error: 'Invalid or expired promo code',
            });
        }

        // 2. Check minimum cart value
        if (promoCode.min_cart_value && subtotal < promoCode.min_cart_value) {
            return NextResponse.json({
                valid: false,
                error: `Minimum order value of $${promoCode.min_cart_value} required`,
            });
        }

        // 3. Check first time customer
        if (promoCode.first_time_customer_only) {
            const isFirstTime = await isFirstTimeCustomer(userId, organizerId);
            if (!isFirstTime) {
                return NextResponse.json({
                    valid: false,
                    error: 'This code is for new customers only',
                });
            }
        }

        // 4. Check user usage limit
        if (promoCode.max_uses_per_user) {
            const usageCount = await getUserPromoCodeUsageCount(userId, promoCode.id);
            if (usageCount >= promoCode.max_uses_per_user) {
                return NextResponse.json({
                    valid: false,
                    error: 'You have already used this promo code',
                });
            }
        }

        // 5. Calculate discount amount
        let discountAmount = 0;
        const { discount_type, discount_value, max_discount_amount } = promoCode;

        if (discount_type === 'percentage') {
            discountAmount = (subtotal * discount_value) / 100;
            if (max_discount_amount && discountAmount > max_discount_amount) {
                discountAmount = max_discount_amount;
            }
        } else if (discount_type === 'flat_amount') {
            discountAmount = Math.min(discount_value, subtotal);
        }

        // Round to 2 decimal places
        discountAmount = Math.round(discountAmount * 100) / 100;

        const finalTotal = Math.max(0, subtotal - discountAmount);

        return NextResponse.json({
            valid: true,
            promoCode: promoCode,
            discountAmount,
            finalTotal,
            preview: {
                base_total: subtotal,
                discount_amount: discountAmount,
                final_total: finalTotal,
            },
        });
    } catch (error) {
        console.error('Promo validation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
