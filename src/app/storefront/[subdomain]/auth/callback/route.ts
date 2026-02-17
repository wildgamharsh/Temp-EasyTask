import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request, props: { params: Promise<{ subdomain: string }> }) {
    const params = await props.params;
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // Default to root of the storefront if no next param
    const next = searchParams.get('next') ?? '/'

    console.log(`[STOREFRONT-AUTH-DEBUG] Callback Hit: ${request.url}`);
    console.log(`[STOREFRONT-AUTH-DEBUG] Subdomain: ${params.subdomain}`);

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            const { data: { user } } = await supabase.auth.getUser();
            console.log(`[STOREFRONT-AUTH-DEBUG] User Authenticated: ${user?.id} (${user?.email})`);

            if (user) {
                const metadata = user.user_metadata || {};
                console.log("[STOREFRONT-AUTH-DEBUG] Full User Metadata:", JSON.stringify(metadata, null, 2));

                // 1. Resolve Organizer ID from Subdomain (Reliable Source)
                let organizerId = metadata.organizer_id;
                const subdomain = params.subdomain;

                if (!organizerId && subdomain) {
                    console.log(`[STOREFRONT-AUTH-DEBUG] Metadata missing organizer_id. Looking up via subdomain: ${subdomain}`);
                    const { data: organizer, error: orgError } = await supabase
                        .from('organizers')
                        .select('id')
                        .eq('subdomain', subdomain)
                        .maybeSingle();

                    if (organizer) {
                        organizerId = organizer.id;
                        console.log(`[STOREFRONT-AUTH-DEBUG] Resolved Organizer ID from subdomain: ${organizerId}`);
                    } else {
                        console.error(`[STOREFRONT-AUTH-DEBUG] Failed to resolve organizer from subdomain:`, orgError);
                    }
                }

                const platformOrigin = metadata.platform_origin || 'storefront'; // Default to storefront if missing in this context
                const role = metadata.role || 'customer'; // Default to customer if missing in this context

                console.log(`[STOREFRONT-AUTH-DEBUG] Effective Values - PlatformOrigin: ${platformOrigin}, Role: ${role}, OrganizerId: ${organizerId}`);

                // Logic: Ensure Customer Exists
                // We default to allowing creation if we have an organizerId and it looks like a storefront login

                if (organizerId) {
                    console.log(`[STOREFRONT-AUTH-DEBUG] Checking for existing customer with ID: ${user.id}`);
                    const { data: existingCustomer, error: fetchError } = await supabase
                        .from('customers')
                        .select('id, organizer_id')
                        .eq('id', user.id)
                        .maybeSingle();

                    if (fetchError) {
                        console.error(`[STOREFRONT-AUTH-DEBUG] Error checking existing customer:`, fetchError);
                    }

                    if (!existingCustomer) {
                        console.log(`[STOREFRONT-AUTH-DEBUG] Creating new customer record for ${user.email} linked to organizer ${organizerId}`);

                        // Name logic: Google often provides 'full_name' or 'name'
                        const name = metadata.full_name || metadata.name || user.email?.split('@')[0] || "New Customer";

                        const insertPayload = {
                            id: user.id,
                            email: user.email!,
                            name: name,
                            organizer_id: organizerId,
                            platform_origin: 'storefront'
                        };
                        console.log("[STOREFRONT-AUTH-DEBUG] Insert Payload:", JSON.stringify(insertPayload, null, 2));

                        const { error: createError } = await supabase
                            .from('customers')
                            .insert(insertPayload);

                        if (createError) {
                            console.error(`[STOREFRONT-AUTH-DEBUG] Failed to create customer record:`, JSON.stringify(createError, null, 2));
                        } else {
                            console.log(`[STOREFRONT-AUTH-DEBUG] Customer record created successfully.`);
                        }
                    } else {
                        console.log(`[STOREFRONT-AUTH-DEBUG] Customer record already exists. ID: ${existingCustomer.id}, Linked Organizer: ${existingCustomer.organizer_id}`);
                        // Optional: strict check if they are logging into a different storefront?
                        if (existingCustomer.organizer_id !== organizerId) {
                            console.warn(`[STOREFRONT-AUTH-DEBUG] WARNING: User ${user.email} is a customer of ${existingCustomer.organizer_id} but logging into ${organizerId} (Subdomain: ${subdomain})`);
                        }
                    }
                } else {
                    console.warn(`[STOREFRONT-AUTH-DEBUG] SKIPPING Customer Creation: Could not resolve organizer_id.`);
                }
            }

            // Redirect to the intended page
            // We ensure we trust the subdomain from the route params if we are on localhost/dev to ensure correct redirection
            // Use the origin from the request, but if it's localhost and we have a subdomain, construct it explicitly to be safe
            let targetOrigin = origin;

            // Fix for localhost development where origin might be lost or rewritten to localhost:3000
            if (origin.includes('localhost') && params.subdomain && !origin.includes(params.subdomain)) {
                const protocol = origin.split('://')[0];
                targetOrigin = `${protocol}://${params.subdomain}.localhost:3000`;
                console.log(`[STOREFRONT-AUTH-DEBUG] Adjusted Origin for Localhost: ${targetOrigin}`);
            }

            const redirectUrl = `${targetOrigin}${next}`;
            console.log(`[STOREFRONT-AUTH-DEBUG] Redirecting to: ${redirectUrl}`);

            return NextResponse.redirect(redirectUrl);
        } else {
            console.error(`[STOREFRONT-AUTH-DEBUG] Exchange Error:`, error);
            // Redirect to login with error
            return NextResponse.redirect(`${origin}/storefront/${params.subdomain}/login?error=auth_code_error`)
        }
    }

    return NextResponse.redirect(`${origin}/storefront/${params.subdomain}/login?error=no_code`)
}
