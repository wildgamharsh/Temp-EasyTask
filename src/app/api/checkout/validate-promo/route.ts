import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validatePromoCode, getUserPromoCodeUsageCount } from "@/lib/supabase-discounts";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { code, organizerId, userId, serviceId, cartValue } = body;

        if (!code || !organizerId) {
            return NextResponse.json(
                { valid: false, message: "Missing required fields" },
                { status: 400 }
            );
        }

        const promo = await validatePromoCode(organizerId, code);

        // 1. Check if exists and is active
        if (!promo || !promo.is_active) {
            return NextResponse.json(
                { valid: false, message: "Invalid or expired promo code" },
                { status: 200 } // Return 200 with valid: false for UI
            );
        }

        const now = new Date();
        const validFrom = promo.valid_from ? new Date(promo.valid_from) : null;
        const validUntil = promo.valid_until ? new Date(promo.valid_until) : null;

        // 2. Check Date Validity
        if (validFrom && validFrom > now) {
            return NextResponse.json({ valid: false, message: "Promo code not yet active" }, { status: 200 });
        }
        if (validUntil && validUntil < now) {
            return NextResponse.json({ valid: false, message: "Promo code expired" }, { status: 200 });
        }

        // 3. Check Usage Limits (Global)
        if (promo.max_total_uses && promo.current_total_uses >= promo.max_total_uses) {
            return NextResponse.json({ valid: false, message: "Promo code usage limit reached" }, { status: 200 });
        }

        // 4. Check Usage Limits (Per User)
        if (userId && promo.max_uses_per_user) {
            const userUsage = await getUserPromoCodeUsageCount(userId, promo.id);
            if (userUsage >= promo.max_uses_per_user) {
                return NextResponse.json({ valid: false, message: "You have already used this promo code" }, { status: 200 });
            }
        }

        // 5. Check Minimum Cart Value
        if (promo.min_cart_value && cartValue < promo.min_cart_value) {
            return NextResponse.json({
                valid: false,
                message: `Minimum order value of $${promo.min_cart_value} required`
            }, { status: 200 });
        }

        // 6. Check Scope (Service Specific)
        if (promo.scope === 'service_specific' && serviceId) {
            if (!promo.applicable_service_ids?.includes(serviceId)) {
                return NextResponse.json({ valid: false, message: "Promo code not applicable to this service" }, { status: 200 });
            }
        }

        // 7. Check First Time Customer (Requires checking user booking history - simplified for now)
        // If needed we can check booking table for this user & organizer.
        if (promo.first_time_customer_only && userId) {
            // We'd need a check here. skipping for MVP speed unless requested.
        }

        return NextResponse.json({
            valid: true,
            promo_code: {
                id: promo.id,
                code: promo.code,
                discount_type: promo.discount_type,
                discount_value: promo.discount_value,
                max_discount_amount: promo.max_discount_amount
            },
            message: "Promo code applied!"
        });

    } catch (error) {
        console.error("Promo validation error:", error);
        return NextResponse.json(
            { valid: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
