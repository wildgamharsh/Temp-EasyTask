import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
    const adminSession = await verifyAdminSession();
    if (!adminSession) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const supabase = await createClient();
        const supabaseAdmin = createAdminClient();

        // 1. Fetch all admin IDs to exclude them from the list
        // This ensures we don't show admins even if they have 'customer' role in profiles
        const { data: adminUsers } = await supabaseAdmin.from("admins").select("id");
        const adminIds = new Set(adminUsers?.map(a => a.id) || []);

        const { data: profiles, error } = await supabase
            .from("customers")
            .select(`
                id,
                email,
                name,
                created_at
            `)
            .order("created_at", { ascending: false });

        if (error) throw error;

        // 2. Filter out admins
        const filteredProfiles = profiles.filter(p => !adminIds.has(p.id));

        // Transform data for UI
        const customers = filteredProfiles.map(profile => ({
            id: profile.id,
            name: profile.name || "Unknown",
            email: profile.email,
            phone: "N/A", // Column doesn't exist in profiles table
            status: "active",
            join_date: profile.created_at,
            total_bookings: 0,
            total_spent: 0,
            last_booking_date: null
        }));

        return NextResponse.json({ customers });
    } catch (error) {
        console.error("Admin Customers API Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
