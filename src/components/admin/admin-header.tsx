"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Bell,
    Search,
    LogOut,
    Settings,
    User,
    ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AdminHeaderProps {
    adminName?: string;
    adminEmail?: string;
    notificationCount?: number;
    onLogout: () => void;
}

export function AdminHeader({
    adminName = "Admin",
    adminEmail = "admin@easytask.com",
    notificationCount = 0,
    onLogout,
}: AdminHeaderProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const initials = adminName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-white px-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        type="search"
                        placeholder="Search organizers, customers, bookings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 transition-colors"
                    />
                </div>
            </form>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative h-10 w-10 rounded-full hover:bg-blue-50"
                        >
                            <Bell className="h-5 w-5 text-slate-600" />
                            {notificationCount > 0 && (
                                <Badge
                                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-red-500 hover:bg-red-500"
                                >
                                    {notificationCount > 9 ? "9+" : notificationCount}
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel className="font-semibold">
                            Notifications
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="p-4 text-center text-sm text-slate-500">
                            No new notifications
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Settings */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full hover:bg-blue-50"
                    asChild
                >
                    <Link href="/admin/settings">
                        <Settings className="h-5 w-5 text-slate-600" />
                    </Link>
                </Button>

                {/* Admin Profile */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2 h-10 pl-2 pr-3 rounded-full hover:bg-blue-50"
                        >
                            <Avatar className="h-8 w-8 border border-blue-200">
                                <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-bold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <span className="hidden md:inline text-sm font-medium text-slate-700">
                                {adminName}
                            </span>
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-semibold">{adminName}</p>
                                <p className="text-xs text-slate-500">{adminEmail}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/admin/settings" className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={onLogout}
                            className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
