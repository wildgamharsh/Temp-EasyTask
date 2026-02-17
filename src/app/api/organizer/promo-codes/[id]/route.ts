import { NextRequest, NextResponse } from "next/server";
import {
    getPromoCode,
    updatePromoCode,
    deletePromoCode,
} from "@/lib/supabase-discounts";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/organizer/promo-codes/[id]
 * Get a specific promo code
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;
        const { id } = await params;

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const promoCode = await getPromoCode(id);

        if (!promoCode) {
            return NextResponse.json(
                { error: "Promo code not found" },
                { status: 404 }
            );
        }

        // Verify ownership
        if (promoCode.organizer_id !== userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            promo_code: promoCode,
        });
    } catch (error) {
        console.error("Error fetching promo code:", error);
        return NextResponse.json(
            { error: "Failed to fetch promo code" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/organizer/promo-codes/[id]
 * Update a specific promo code
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;
        const { id } = await params;

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Verify ownership first
        const existingPromo = await getPromoCode(id);
        if (!existingPromo) {
            return NextResponse.json(
                { error: "Promo code not found" },
                { status: 404 }
            );
        }

        if (existingPromo.organizer_id !== userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        const body = await request.json();

        // Prevent updating critical fields
        const updates = { ...body };
        delete updates.id;
        delete updates.organizer_id;
        delete updates.created_at;
        delete updates.updated_at;
        delete updates.created_by;

        const promoCode = await updatePromoCode(id, updates);

        return NextResponse.json({
            success: true,
            promo_code: promoCode,
        });
    } catch (error) {
        console.error("Error updating promo code:", error);
        return NextResponse.json(
            { error: "Failed to update promo code" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/organizer/promo-codes/[id]
 * Delete a specific promo code
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;
        const { id } = await params;

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Verify ownership first
        const existingPromo = await getPromoCode(id);
        if (!existingPromo) {
            return NextResponse.json(
                { error: "Promo code not found" },
                { status: 404 }
            );
        }

        if (existingPromo.organizer_id !== userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        const success = await deletePromoCode(id);

        if (!success) {
            return NextResponse.json(
                { error: "Failed to delete promo code" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error("Error deleting promo code:", error);
        return NextResponse.json(
            { error: "Failed to delete promo code" },
            { status: 500 }
        );
    }
}
