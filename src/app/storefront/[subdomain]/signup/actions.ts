"use server";

import { createClient } from "@/lib/supabase/server";
import { getOrganizerBySubdomain } from "@/lib/supabase-data";

export async function storefrontSignup(formData: FormData, subdomain: string) {
    const supabase = await createClient();
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    // 0. Fetch organizer ID to link customer
    const organizer = await getOrganizerBySubdomain(subdomain);
    if (!organizer) {
        return { error: "Organizer not found" };
    }

    // 1. Sign up the user with email confirmation
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
                role: 'customer',
                organizer_id: organizer.id
            },
            emailRedirectTo: `${origin}/auth/callback?next=/storefront/${subdomain}`
        }
    });

    if (signUpError || !user) {
        console.error("Storefront signup error:", signUpError);
        return { error: signUpError?.message || "Failed to create account" };
    }

    // Check if email confirmation is required
    // If email_confirmed_at is null, user needs to verify email
    const needsEmailConfirmation = !user.email_confirmed_at;

    // Don't create profile here - let the callback handle it after email confirmation
    // This ensures users must verify their email before accessing the platform

    return {
        success: true,
        needsEmailConfirmation,
        email: user.email
    };
}
