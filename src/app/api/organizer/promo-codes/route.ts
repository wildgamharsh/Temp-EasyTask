import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
    getPromoCodesByOrganizer,
    createPromoCode,
    isPromoCodeUnique,
} from "@/lib/supabase-discounts";

/**
 * GET /api/organizer/promo-codes
 * Get all promo codes for the authenticated organizer
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        const userId = user.id;

        const promoCodes = await getPromoCodesByOrganizer(userId);

        return NextResponse.json({
            success: true,
            promo_codes: promoCodes,
        });
    } catch (error) {
        console.error("Error fetching promo codes:", error);
        return NextResponse.json(
            { error: "Failed to fetch promo codes" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/organizer/promo-codes
 * Create a new promo code
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        const userId = user.id;

        const body = await request.json();

        // Validate required fields
        const { code, discount_type, discount_value, scope } = body;
        if (!code || !discount_type || discount_value === undefined || !scope) {
            return NextResponse.json(
                { error: "Missing required fields: code, discount_type, discount_value, scope" },
                { status: 400 }
            );
        }

        // Check if code is unique for this organizer
        const isUnique = await isPromoCodeUnique(userId, code);
        if (!isUnique) {
            return NextResponse.json(
                { error: "This promo code already exists" },
                { status: 400 }
            );
        }

        // Create promo code
        const promoCode = await createPromoCode({
            organizer_id: userId,
            code: body.code,
            description: body.description,
            is_active: body.is_active !== undefined ? body.is_active : true,
            discount_type: body.discount_type,
            discount_value: body.discount_value,
            max_discount_amount: body.max_discount_amount,
            scope: body.scope,
            applicable_service_ids: body.applicable_service_ids,
            applicable_category_ids: body.applicable_category_ids,
            min_cart_value: body.min_cart_value,
            first_time_customer_only: body.first_time_customer_only || false,
            valid_from: body.valid_from,
            valid_until: body.valid_until,
            max_total_uses: body.max_total_uses,
            max_uses_per_user: body.max_uses_per_user,
            created_by: userId,
        });

        if (!promoCode) {
            return NextResponse.json(
                { error: "Failed to create promo code" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            promo_code: promoCode,
        });
    } catch (error) {
        console.error("Error creating promo code:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to create promo code" },
            { status: 500 }
        );
    }
}
