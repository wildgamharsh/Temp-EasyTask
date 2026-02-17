import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/admin-auth";
import { startOfDay, subDays } from "date-fns";

export async function GET(req: NextRequest) {
    const admin = await verifyAdminSession();
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const supabase = await createClient();
        const now = new Date();
        const thirtyDaysAgo = subDays(now, 30);
        const sixtyDaysAgo = subDays(now, 60);

        // --- 1. KPI Stats & Growth Calculations ---

        // A. Revenue
        const { data: currentRevenueData } = await supabase
            .from("bookings")
            .select("total_price")
            .eq("payment_status", "paid")
            .gte("created_at", thirtyDaysAgo.toISOString());

        const { data: previousRevenueData } = await supabase
            .from("bookings")
            .select("total_price")
            .eq("payment_status", "paid")
            .gte("created_at", sixtyDaysAgo.toISOString())
            .lt("created_at", thirtyDaysAgo.toISOString());

        const currentRevenue = currentRevenueData?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;
        const previousRevenue = previousRevenueData?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;

        const { data: allRevenueData } = await supabase
            .from("bookings")
            .select("total_price")
            .eq("payment_status", "paid");
        const totalRevenue = allRevenueData?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;

        // B. Organizers
        const { count: totalOrganizers } = await supabase
            .from("organizers")
            .select("*", { count: "exact", head: true });

        const { count: currentOrganizers } = await supabase
            .from("organizers")
            .select("*", { count: "exact", head: true })
            .gte("created_at", thirtyDaysAgo.toISOString());

        const { count: previousOrganizers } = await supabase
            .from("organizers")
            .select("*", { count: "exact", head: true })
            .gte("created_at", sixtyDaysAgo.toISOString())
            .lt("created_at", thirtyDaysAgo.toISOString());

        // C. Customers
        const { count: totalCustomers } = await supabase
            .from("customers")
            .select("*", { count: "exact", head: true });

        const { count: currentCustomers } = await supabase
            .from("customers")
            .select("*", { count: "exact", head: true })
            .gte("created_at", thirtyDaysAgo.toISOString());

        const { count: previousCustomers } = await supabase
            .from("customers")
            .select("*", { count: "exact", head: true })
            .gte("created_at", sixtyDaysAgo.toISOString())
            .lt("created_at", thirtyDaysAgo.toISOString());

        // D. Active Bookings
        const { count: activeBookings } = await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .in("status", ["pending", "confirmed"]);

        const { count: currentBookings } = await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .gte("created_at", thirtyDaysAgo.toISOString());

        const { count: previousBookings } = await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .gte("created_at", sixtyDaysAgo.toISOString())
            .lt("created_at", thirtyDaysAgo.toISOString());

        // Calculate Growth Percentages
        const calculateChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? "+100%" : "0%";
            const change = ((current - previous) / previous) * 100;
            return `${change > 0 ? "+" : ""}${change.toFixed(0)}%`;
        };

        // --- 2. Pending Approvals ---
        const { data: pendingApprovals } = await supabase
            .from("organizers")
            .select("id, name, email, business_name, created_at")
            .eq("is_verified", false)
            .order("created_at", { ascending: false })
            .limit(5);

        // --- 3. Recent Activity (Consolidated) ---

        // Recent Bookings
        const { data: recentBookings } = await supabase
            .from("bookings")
            .select("id, customer_name, service_name, total_price, created_at")
            .order("created_at", { ascending: false })
            .limit(5);

        // Recent Signups (Fetch both and merge)
        const { data: recentOrganizers } = await supabase
            .from("organizers")
            .select("id, name, created_at")
            .order("created_at", { ascending: false })
            .limit(5);

        const { data: recentCustomers } = await supabase
            .from("customers")
            .select("id, name, created_at")
            .order("created_at", { ascending: false })
            .limit(5);

        const recentSignups = [
            ...(recentOrganizers?.map(o => ({ ...o, role: "organizer" })) || []),
            ...(recentCustomers?.map(c => ({ ...c, role: "customer" })) || [])
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

        // Recent Reviews
        const { data: recentReviews } = await supabase
            .from("reviews")
            .select("id, rating, customer_id, created_at, customers(name)")
            .order("created_at", { ascending: false })
            .limit(5);

        // Combine Activity
        const activity = [
            ...(recentBookings || []).map((b: any) => ({
                id: b.id,
                type: "booking",
                message: `Booking: ${b.customer_name} for ${b.service_name} ($${b.total_price})`,
                timestamp: b.created_at
            })),
            ...(recentSignups || []).map((s: any) => ({
                id: s.id,
                type: s.role === "organizer" ? "organizer" : "customer",
                message: `New signup: ${s.name} (${s.role})`,
                timestamp: s.created_at
            })),
            ...(recentReviews || []).map((r: any) => ({
                id: r.id,
                type: "review",
                message: `New review: ${r.rating} stars from ${Array.isArray(r.customers) ? r.customers[0]?.name : r.customers?.name || "Guest"}`,
                timestamp: r.created_at
            }))
        ]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map(a => {
                const timeDiff = now.getTime() - new Date(a.timestamp).getTime();
                const hours = Math.floor(timeDiff / (1000 * 60 * 60));
                const minutes = Math.floor(timeDiff / (1000 * 60));

                let timeStr = "";
                if (hours > 24) timeStr = `${Math.floor(hours / 24)} days ago`;
                else if (hours > 0) timeStr = `${hours} hours ago`;
                else timeStr = `${minutes} min ago`;

                return { ...a, time: timeStr };
            })
            .slice(0, 10);

        // --- 4. Dynamic Alerts ---
        const { data: highValueRefunds } = await supabase
            .from("bookings")
            .select("id, total_price")
            .eq("payment_status", "refunded")
            .gt("total_price", 500);

        return NextResponse.json({
            stats: {
                totalRevenue: totalRevenue || 0,
                revenueChange: calculateChange(currentRevenue, previousRevenue),
                totalOrganizers: totalOrganizers || 0,
                organizerChange: calculateChange(currentOrganizers || 0, previousOrganizers || 0),
                totalCustomers: totalCustomers || 0,
                customerChange: calculateChange(currentCustomers || 0, previousCustomers || 0),
                activeBookings: activeBookings || 0,
                bookingChange: calculateChange(currentBookings || 0, previousBookings || 0),
            },
            pendingApprovals: (pendingApprovals || []).map(org => ({
                id: org.id,
                name: org.business_name || org.name || "Unknown",
                email: org.email,
                category: "Organizer", // Simplified
                location: "Canada",
                appliedAt: formatDistanceToNow(new Date(org.created_at)) + " ago"
            })),
            recentActivity: activity,
            alerts: {
                highValueRefunds: highValueRefunds?.length || 0,
                revenueMilestone: totalRevenue > 100000,
                systemHealthy: true // Can be expanded with real checks
            }
        });

    } catch (error) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

function formatDistanceToNow(date: Date) {
    const diff = new Date().getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days}d`;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours}h`;
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}m`;
}
