import { NextRequest, NextResponse } from "next/server";
import { destroyAdminSession, logAdminAction, verifyAdminSession } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
    try {
        const admin = await verifyAdminSession();
        if (admin) {
            await logAdminAction(admin.id, "logout", "system");
        }
        await destroyAdminSession();

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
