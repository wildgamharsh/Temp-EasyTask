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
            .from("organizers")
            .select("*")
            .eq("id", id)
            .single();

        if (profileError) throw profileError;

        // Fetch services
        const { data: services, error: servicesError } = await supabase
            .from("services")
            .select("*")
            .eq("organizer_id", id);

        if (servicesError) throw servicesError;

        // Fetch recent bookings
        const { data: bookings, error: bookingsError } = await supabase
            .from("bookings")
            .select("*")
            .eq("organizer_id", id)
            .order("created_at", { ascending: false })
            .limit(10);

        if (bookingsError) throw bookingsError;

        return NextResponse.json({
            organizer: {
                ...profile,
                services: services || [],
                bookings: bookings || []
            }
        });
    } catch (error) {
        console.error("Error fetching organizer details:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
