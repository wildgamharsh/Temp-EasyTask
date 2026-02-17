import { NextRequest, NextResponse } from "next/server";
import {
    getDiscount,
    toggleDiscount,
} from "@/lib/supabase-discounts";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/organizer/discounts/[id]/toggle
 * Toggle active status of a discount
 */
export async function POST(
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
        const existingDiscount = await getDiscount(id);
        if (!existingDiscount) {
            return NextResponse.json(
                { error: "Discount not found" },
                { status: 404 }
            );
        }

        if (existingDiscount.organizer_id !== userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { isActive } = body;

        if (isActive === undefined) {
            return NextResponse.json(
                { error: "Missing required field: isActive" },
                { status: 400 }
            );
        }

        const discount = await toggleDiscount(id, isActive);

        return NextResponse.json({
            success: true,
            discount,
        });
    } catch (error) {
        console.error("Error toggling discount:", error);
        return NextResponse.json(
            { error: "Failed to toggle discount" },
            { status: 500 }
        );
    }
}
