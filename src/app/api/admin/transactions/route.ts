import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
    const admin = await verifyAdminSession();
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const supabase = await createClient();

        // Fetch all bookings as transactions
        const { data: bookings, error } = await supabase
            .from("bookings")
            .select(`
                id,
                created_at,
                total_price,
                status,
                service_name,
                customer_name,
                payment_status
            `)
            .order("created_at", { ascending: false })
            .limit(50);

        if (error) throw error;

        // Transform for UI
        const transactions = bookings.map(booking => ({
            id: booking.id,
            date: booking.created_at,
            amount: booking.total_price || 0,
            status: booking.status,
            service_name: booking.service_name || "Unknown Service",
            customer_name: booking.customer_name || "Unknown Customer",
            payment_method: "stripe" // Most bookings are stripe-based
        }));

        return NextResponse.json({ transactions });
    } catch (error) {
        console.error("Fetch transactions error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
