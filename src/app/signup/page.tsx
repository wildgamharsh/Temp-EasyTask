"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { signup } from "./actions";
import { Loader2, Eye, EyeOff, Mail, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { PhoneInput } from "@/components/ui/phone-input";

export default function SignupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showEmailVerification, setShowEmailVerification] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [phoneValue, setPhoneValue] = useState<string>("");
    const supabase = createClient();

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
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
        if (!agreedToTerms) {
            toast.error("You must agree to the Terms and Conditions and Privacy Policy to continue.");
            return;
        }

        setIsLoading(true);
        try {
            const result = await signup(formData);
            if (result?.error) {
                toast.error(result.error);
                setIsLoading(false);
            } else if (result?.success) {
                if (result.needsEmailConfirmation) {
                    // Show email verification message instead of redirecting
                    setUserEmail(result.email || formData.get('email') as string);
                    setShowEmailVerification(true);
                    setIsLoading(false);
                } else {
                    toast.success("Account created! Redirecting...");
                    router.push("/onboarding");
                }
            }
        } catch (error) {
            console.error("Signup error:", error);
            toast.error("An unexpected error occurred");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Image/Brand */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-brand-900 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80')" }}
                />
                <div className="absolute inset-0 bg-linear-to-t from-brand-900/90 to-transparent" />

                <div className="relative z-10 flex flex-col justify-between w-full h-full p-12 text-white">
                    <Link href="/" className="flex items-center gap-2 w-fit">
                        <Image
                            src="/images/logo_zaaro_croped.png"
                            alt="Zaaro"
                            width={160}
                            height={45}
                            className="h-12 w-auto brightness-0 invert"
                        />
                    </Link>

                    <div className="mb-12">
                        <h1 className="text-4xl font-bold leading-tight mb-4">
                            Start your journey<br />
                            with Zaaro today.
                        </h1>
                        <p className="text-brand-100 text-lg max-w-md">
                            Join thousands of organizers and customers managing their events and services with ease.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
                <div className="w-full max-w-md space-y-8">
                    {showEmailVerification ? (
                        /* Email Verification Message */
                        <div className="text-center space-y-6">
                            <div className="flex justify-center">
                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Mail className="w-10 h-10 text-blue-600" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                                    Check Your Email
                                </h2>
                                <p className="text-slate-600">
                                    We've sent a verification link to:
                                </p>
                            </div>

                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="font-semibold text-blue-700 break-all">{userEmail}</p>
                            </div>

                            <div className="space-y-3 text-sm text-slate-600">
                                <p className="flex items-start gap-2 justify-center">
                                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                    <span>Click the link in the email to verify your account</span>
                                </p>
                                <p className="flex items-start gap-2 justify-center">
                                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                    <span>You'll be automatically logged in and redirected</span>
                                </p>
                            </div>

                            <div className="pt-4 border-t border-slate-200">
                                <p className="text-xs text-slate-500">
                                    Didn't receive the email? Check your spam folder or{' '}
                                    <button
                                        onClick={() => {
                                            setShowEmailVerification(false);
                                            setUserEmail("");
                                        }}
                                        className="text-brand-600 font-medium hover:underline"
                                    >
                                        try again
                                    </button>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="text-center lg:text-left">
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                                    Create an account
                                </h2>
                                <p className="mt-2 text-slate-600">
                                    Enter your details to get started.
                                </p>
                            </div>

                            <div className="mt-8 space-y-6">
                                {/* Google Login */}
                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={isGoogleLoading || isLoading}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl shadow-sm bg-white text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
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
                                    Sign up with Google
                                </button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-200" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-slate-500">
                                            Or sign up with email
                                        </span>
                                    </div>
                                </div>

                                {/* Email Form */}
                                <form action={handleSubmit} className="space-y-5">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                                            Full Name
                                        </label>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            required
                                            placeholder="Enter your full name"
                                            className="block w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                                        />
                                    </div>

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
                                            className="block w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <input type="hidden" name="phone" value={phoneValue} />
                                            <PhoneInput
                                                id="phone"
                                                defaultCountry="CA"
                                                value={phoneValue}
                                                onChange={(val) => setPhoneValue(val as string || "")}
                                                placeholder="(+1) 234-567-89"
                                                className="focus-within:ring-2 focus-within:ring-green-400 focus-within:bg-white rounded-3xl overflow-hidden transition-all shadow-sm"
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            We'll validate this during onboarding.
                                        </p>
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
                                                placeholder="Create a password"
                                                minLength={8}
                                                className="block w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all pr-12"
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
                                        <p className="text-xs text-slate-500">
                                            Must be at least 8 characters long.
                                        </p>
                                    </div>

                                    {/* Terms and Privacy Checkbox */}
                                    <div className="space-y-2">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={agreedToTerms}
                                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                                className="mt-1 w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
                                                required
                                            />
                                            <span className="text-sm text-slate-700">
                                                By clicking this button you agree to our{' '}
                                                <Link href="/terms-and-conditions" target="_blank" className="text-brand-600 hover:text-brand-500 font-medium underline">
                                                    Terms and Conditions
                                                </Link>{' '}
                                                and{' '}
                                                <Link href="/privacy-policy" target="_blank" className="text-brand-600 hover:text-brand-500 font-medium underline">
                                                    Privacy Policy
                                                </Link>
                                            </span>
                                        </label>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading || isGoogleLoading || !agreedToTerms}
                                        className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-brand-500/20 text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all font-semibold text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            "Create account"
                                        )}
                                    </button>
                                </form>

                                <p className="text-center text-sm text-slate-600">
                                    Already have an account?{' '}
                                    <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-500 transition-colors">
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
