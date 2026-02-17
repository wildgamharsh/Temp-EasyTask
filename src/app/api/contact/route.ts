import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, subject, message, type, company, phone, size, role } = body;

        // Validation
        if (!name || !email) {
            return NextResponse.json(
                { error: "Name and email are required" },
                { status: 400 }
            );
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email address" },
                { status: 400 }
            );
        }

        // Create Supabase client with service role key (bypasses RLS)
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Insert into database
        const { data, error } = await supabase
            .from("contact_submissions")
            .insert({
                name,
                email,
                subject: subject || "General Inquiry",
                message: message || "",
                submission_type: type || "Business",
                company_name: company || null,
                phone: phone || null,
                event_size: size || null,
                role: role || null,
            })
            .select()
            .single();

        if (error) {
            console.error("Database error:", error);
            return NextResponse.json(
                { error: error.message || "Failed to submit contact form" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true, data },
            { status: 201 }
        );
    } catch (error) {
        console.error("Contact form error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
