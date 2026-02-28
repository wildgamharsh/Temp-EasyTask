"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams, usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Calendar,
    LogOut,
    MessageSquare,
    ChevronRight,
    Store,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { getTotalUnreadCount } from "@/lib/supabase-chat";

interface SidebarProps {
    subdomain: string;
    pathname: string;
    setIsMobileOpen: (open: boolean) => void;
    user: any;
    customer: any;
    onLogout: () => void;
    unreadCount?: number;
}

const navItems = (subdomain: string) => [
    { href: `/storefront/${subdomain}/customer`, icon: LayoutDashboard, label: "Home", exact: true },
    { href: `/storefront/${subdomain}/customer/bookings`, icon: Calendar, label: "My Bookings", exact: false },
    { href: `/storefront/${subdomain}/customer/messages`, icon: MessageSquare, label: "Messages", exact: false },
];

function CustomerSidebarContent({
    subdomain,
    pathname,
    setIsMobileOpen,
    user,
    customer,
    onLogout,
    unreadCount = 0,
}: SidebarProps) {
    const items = navItems(subdomain);
    const displayName = customer?.name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Customer";
    const initials = displayName.slice(0, 2).toUpperCase();

    return (
        <div className="flex h-full flex-col" style={{ background: "linear-gradient(180deg, #0f1e3c 0%, #0d1b37 100%)" }}>
            {/* Brand */}
            <div className="flex flex-col items-center justify-center px-5 py-5 border-b border-white/5">
                <Link
                    href={`/storefront/${subdomain}/customer`}
                    className="flex flex-col items-center gap-2 w-full"
                    onClick={() => setIsMobileOpen(false)}
                >
                    <Image
                        src="/images/logo-transparent-dark-br.png"
                        alt="Zaaro"
                        width={160}
                        height={40}
                        className="w-full max-w-[140px] h-auto"
                        priority
                    />
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-white/30 uppercase mt-0.5">
                        Customer Hub
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-5 space-y-1">
                {items.map((item) => {
                    const isActive = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group",
                                isActive
                                    ? "bg-white/10 text-white border-l-[3px] border-blue-400 pl-[9px]"
                                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                            )}
                        >
                            <item.icon className={cn("h-[18px] w-[18px] flex-shrink-0", isActive ? "text-blue-300" : "")} />
                            <span>{item.label}</span>
                            {item.label === "Messages" && unreadCount > 0 && (
                                <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-bold text-white shadow-lg shadow-blue-500/30">
                                    {unreadCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Back to Shop */}
            <div className="px-3 pb-3">
                <Link
                    href={`/storefront/${subdomain}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-white/30 hover:text-white/60 text-xs transition-colors group"
                >
                    <Store className="h-3.5 w-3.5" />
                    <span>Back to Shop</span>
                    <ChevronRight className="ml-auto h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
            </div>

            {/* Divider */}
            <div className="mx-4 border-t border-white/5" />

            {/* User Profile Footer */}
            <div className="p-4">
                <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors">
                    <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-blue-400/30">
                        <AvatarImage src={customer?.avatar_url || user?.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                        <p className="text-[11px] text-white/40 truncate">{user?.email}</p>
                    </div>
                    <button
                        onClick={onLogout}
                        title="Log out"
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-white/30 hover:text-red-400 hover:bg-white/5 transition-colors flex-shrink-0"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

const pageTitles: Record<string, string> = {
    "customer": "Home",
    "bookings": "My Bookings",
    "messages": "Messages",
};

export default function CustomerDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const pathname = usePathname();
    const router = useRouter();
    const subdomain = params.subdomain as string;

    const [user, setUser] = useState<any>(null);
    const [customer, setCustomer] = useState<any>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const supabase = createClient();

    // Derive page title from pathname
    const pathSegment = pathname.split("/").filter(Boolean).pop() || "customer";
    const pageTitle = pageTitles[pathSegment] ?? "Dashboard";

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push(`/storefront/${subdomain}/login`);
                return;
            }

            const { data: customerData } = await supabase
                .from("customers")
                .select("*")
                .eq("id", user.id)
                .single();

            if (!customerData) {
                const { data: organizer } = await supabase
                    .from("organizers")
                    .select("id")
                    .eq("id", user.id)
                    .single();
                if (!organizer) {
                    router.push(`/storefront/${subdomain}/login`);
                    return;
                }
            }

            setUser(user);
            setCustomer(customerData);
            setIsLoading(false);

            const count = await getTotalUnreadCount(user.id);
            setUnreadCount(count);

            const channel = supabase
                .channel("customer-unread-count")
                .on(
                    "postgres_changes",
                    { event: "*", schema: "public", table: "messages" },
                    async () => {
                        const newCount = await getTotalUnreadCount(user.id);
                        setUnreadCount(newCount);
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        checkUser();
    }, [subdomain, router, supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        toast.success("Logged out successfully");
        router.push(`/storefront/${subdomain}`);
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#f0f4ff]">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 rounded-full border-[3px] border-blue-600/20 border-t-blue-600 animate-spin" />
                    <p className="text-sm text-slate-400 font-medium">Loading your dashboard…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#f0f4ff]">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-[240px] flex-col flex-shrink-0 shadow-xl shadow-slate-900/10">
                <CustomerSidebarContent
                    subdomain={subdomain}
                    pathname={pathname}
                    setIsMobileOpen={setIsMobileOpen}
                    user={user}
                    customer={customer}
                    onLogout={handleLogout}
                    unreadCount={unreadCount}
                />
            </aside>

            {/* Mobile Sidebar */}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetContent side="left" className="w-64 p-0 border-0">
                    <SheetTitle className="sr-only">Menu</SheetTitle>
                    <CustomerSidebarContent
                        subdomain={subdomain}
                        pathname={pathname}
                        setIsMobileOpen={setIsMobileOpen}
                        user={user}
                        customer={customer}
                        onLogout={handleLogout}
                        unreadCount={unreadCount}
                    />
                </SheetContent>
            </Sheet>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden min-w-0">
                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
