import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@supabase/supabase-js";
import { createAdminToken, setAdminSession, logAdminAction } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json(
                { error: "Username and password are required" },
                { status: 400 }
            );
        }

        // 1. Resolve Username to Email (via Service Role to bypass RLS initially or public access)
        const supabaseAdmin = createAdminClient();
        const { data: adminUser, error: resolveError } = await supabaseAdmin
            .from("admins")
            .select("email, id") // Removed password_hash as it doesn't exist/isn't needed
            .eq("username", username)
            .single();

        if (resolveError || !adminUser || !adminUser.email) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Create a client for authentication (using anon key)
        const supabaseAuth = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // 2. Verify credentials with Supabase Auth using the retrieved email
        const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
            email: adminUser.email,
            password,
        });

        if (authError || !authData.user) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // 3. Verify user is actually an admin (Double check ID match)
        if (adminUser.id !== authData.user.id) {
            return NextResponse.json(
                { error: "Security Mismatch" },
                { status: 403 }
            );
        }



        // 4. Fetch full admin details for session handling
        const { data: admin, error: adminError } = await supabaseAdmin
            .from("admins")
            .select("*")
            .eq("id", authData.user.id)
            .single();

        if (adminError || !admin) {
            return NextResponse.json(
                { error: "Access denied: Not an administrator" },
                { status: 403 }
            );
        }

        // Update last login timestamp
        await supabaseAdmin
            .from("admins")
            .update({ last_login_at: new Date().toISOString() })
            .eq("id", admin.id);

        // Create session
        const token = createAdminToken(admin);
        await setAdminSession(token);

        // Log action
        await logAdminAction(admin.id, "login", "system", undefined, { ip: req.headers.get("x-forwarded-for") });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Admin login error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
