"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Package,
    Calendar,
    Store,
    Menu,
    ChevronRight,
    LogOut,
    User,
    Users,
    MessageSquare,
    Bot,
    Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { getTotalUnreadCount } from "@/lib/supabase-chat";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Bell } from "lucide-react";

import { User as SupabaseUser } from "@supabase/supabase-js";
import { Organizer } from "@/lib/database.types";

const sidebarItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/dashboard/services", icon: Package, label: "Services" },
    { href: "/dashboard/bookings", icon: Calendar, label: "Bookings" },
    { href: "/dashboard/customers", icon: Users, label: "Customers" },
    { href: "/dashboard/messages", icon: MessageSquare, label: "Messages" },
    { href: "/dashboard/calendar", icon: Calendar, label: "Calendar" },
    { href: "/dashboard/storefront-builder", icon: Store, label: "Storefront" },
    { href: "/dashboard/ai-agent", icon: Bot, label: "AI Agent" },
    { href: "/dashboard/preferences", icon: Settings, label: "Preferences" },
    { href: "/dashboard/account", icon: User, label: "Manage Account" },
];

interface SidebarContentProps {
    pathname: string;
    setIsMobileOpen: (open: boolean) => void;
    profile: Organizer | null;
    user: SupabaseUser | null;
    onLogout: () => void;
    unreadCount?: number;
}

function SidebarContent({
    pathname,
    setIsMobileOpen,
    unreadCount = 0
}: SidebarContentProps) {
    return (
        <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center px-6">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Image
                        src="/images/logo-bgr.png"
                        alt="EasyTask"
                        width={140}
                        height={40}
                        className="h-9 w-auto"
                        priority
                    />
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-blue-50 text-blue-600 shadow-sm"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                            {item.label === "Messages" && unreadCount > 0 && (
                                <UIBadge className="ml-auto bg-primary text-white text-[10px] h-5 min-w-[20px] rounded-full flex items-center justify-center border-none shadow-lg shadow-primary/20">
                                    {unreadCount}
                                </UIBadge>
                            )}
                            {isActive && item.label !== "Messages" && <ChevronRight className="ml-auto h-4 w-4" />}
                        </Link>
                    );
                })}
            </nav>


        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [profile, setProfile] = useState<Organizer | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        let mounted = true;

        const loadUser = async () => {
            try {
                // Create a promise that rejects after 5 seconds to prevent infinite hanging
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Auth timeout")), 5000)
                );

                const authPromise = supabase.auth.getUser();

                // Race the auth check against the timeout
                const { data: { user }, error } = await Promise.race([
                    authPromise,
                    timeoutPromise
                ]) as any;

                if (!mounted) return;

                if (error || !user) {
                    console.error("Auth error or timeout:", error);
                    router.push('/login');
                    return;
                }

                setUser(user);

                const { data: profile } = await supabase
                    .from('organizers') // Updated to organizers table
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (!mounted) return;

                if (!profile) {
                    // If middleware missed it, unauthorized as organizer (e.g. might be a customer)
                    // Do NOT redirect to /login if user is already logged in, as that causes loop.
                    // Instead, set loading to false and let the UI handle the "Access Denied" state.
                    console.warn("User is authenticated but has no organizer profile. Potentially a customer.");
                    setIsLoading(false);
                    return;
                }

                setProfile(profile);
                setIsLoading(false);

                // Fetch initial unread count only if we have a valid user
                const count = await getTotalUnreadCount(user.id);
                if (mounted) setUnreadCount(count);

                // Subscribe to message updates
                const channel = supabase
                    .channel('unread-count')
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'messages' },
                        async () => {
                            if (!mounted) return;
                            const newCount = await getTotalUnreadCount(user.id);
                            if (mounted) setUnreadCount(newCount);
                        }
                    )
                    .subscribe();

                return () => {
                    supabase.removeChannel(channel);
                };
            } catch (err) {
                console.error("Critical auth error:", err);
                if (mounted) {
                    // Force stop loading on critical error so user isn't stuck
                    setIsLoading(false);
                }
            }
        };

        loadUser();

        return () => {
            mounted = false;
        };
    }, [router, supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        toast.success("Logged out successfully");
        router.push("/");
    };

    // Show loading while auth loads
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    // Access Denied / Invalid Role State
    if (user && !profile) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#f5f7fa]">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
                    <p className="text-muted-foreground">You do not have the required permissions to access this dashboard.</p>
                </div>
                <Button onClick={handleLogout} variant="outline">
                    Log out
                </Button>
                <Button variant="link" asChild>
                    <Link href="/">Back to Home</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#f5f7fa]">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-[205px] flex-col border-r bg-card">
                <SidebarContent
                    pathname={pathname}
                    setIsMobileOpen={setIsMobileOpen}
                    profile={profile}
                    user={user}
                    onLogout={handleLogout}
                    unreadCount={unreadCount}
                />
            </aside>

            {/* Mobile Sidebar */}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetContent side="left" className="w-64 p-0">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <SidebarContent
                        pathname={pathname}
                        setIsMobileOpen={setIsMobileOpen}
                        profile={profile}
                        user={user}
                        onLogout={handleLogout}
                        unreadCount={unreadCount}
                    />
                </SheetContent>
            </Sheet>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setIsMobileOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>

                        <div className="relative w-full max-w-sm hidden md:flex items-center">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search..."
                                className="w-64 pl-9 rounded-full bg-muted/50 border-none focus-visible:ring-1"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                        <Button variant="ghost" size="icon" asChild title="View Storefront">
                            <Link
                                href={profile?.subdomain
                                    ? `http://${profile.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'}`
                                    : `/organizers/${user?.id || ''}`}
                                target="_blank"
                            >
                                <Store className="h-5 w-5" />
                                <span className="sr-only">View Storefront</span>
                            </Link>
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative">
                                    <Bell className="h-5 w-5" />
                                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600" />
                                    <span className="sr-only">Notifications</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-80">
                                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-medium">New Booking Request</p>
                                        <p className="text-xs text-muted-foreground">John Doe requested &quot;Wedding Photography&quot;</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">2 mins ago</p>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-medium">System Update</p>
                                        <p className="text-xs text-muted-foreground">EasyTask has been updated to v2.0</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">1 hour ago</p>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                                        <AvatarFallback className="bg-primary text-primary-foreground">
                                            {profile?.name
                                                ? profile.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
                                                : user?.email?.[0].toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{profile?.name || "User"}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/account">Profile</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/settings">Settings</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

