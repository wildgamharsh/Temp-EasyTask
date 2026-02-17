"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Building2,
    CreditCard,
    Settings,
    LogOut,
    Menu,
    FileText,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/admin-header";
import { cn } from "@/lib/utils";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [currentAdmin, setCurrentAdmin] = useState<{ name: string; email: string } | null>(null);

    // Fetch admin session
    useEffect(() => {
        setIsMounted(true);
        // Don't fetch on login page
        if (pathname === '/admin/login') return;

        const fetchAdmin = async () => {
            try {
                const response = await fetch("/api/admin/auth/me");
                const data = await response.json();
                if (data.admin) {
                    setCurrentAdmin({
                        name: data.admin.name,
                        email: data.admin.email
                    });
                }
            } catch (error) {
                console.error("Failed to fetch admin session", error);
            }
        };
        fetchAdmin();
    }, [pathname]);

    const routes = [
        {
            href: "/admin/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
            active: pathname === "/admin/dashboard" || pathname === "/admin",
        },
        {
            href: "/admin/organizers",
            label: "Organizers",
            icon: Building2,
            active: pathname.startsWith("/admin/organizers"),
        },
        {
            href: "/admin/customers",
            label: "Customers",
            icon: Users,
            active: pathname.startsWith("/admin/customers"),
        },
        {
            href: "/admin/transactions",
            label: "Payments",
            icon: CreditCard,
            active: pathname.startsWith("/admin/transactions"),
        },
        {
            href: "/admin/audit-logs",
            label: "Audit Logs",
            icon: FileText,
            active: pathname.startsWith("/admin/audit-logs"),
        },
        {
            href: "/admin/settings",
            label: "Settings",
            icon: Settings,
            active: pathname.startsWith("/admin/settings"),
        },
    ];

    const handleLogout = async () => {
        try {
            await fetch("/api/admin/auth/logout", { method: "POST" });
            toast.success("Logged out successfully");
            router.push("/admin/login");
        } catch (error) {
            toast.error("Failed to logout");
        }
    };

    // 1. CONDITIONAL RENDER FOR LOGIN PAGE
    // If we are on the login page, render a clean layout without sidebar/header
    if (pathname === '/admin/login') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                {children}
            </div>
        );
    }

    // 2. DASHBOARD LAYOUT
    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
                /* Hide scrollbar buttons */
                .custom-scrollbar::-webkit-scrollbar-button {
                    display: none;
                }
            `}</style>

            {/* Desktop Sidebar */}
            <aside className="hidden w-[205px] flex-none flex-col border-r border-slate-200 bg-white md:flex">
                {/* Logo & Navigation Container */}
                <div className="flex flex-col flex-1 px-3 py-6 custom-scrollbar overflow-y-auto">
                    {/* Logo Section */}
                    <Link href="/admin/dashboard" className="flex items-center gap-3 mb-8 px-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                            <i className="fa-solid fa-layer-group text-sm"></i>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
                                Easy<span className="text-blue-600">Task</span>
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                Admin Panel
                            </span>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <nav className="space-y-1">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    route.active
                                        ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <route.icon className={cn("h-4.5 w-4.5", route.active ? "text-blue-600" : "text-slate-400")} />
                                <span className="flex-1 text-left">{route.label}</span>
                                {route.active && (
                                    <ChevronRight className="h-4 w-4 text-blue-600 transition-transform duration-200" />
                                )}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Footer */}
                <div className="flex-none border-t border-slate-200 p-4">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-slate-600 hover:text-red-600 hover:bg-red-50"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Mobile Sidebar & Main Content */}
            <div className="flex flex-1 flex-col h-full overflow-hidden">
                {/* Mobile Header */}
                {isMounted && (
                    <header className="flex h-16 flex-none items-center gap-4 border-b border-slate-200 bg-white px-4 md:hidden">
                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="shrink-0 border-slate-200">
                                    <Menu className="h-5 w-5 text-slate-600" />
                                    <span className="sr-only">Toggle navigation menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-64 p-0 bg-white">
                                {/* Mobile Nav Logo */}
                                <div className="flex h-16 items-center border-b border-slate-200 px-6">
                                    <Link href="/admin/dashboard" className="flex items-center gap-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                                            <i className="fa-solid fa-layer-group text-sm"></i>
                                        </div>
                                        <span className="text-lg font-bold text-slate-900">
                                            Easy<span className="text-blue-600">Task</span>
                                        </span>
                                    </Link>
                                </div>
                                {/* Mobile Nav Links */}
                                <nav className="flex-1 space-y-1 p-4">
                                    {routes.map((route) => (
                                        <Link
                                            key={route.href}
                                            href={route.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                                route.active
                                                    ? "bg-blue-50 text-blue-700"
                                                    : "text-slate-600 hover:bg-slate-50"
                                            )}
                                        >
                                            <route.icon className="h-5 w-5" />
                                            <span className="flex-1 text-left">{route.label}</span>
                                            {route.active && (
                                                <ChevronRight className="h-4 w-4 text-blue-600" />
                                            )}
                                        </Link>
                                    ))}
                                </nav>
                                {/* Mobile Nav Footer */}
                                <div className="border-t border-slate-200 p-4">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-3 text-slate-600 hover:text-red-600"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="h-5 w-5" />
                                        Sign Out
                                    </Button>
                                </div>
                            </SheetContent>
                        </Sheet>
                        <span className="font-bold text-slate-900">
                            Easy<span className="text-blue-600">Task</span>
                            <span className="ml-2 text-xs font-medium text-slate-400">Admin</span>
                        </span>
                    </header>
                )}

                {/* Desktop Header */}
                <div className="hidden flex-none md:block">
                    <AdminHeader
                        adminName={currentAdmin?.name || "Admin"}
                        adminEmail={currentAdmin?.email || "admin@easytask.com"}
                        notificationCount={0}
                        onLogout={handleLogout}
                    />
                </div>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}
