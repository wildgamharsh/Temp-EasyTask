import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
    const hostname = request.headers.get("host") || "";
    const subdomain = getSubdomain(hostname);
    const { pathname } = request.nextUrl;

    // 1. Admin System Routing (Highest Priority)
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
        // Keep existing admin logic
        if (isAdminPublicRoute(pathname)) {
            return NextResponse.next();
        }
        const adminToken = request.cookies.get("zaaro_admin_token")?.value;
        if (!adminToken) {
            if (pathname.startsWith("/api/")) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            const loginUrl = new URL("/admin/login", request.url);
            return NextResponse.redirect(loginUrl);
        }
        return NextResponse.next();
    }

    // 2. Global Session Update (Critical for Auth State)
    // Runs for ALL requests including storefronts to refresh tokens
    const { supabase, response, user } = await updateSession(request);

    // 3. Storefront Subdomain Routing (Rewrite Logic)
    if (subdomain) {
        // If authenticated on storefront, basic check (optional: enforce they are a customer)
        if (user) {
            // We can allow any user to view storefront, usually fine.
            // Or strictly check if they are in customers table if we want to block "Organizer-only" accounts?
            // For now, allow access.
        }
        return handleStorefrontRequest(request, subdomain, response);
    }

    // 4. Protected Routes Logic (Platform)
    const isPublic = isPublicRoute(pathname);
    const isAuthRoute = pathname === "/login" || pathname === "/signup";
    const isOnboardingRoute = pathname === "/onboarding";

    // Scenario A: Unauthenticated User
    if (!user) {
        if (!isPublic) {
            // Handle API routes separately
            if (pathname.startsWith("/api/")) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            // Redirect to login
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("next", pathname);
            return redirectWithCookies(loginUrl, response);
        }
        return response;
    }

    // Scenario B: Authenticated User on Platform
    if (user) {
        // Check if user is an Organizer
        const { data: organizer } = await supabase
            .from('organizers')
            .select('id, onboarding_completed')
            .eq('id', user.id)
            .maybeSingle();

        if (isAuthRoute) {
            if (organizer) {
                // Organizer trying to login again -> Dashboard
                return redirectWithCookies(new URL("/dashboard", request.url), response);
            } else {
                // Not an organizer (must be a customer).
                // They shouldn't be on Platform Login. Redirect to Home.
                return redirectWithCookies(new URL("/", request.url), response);
            }
        }

        if (organizer) {
            // Organizer Logic
            if (!organizer.onboarding_completed && !isOnboardingRoute && !pathname.startsWith("/api")) {
                return redirectWithCookies(new URL("/onboarding", request.url), response);
            }
        } else {
            // Not an organizer (Customer or New User?)
            // If trying to access Dashboard -> Block
            if (pathname.startsWith("/dashboard")) {
                return redirectWithCookies(new URL("/", request.url), response);
            }

            // If strictly customer, maybe we should redirect them to their last visited storefront?
            // Hard to know. For now, Home is safe.
        }
    }

    return response;
}

// --- Helper Functions ---

const isAdminPublicRoute = (path: string) => path === "/admin/login" || path.startsWith("/api/admin/auth");

/**
 * Creates a redirect response that preserves cookies from an existing response.
 * This is crucial for Supabase auth, as `updateSession` might set new cookies (token refresh),
 * and a standard NextResponse.redirect() would drop them, breaking the session.
 */
function redirectWithCookies(url: URL, sourceResponse: NextResponse) {
    const newResponse = NextResponse.redirect(url);

    // Copy all cookies from the source response (which contains any auth updates)
    const cookies = sourceResponse.cookies.getAll();
    cookies.forEach(cookie => {
        newResponse.cookies.set(cookie.name, cookie.value, cookie);
    });

    return newResponse;
}

function isPublicRoute(path: string) {
    if (path === "/" || path === "/about" || path === "/how-it-works" || path === "/privacy" || path === "/privacy-policy" || path === "/terms" || path === "/terms-and-conditions" || path === "/our-team" || path === "/pricing") return true;
    if (path.startsWith("/login") || path.startsWith("/signup")) return true;
    if (path.startsWith("/auth/callback")) return true;
    if (path.startsWith("/storefront")) return true;
    if (path.startsWith("/api/public") || path.startsWith("/api/checkout/calculate-price") || path.startsWith("/api/contact")) return true;
    if (path.startsWith("/services")) return true;
    if (path.startsWith("/organizers")) return true;
    if (path.startsWith("/tools")) return true;
    // APIs that don't require auth? (Be careful)
    return false;
}

function getSubdomain(hostname: string): string | null {
    const host = hostname.split(":")[0];
    const parts = host.split(".");
    // Handle localhost case: subdomain.localhost
    if (host.includes("localhost")) {
        if (parts.length === 2 && parts[1] === "localhost" && parts[0] !== "www") {
            return parts[0];
        }
        return null;
    }
    // Handle production/preview domains
    if (parts.length >= 3) {
        if (host.endsWith("vercel.app")) {
            // project-name.vercel.app -> no subdomain usually
            return null;
        }
        // e.g. subdomain.domain.com
        if (parts[0] !== "www") return parts[0];
    }
    return null;
}

function handleStorefrontRequest(req: NextRequest, subdomain: string, sourceResponse: NextResponse): NextResponse {
    const url = req.nextUrl.clone();
    // Allow static files and APIs to pass through
    if (
        url.pathname.startsWith("/_next/") ||
        url.pathname.includes(".") ||
        url.pathname.startsWith("/api/")
    ) {
        return sourceResponse;
    }

    // Check if we are already rewritten
    if (url.pathname.startsWith("/storefront/")) return sourceResponse;

    // Rewrite to /storefront/[subdomain]/...
    url.pathname = `/storefront/${subdomain}${url.pathname}`;

    // Create rewrite response
    const rewriteResponse = NextResponse.rewrite(url);

    // Merge cookies from sourceResponse (which has auth updates)
    const cookies = sourceResponse.cookies.getAll();
    cookies.forEach(cookie => {
        rewriteResponse.cookies.set(cookie.name, cookie.value, cookie);
    });

    return rewriteResponse;
}

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
