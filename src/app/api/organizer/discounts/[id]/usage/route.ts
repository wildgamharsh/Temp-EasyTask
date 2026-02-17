import { NextRequest, NextResponse } from "next/server";
import {
    getDiscount,
    getDiscountUsageStats,
} from "@/lib/supabase-discounts";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/organizer/discounts/[id]/usage
 * Get usage analytics for a specific discount
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

        // Verify ownership first
        const discount = await getDiscount(id);
        if (!discount) {
            return NextResponse.json(
                { error: "Discount not found" },
                { status: 404 }
            );
        }

        if (discount.organizer_id !== userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        const stats = await getDiscountUsageStats(id);

        return NextResponse.json({
            success: true,
            stats,
        });
    } catch (error) {
        console.error("Error fetching discount usage:", error);
        return NextResponse.json(
            { error: "Failed to fetch discount usage" },
            { status: 500 }
        );
    }
}
