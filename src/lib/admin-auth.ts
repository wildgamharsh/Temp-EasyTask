import { createAdminClient } from "@/lib/supabase/admin";
import { Admin, AuditLog } from "@/lib/database.types";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "easytask_admin_token";
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "fallback-secret-for-dev-only-change-in-prod";

/**
 * Verify admin password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

/**
 * Create a session token for admin
 */
export function createAdminToken(admin: Admin): string {
    return jwt.sign(
        {
            sub: admin.id,
            email: admin.email,
            role: admin.role,
        },
        JWT_SECRET,
        { expiresIn: "12h" }
    );
}

/**
 * Validates the admin session from cookies
 */
export async function verifyAdminSession(): Promise<Admin | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const supabase = createAdminClient();

        // Optimistic check: trust token structure but verify user still exists/active
        const { data, error } = await supabase
            .from("admins")
            .select("*")
            .eq("id", decoded.sub)
            .single();

        if (error || !data) return null;

        return data as Admin;
    } catch (error) {
        return null; // Invalid token
    }
}

/**
 * Set the admin cookie
 */
export async function setAdminSession(token: string) {
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 12, // 12 hours
    });
}

/**
 * Destroy the admin session
 */
export async function destroyAdminSession() {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_COOKIE_NAME);
}

/**
 * Log admin action
 */
export async function logAdminAction(
    adminId: string,
    action: string,
    resourceType: string,
    resourceId?: string,
    details: any = {}
) {
    const supabase = createAdminClient();
    await supabase.from("audit_logs").insert({
        admin_id: adminId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details,
    });
}
