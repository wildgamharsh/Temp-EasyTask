import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
    // 1. Verify Admin Session
    const admin = await verifyAdminSession();
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const supabase = await createClient();

        const { data: profiles, error } = await supabase
            .from("organizers")
            .select(`
                id,
                email,
                name,
                business_name,
                created_at,
                subdomain
            `)
            .order("created_at", { ascending: false });

        if (error) {
            throw error;
        }

        // Transform data for UI
        const organizers = profiles.map(profile => ({
            id: profile.id,
            name: profile.name || "Unknown",
            business_name: profile.business_name || profile.name || "N/A",
            email: profile.email,
            status: "active",
            join_date: profile.created_at,
            services_count: 0,
            subdomain: profile.subdomain || "N/A",
            total_bookings: 0, // In production, aggregate from bookings table
            total_revenue: 0   // In production, aggregate from bookings table
        }));

        return NextResponse.json({ organizers });
    } catch (error) {
        console.error("Error fetching organizers:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
