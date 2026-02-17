import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
    const admin = await verifyAdminSession();

    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
        admin: {
            id: admin.id,
            email: admin.email,
            name: admin.full_name,
            role: admin.role
        }
    });
}
