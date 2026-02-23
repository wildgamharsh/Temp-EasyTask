"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { login } from "@/app/login/actions";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ThemeProvider } from "@/components/storefront/ThemeProvider";
import { getOrganizerBySubdomain } from "@/lib/supabase-data";
import { getDefaultThemeColors } from "@/lib/storefront-renderer";
import { StorefrontSettings } from "@/lib/database.types";

export default function StorefrontLoginPage() {
    const router = useRouter();
    const params = useParams();
    const subdomain = params.subdomain as string;

    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [organizer, setOrganizer] = useState<any>(null);
    const [fetchingOrganizer, setFetchingOrganizer] = useState(true);
    const [finalColors, setFinalColors] = useState<any>(null);

    const supabase = createClient();

    useEffect(() => {
        async function loadOrganizer() {
            try {
                const data = await getOrganizerBySubdomain(subdomain);
                if (data) {
                    setOrganizer(data);
                    const settings = (data.storefront_settings || {}) as StorefrontSettings;
                    const themeColors = getDefaultThemeColors(settings);
                    let colors = { ...themeColors };
                    if (settings.theme_colors) {
                        colors = { ...colors, ...settings.theme_colors };
                    }
                    if (settings.custom_colors) {
                        colors = { ...colors, ...settings.custom_colors };
                    }
                    setFinalColors(colors);
                }
            } catch (error) {
                console.error("Error loading organizer:", error);
            } finally {
                setFetchingOrganizer(false);
            }
        }
        loadOrganizer();
    }, [subdomain]);

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        try {
            // Use window.location.origin to automatically handle http vs https
            // Middleware rewrites /auth/callback to the correct route while keeping the domain
            const redirectBase = `${window.location.origin}/auth/callback`;
            console.log("DEBUG: Google OAuth Redirect URL:", redirectBase);

            const queryParams: any = {
                next: '/',
                role: 'customer',
                organizer_id: organizer?.id || ''
            };
            console.log("DEBUG: Context Params:", queryParams);

            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: redirectBase,
                    queryParams: queryParams,
                    data: {
                        role: 'customer',
                        organizer_id: organizer?.id || '',
                        platform_origin: 'storefront'
                    }
                } as any,
            });
            if (error) {
                toast.error(error.message);
                setIsGoogleLoading(false);
            }
        } catch (error) {
            console.error("Google login error:", error);
            toast.error("An error occurred with Google login");
            setIsGoogleLoading(false);
        }
    };

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        try {
            const result = await login(formData);
            if (result?.error) {
                toast.error(result.error);
                setIsLoading(false);
            } else if (result?.success) {
                toast.success("Logged in successfully!");
                // Check if user is organizer or customer and redirect accordingly?
                // For storefront login, we usually assume customer, but we'll let middleware/onboarding handle the final destination.
                // However, we want them back on the storefront.
                router.push(`/storefront/${subdomain}`);
                router.refresh();
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("An unexpected error occurred");
            setIsLoading(false);
        }
    };

    if (fetchingOrganizer) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!organizer) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 text-center">
                <h1 className="text-2xl font-bold mb-2">Storefront Not Found</h1>
                <p className="text-slate-600 mb-6">The storefront you are looking for doesn't exist.</p>
                <Link href="/" className="text-brand-600 font-medium hover:underline flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Zaaro
                </Link>
            </div>
        );
    }

    const businessName = organizer.business_name || organizer.name;
    const settings = (organizer.storefront_settings || {}) as StorefrontSettings;
    const authBackgroundUrl = settings.auth_background_url || settings.banner_url || "https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";
    const loginHeading = settings.login_heading || `Welcome back to ${businessName}`;
    const loginDescription = settings.login_description || settings.auth_description || "Please enter your details to sign in.";

    return (
        <ThemeProvider colors={finalColors}>
            <div className="min-h-screen flex bg-white font-[var(--font-family)]">
                {/* Left Side - Image/Brand */}
                <div className="hidden lg:flex lg:w-1/2 relative bg-[var(--color-primary)] overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay"
                        style={{ backgroundImage: `url('${authBackgroundUrl}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="relative z-10 flex flex-col justify-between w-full h-full p-12 text-white">
                        <Link href={`/storefront/${subdomain}`} className="flex items-center gap-2 w-fit group">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 group-hover:bg-white/30 transition-all">
                                {settings.logo_url ? (
                                    <img src={settings.logo_url} alt={businessName} className="w-6 h-6 object-contain" />
                                ) : (
                                    <i className="fa-solid fa-layer-group text-xl"></i>
                                )}
                            </div>
                            <span className="text-2xl font-bold tracking-tight">{businessName}</span>
                        </Link>

                        <div className="mb-12">
                            <h1 className="text-4xl font-bold leading-tight mb-4 drop-shadow-lg">
                                {loginHeading}
                            </h1>
                            <p className="text-white/90 text-lg max-w-md drop-shadow-md">
                                {loginDescription}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-[var(--color-bg-light)]">
                    <div className="w-full max-w-md space-y-8">
                        <div className="text-center lg:text-left">
                            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
                                {loginHeading}
                            </h2>
                            <p className="mt-2 text-[var(--color-text-secondary)]">
                                {loginDescription}
                            </p>
                        </div>

                        <div className="mt-8 space-y-6">
                            {/* Google Login */}
                            <button
                                onClick={handleGoogleLogin}
                                disabled={isGoogleLoading || isLoading}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl shadow-sm bg-white text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isGoogleLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 4.63c1.69 0 3.26.58 4.54 1.8l3.4-3.4C17.46.97 14.96 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                )}
                                Sign in with Google
                            </button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-[var(--color-bg-light)] text-slate-500">
                                        Or sign in with email
                                    </span>
                                </div>
                            </div>

                            {/* Email Form */}
                            <form action={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                        Email address
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="Enter your email"
                                        className="block w-full px-4 py-3 rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            placeholder="Enter your password"
                                            className="block w-full px-4 py-3 rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all pr-12"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input
                                            id="remember-me"
                                            name="remember-me"
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                        />
                                        <label htmlFor="remember-me" className="ml-2 text-sm text-slate-600">
                                            Remember me
                                        </label>
                                    </div>

                                    <div className="text-sm">
                                        <a href="#" className="font-medium text-[var(--color-primary)] hover:opacity-80">
                                            Forgot password?
                                        </a>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || isGoogleLoading}
                                    className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-[var(--color-primary)]/20 text-white bg-[var(--color-primary)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-all font-semibold text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        "Sign in"
                                    )}
                                </button>
                            </form>

                            <p className="text-center text-sm text-slate-600">
                                Don't have an account?{' '}
                                <Link href={`/storefront/${subdomain}/signup`} className="font-semibold text-[var(--color-primary)] hover:opacity-80 transition-colors">
                                    Sign up for free
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );
}
