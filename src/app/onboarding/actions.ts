/**
 * Server Actions for Onboarding
 * Updates organizer profile with business details
 */

"use server";

import { createClient } from "@/lib/supabase/server";

export interface OnboardingData {
    name: string;
    role?: "customer" | "organizer";
    businessName?: string;
    subdomain?: string;
    phone?: string;
}

export async function completeOnboarding(data: OnboardingData) {
    try {
        const supabase = await createClient();

        // 1. Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                success: false,
                error: "Not authenticated. Please sign in first.",
                redirectTo: "/login"
            };
        }

        const userId = user.id;
        const businessName = data.businessName;
        const subdomain = data.subdomain?.toLowerCase();

        // 2. Validate Organizer Data
        if (!businessName || businessName.length < 2) {
            return {
                success: false,
                error: "Business name is required",
                redirectTo: null
            };
        }

        if (!subdomain || subdomain.length < 3) {
            return {
                success: false,
                error: "Subdomain is required and must be at least 3 characters",
                redirectTo: null
            };
        }

        // Check if subdomain is taken (double check)
        const { data: existing } = await supabase
            .from('organizers')
            .select('id')
            .eq('subdomain', subdomain)
            .neq('id', userId)
            .single();

        if (existing) {
            return {
                success: false,
                error: "This subdomain is already taken. Please choose another.",
                redirectTo: null
            };
        }

        // 3. Prepare Organizer Profile Updates (or Insert)
        const organizerData: any = {
            id: userId, // Required for upsert
            email: user.email,
            name: data.name,
            business_name: businessName,
            subdomain: subdomain,
            phone: data.phone, // Adding phone
            storefront_enabled: false, // Wait for publish to enable
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
        };

        // 4. Update/Insert Organizer
        const { error: updateError } = await supabase
            .from('organizers')
            .upsert(organizerData)
            .select();

        if (updateError) {
            console.error('Error updating organizer profile:', updateError);
            return {
                success: false,
                error: `Failed to create organizer profile: ${updateError.message}`,
                redirectTo: null
            };
        }

        // 5. Create Default Storefront Settings
        const { data: existingSettings } = await supabase
            .from('storefront_settings')
            .select('id')
            .eq('organizer_id', userId)
            .single();

        if (!existingSettings) {
            const { error: settingsError } = await supabase
                .from('storefront_settings')
                .insert({
                    organizer_id: userId,
                    business_name: businessName,
                    tagline: 'Creating memorable experiences',
                    template: 'variant-claude-sonnet-4', // Default template
                    theme_colors: {
                        primary: '#8b5cf6',
                        secondary: '#d946ef',
                        accent: '#f59e0b',
                        background: '#ffffff',
                        text: '#1f2937',
                        muted: '#6b7280'
                    },
                    show_hero: true,
                    show_about: true,
                    show_services: true,
                    show_testimonials: true,
                    show_gallery: true,
                    show_contact: true,
                });

            if (settingsError) {
                console.error('Error creating storefront settings:', settingsError);
            }
        }

        return {
            success: true,
            redirectTo: '/dashboard'
        };

    } catch (error) {
        console.error('Unexpected error in completeOnboarding:', error);
        return {
            success: false,
            error: "An unexpected error occurred",
            redirectTo: null
        };
    }
}
