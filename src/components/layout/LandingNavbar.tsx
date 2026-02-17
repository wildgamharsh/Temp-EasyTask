"use client";

import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

// Define a minimal profile type locally or import from types
interface Profile {
    id: string;
    role: "customer" | "organizer" | "admin";
}

export function LandingNavbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const isTransparentPage = pathname === "/how-it-works";
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [scrolled]);

    const shouldShowGlass = !isTransparentPage || scrolled;

    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                // Fetch profile to get role
                // Try to get role from metadata first
                let role = user.user_metadata?.role;

                if (!role) {
                    // Fallback: Check tables
                    const { data: organizer } = await supabase.from("organizers").select("id").eq("id", user.id).single();
                    if (organizer) role = "organizer";
                    else {
                        const { data: customer } = await supabase.from("customers").select("id").eq("id", user.id).single();
                        if (customer) role = "customer";
                    }
                }

                if (role) {
                    setProfile({ id: user.id, role: role as Profile["role"] });
                }
            }
            setIsLoading(false);
        };

        getUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setUser(session?.user ?? null);
            if (!session) setProfile(null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
        setUser(null);
        setProfile(null);
    };

    // Determine dashboard route based on role
    const getDashboardRoute = () => {
        if (!profile) return "/customer/bookings"; // Default

        switch (profile.role) {
            case "admin":
                return "/admin";
            case "organizer":
                return "/dashboard";
            case "customer":
            default:
                return "/customer";
        }
    };

    return (
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${shouldShowGlass ? "glass-nav" : ""}`} id="navbar">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link href="/" className="shrink-0 flex items-center cursor-pointer">
                        <Image
                            src="/images/logo-bgr.png"
                            alt="EasyTask"
                            width={140}
                            height={40}
                            className="h-10 w-auto"
                            priority
                        />
                    </Link>

                    {/* Desktop Menu - Centered absolutely */}
                    <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center space-x-8">
                        <Link href="/" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
                            Home
                        </Link>
                        <Link href="/how-it-works" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
                            How it works
                        </Link>
                        <Link href="/about" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
                            About Us
                        </Link>
                    </div>

                    {/* CTA */}
                    <div className="hidden md:flex items-center space-x-4">
                        {!isLoading && (
                            user ? (
                                <div className="flex items-center gap-3">
                                    {/* Direct Dashboard Button */}
                                    <Link href={getDashboardRoute()}>
                                        <Button
                                            variant="ghost"
                                            className="text-slate-600 hover:text-brand-700 hover:bg-brand-50 font-medium hidden sm:flex items-center gap-2"
                                        >
                                            <LayoutDashboard className="w-4 h-4" />
                                            Dashboard
                                        </Button>
                                    </Link>

                                    {/* Profile Dropdown */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden ring-2 ring-transparent hover:ring-brand-100 transition-all">
                                                <Avatar className="h-full w-full">
                                                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                                                    <AvatarFallback className="bg-brand-100 text-brand-700 font-bold tracking-tighter">
                                                        {user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-64 p-2" align="end" sideOffset={8} forceMount>
                                            <DropdownMenuLabel className="font-normal px-2 py-3 mb-1 bg-slate-50/50 rounded-lg">
                                                <div className="flex flex-col space-y-1">
                                                    <p className="text-sm font-bold leading-none text-brand-900">{user?.user_metadata?.full_name || user?.user_metadata?.name || "User"}</p>
                                                    <p className="text-xs leading-none text-slate-500 font-medium truncate">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </DropdownMenuLabel>

                                            <div className="space-y-1">
                                                <DropdownMenuItem asChild className="cursor-pointer focus:bg-brand-50 focus:text-brand-700 rounded-md py-2.5 px-3 transition-colors">
                                                    <Link href={profile?.role === "organizer" ? "/dashboard/bookings" : "/customer/bookings"} className="flex items-center">
                                                        <Menu className="mr-3 h-4 w-4 text-slate-400 group-hover:text-brand-600" />
                                                        <span className="font-medium text-slate-700">My Bookings</span>
                                                    </Link>
                                                </DropdownMenuItem>

                                                {profile?.role === "organizer" && (
                                                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-brand-50 focus:text-brand-700 rounded-md py-2.5 px-3 transition-colors">
                                                        <Link href="/dashboard/storefront" className="flex items-center">
                                                            <i className="fa-solid fa-shop mr-3 text-slate-400 group-hover:text-brand-600 text-xs w-4 text-center"></i>
                                                            <span className="font-medium text-slate-700">Storefront</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                )}
                                            </div>

                                            <DropdownMenuSeparator className="my-2 bg-slate-100" />

                                            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 rounded-md py-2.5 px-3 transition-colors">
                                                <LogOut className="mr-3 h-4 w-4" />
                                                <span className="font-medium">Sign Out</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ) : (
                                <>
                                    <>
                                        <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
                                            Log In
                                        </Link>
                                        <Link href="/login">
                                            <button className="px-5 py-2.5 rounded-full bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200">
                                                Get Started
                                            </button>
                                        </Link>
                                    </>
                                </>
                            )
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-slate-600 hover:text-brand-600 focus:outline-none"
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-slate-200">
                        <div className="flex flex-col space-y-4">
                            <Link
                                href="/"
                                className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link
                                href="/how-it-works"
                                className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                How it works
                            </Link>
                            <Link
                                href="/about"
                                className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                About Us
                            </Link>
                            <div className="pt-4 border-t border-slate-200 flex flex-col space-y-3">
                                {user ? (
                                    <>
                                        <Link href={getDashboardRoute()} className="text-sm font-medium text-brand-700 flex items-center gap-2">
                                            <LayoutDashboard className="w-4 h-4" />
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={handleSignOut}
                                            className="text-sm font-medium text-slate-600 hover:text-red-600 flex items-center gap-2 text-left"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <>
                                            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                                <button className="w-full text-left px-5 py-2.5 text-slate-600 hover:text-brand-600 font-medium">
                                                    Log In
                                                </button>
                                            </Link>
                                            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                                <button className="px-5 py-2.5 rounded-full bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 text-center w-full">
                                                    Get Started
                                                </button>
                                            </Link>
                                        </>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .glass-nav {
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border-bottom: 1px solid rgba(226, 232, 240, 0.6);
                }
            `}</style>
        </nav>
    );
}
