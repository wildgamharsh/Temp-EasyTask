/**
 * Storefront Builder - Main Page
 * Multi-step wizard for organizers to set up their storefront
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StorefrontBuilderWizard from "./StorefrontBuilderWizard";

export default async function StorefrontBuilderPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get organizer profile and settings
    // Get organizer profile and settings

    const { data: profile } = await supabase
        .from('organizers') // Changed from 'profiles' to 'organizers'
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile) {
        redirect("/dashboard");
    }

    const { data: settings } = await supabase
        .from('storefront_settings')
        .select('*')
        .eq('organizer_id', user.id)
        .single();

    return (
        <div className="h-[calc(100vh-4rem)] bg-slate-50">
            <StorefrontBuilderWizard
                profile={profile}
                initialSettings={settings}
            />
        </div>
    );
}
