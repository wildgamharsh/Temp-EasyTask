import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await verifyAdminSession();
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const supabase = await createClient();

        // Fetch profile
        const { data: profile, error: profileError } = await supabase
            .from("customers")
            .select("*")
            .eq("id", id)
            .single();

        if (profileError) throw profileError;

        // Fetch bookings
        const { data: bookings, error: bookingsError } = await supabase
            .from("bookings")
            .select("*")
            .eq("customer_id", id)
            .order("created_at", { ascending: false });

        if (bookingsError) throw bookingsError;

        return NextResponse.json({
            customer: {
                ...profile,
                bookings: bookings || []
            }
        });
    } catch (error) {
        console.error("Error fetching customer details:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
