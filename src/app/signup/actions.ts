'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string


    // 1. Sign up the user
    // We want to capture the user object to check for email confirmation status
    const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
                phone: phone,
                role: 'organizer'
            },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
        }
    })

    if (error || !user) {
        console.error("Signup error details:", error);
        return { error: error?.message || "Failed to create account" }
    }

    // Check if email confirmation is required
    const needsEmailConfirmation = !user.email_confirmed_at;

    return {
        success: true,
        needsEmailConfirmation,
        email: user.email
    }
}
