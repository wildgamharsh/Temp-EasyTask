import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
    getDiscount,
    updateDiscount,
    deleteDiscount,
} from "@/lib/supabase-discounts";

/**
 * GET /api/organizer/discounts/[id]
 * Get a specific discount
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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
        const { id } = await params;

        const discount = await getDiscount(id);

        if (!discount) {
            return NextResponse.json(
                { error: "Discount not found" },
                { status: 404 }
            );
        }

        // Verify ownership
        if (discount.organizer_id !== userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            discount,
        });
    } catch (error) {
        console.error("Error fetching discount:", error);
        return NextResponse.json(
            { error: "Failed to fetch discount" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/organizer/discounts/[id]
 * Update a specific discount
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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
        const { id } = await params;

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

        // Prevent updating critical fields that shouldn't change
        const updates = { ...body };
        delete updates.id;
        delete updates.organizer_id;
        delete updates.created_at;
        delete updates.updated_at;
        delete updates.created_by;

        const discount = await updateDiscount(id, updates);

        return NextResponse.json({
            success: true,
            discount,
        });
    } catch (error) {
        console.error("Error updating discount:", error);
        return NextResponse.json(
            { error: "Failed to update discount" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/organizer/discounts/[id]
 * Delete a specific discount
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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
        const { id } = await params;

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

        const success = await deleteDiscount(id);

        if (!success) {
            return NextResponse.json(
                { error: "Failed to delete discount" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error("Error deleting discount:", error);
        return NextResponse.json(
            { error: "Failed to delete discount" },
            { status: 500 }
        );
    }
}
