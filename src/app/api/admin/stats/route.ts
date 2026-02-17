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

        // 1. Get total organizers
        const { count: organizerCount, error: organizerError } = await supabase
            .from("organizers")
            .select("*", { count: "exact", head: true });

        if (organizerError) throw organizerError;

        // 2. Get total customers
        const { count: customerCount, error: customerError } = await supabase
            .from("customers")
            .select("*", { count: "exact", head: true });

        if (customerError) throw customerError;

        // 3. Get total revenue (sum of paid bookings)
        const { data: bookings, error: bookingsError } = await supabase
            .from("bookings")
            .select("total_price")
            .eq("payment_status", "paid");

        if (bookingsError) throw bookingsError;

        const totalRevenue = (bookings || []).reduce((sum, b) => sum + (b.total_price || 0), 0);

        // 4. Get active bookings (pending or confirmed)
        const { count: activeBookings, error: activeError } = await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .in("status", ["pending", "confirmed"]);

        if (activeError) throw activeError;

        return NextResponse.json({
            stats: {
                totalOrganizers: organizerCount || 0,
                totalCustomers: customerCount || 0,
                totalRevenue: totalRevenue,
                activeBookings: activeBookings || 0
            }
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
