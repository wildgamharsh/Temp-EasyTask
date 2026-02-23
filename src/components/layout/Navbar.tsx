"use client";

import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { Profile } from "@/lib/database.types";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, LayoutDashboard, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navLinks = [
    { href: "/services", label: "Find Services" },
    { href: "/about", label: "About" },
];

export function Navbar() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    // Use state to hold the supabase client to ensure stability across renders
    const [supabase] = useState(() => createClient());

    // Load user profile to determine dashboard route
    useEffect(() => {
        const loadUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const role = user.user_metadata?.role || 'customer';
                const table = role === 'organizer' ? 'organizers' : 'customers';

                const { data: profile } = await supabase
                    .from(table)
                    .select('*')
                    .eq('id', user.id)
                    .single();

                // If profile found, set it with role. 
                // Note: The Profile type in state might need role property which comes from DB or spread.
                if (profile) {
                    setProfile({ ...profile, role } as any);
                }
            }
            setIsLoading(false);
        };
        loadUser();

        // Auth state change listener
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
        if (!profile) return "/customer/bookings"; // Default for customers

        switch (profile.role) {
            case "admin":
                return "/admin";
            case "organizer":
                return "/dashboard";
            case "customer":
            default:
                return "/customer/bookings";
        }
    };

    const initials = user?.email?.[0].toUpperCase() || "U";

    return (
        <header id="navbar" className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/images/logo_zaaro_croped.png"
                        alt="Zaaro"
                        width={140}
                        height={40}
                        className="h-9 w-auto"
                        priority
                    />
                </Link>

                {/* Desktop Navigation - Centered absolutely */}
                <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-6">
                    <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                        Home
                    </Link>
                    <Link href="/services" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                        Find Services
                    </Link>
                    <Link href="/how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                        How It Works
                    </Link>
                    <Link href="/about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                        About
                    </Link>
                </nav>

                {/* Desktop Auth Buttons */}
                <div className="hidden items-center gap-3 md:flex">
                    {isLoading ? (
                        <div className="h-9 w-9 animate-spin rounded-full border-b-2 border-primary" />
                    ) : user ? (
                        <>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={getDashboardRoute()}>
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    Dashboard
                                </Link>
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-auto py-2 px-3 hover:bg-accent/50 rounded-full flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-border">
                                            <AvatarImage src={user?.user_metadata?.avatar_url} />
                                            <AvatarFallback className="bg-brand-100 text-brand-700">{initials}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col items-start text-left">
                                            <p className="text-sm font-semibold leading-none text-foreground">{profile?.name || "User"}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{profile?.name || "User"}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleSignOut}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" asChild>
                                <Link href="/login">Sign In</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/signup">Get Started</Link>
                            </Button>
                        </>
                    )}
                </div>

                {/* Mobile Menu */}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <nav className="flex flex-col gap-4 mt-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-lg font-medium transition-colors hover:text-primary"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {!user && !isLoading && (
                                <Link
                                    href="/signup"
                                    className="text-lg font-medium transition-colors hover:text-primary"
                                    onClick={() => setIsOpen(false)}
                                >
                                    For Organizers
                                </Link>
                            )}
                            <div className="mt-4 flex flex-col gap-2">
                                {user ? (
                                    <>
                                        <Button variant="outline" asChild className="w-full justify-start">
                                            <Link href={getDashboardRoute()} onClick={() => setIsOpen(false)}>
                                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                                Dashboard
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => {
                                            handleSignOut();
                                            setIsOpen(false);
                                        }}>
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Sign Out
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="outline" asChild className="w-full">
                                            <Link href="/login" onClick={() => setIsOpen(false)}>
                                                Sign In
                                            </Link>
                                        </Button>
                                        <Button asChild className="w-full">
                                            <Link href="/signup" onClick={() => setIsOpen(false)}>
                                                Get Started
                                            </Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}
