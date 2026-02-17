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

        // Fetch audit logs with admin names
        const { data: logs, error } = await supabase
            .from("audit_logs")
            .select(`
                *,
                admins (
                    full_name
                )
            `)
            .order("created_at", { ascending: false })
            .limit(100);

        if (error) throw error;

        // Transform for UI
        const auditLogs = logs.map((log: any) => ({
            id: log.id,
            admin_id: log.admin_id,
            admin_name: log.admins?.full_name || "Unknown Admin",
            action: log.action,
            resource_type: log.resource_type,
            resource_id: log.resource_id,
            details: log.details || {},
            ip_address: log.ip_address || "",
            created_at: log.created_at
        }));

        return NextResponse.json({ auditLogs });
    } catch (error) {
        console.error("Fetch audit logs error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
