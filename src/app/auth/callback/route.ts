import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    console.log(`[AUTH-DEBUG] Platform Callback Hit: ${request.url}`);

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            const { data: { user } } = await supabase.auth.getUser();
            console.log(`[AUTH-DEBUG] User Authenticated: ${user?.id} (${user?.email})`);

            if (user) {
                // STRICT: Organizer Context
                const { data: existingOrganizer } = await supabase
                    .from('organizers')
                    .select('id')
                    .eq('id', user.id)
                    .maybeSingle();

                if (!existingOrganizer) {
                    console.log(`[AUTH-DEBUG] Creating NEW Organizer profile for ${user.id}`);
                    const { error: insertError } = await supabase.from('organizers').upsert({
                        id: user.id,
                        email: user.email!,
                        name: user.user_metadata.full_name || user.email?.split('@')[0] || 'Organizer',
                        onboarding_completed: false
                    });
                    if (insertError) console.error(`[AUTH-DEBUG] Error creating organizer:`, insertError);
                } else {
                    console.log(`[AUTH-DEBUG] Existing Organizer found: ${existingOrganizer.id}`);
                }
            }

            // Redirect Logic
            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'
            const redirectUrl = isLocalEnv ? `${origin}${next}` : `https://${forwardedHost || 'app.easytask.ca'}${next}`;

            console.log(`[AUTH-DEBUG] Redirecting to: ${redirectUrl}`);
            return NextResponse.redirect(redirectUrl);
        } else {
            console.error(`[AUTH-DEBUG] Exchange Error:`, error);
        }
    }

    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
