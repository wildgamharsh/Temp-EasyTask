"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Calendar, MessageSquare, ArrowRight, Clock, CheckCircle2, Store } from "lucide-react";
import { getTotalUnreadCount } from "@/lib/supabase-chat";

export default function CustomerHomePage() {
    const params = useParams();
    const router = useRouter();
    const subdomain = params.subdomain as string;
    const supabase = createClient();

    const [user, setUser] = useState<any>(null);
    const [customer, setCustomer] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [bookingStats, setBookingStats] = useState({ total: 0, pending: 0, confirmed: 0 });

    useEffect(() => {
        const loadData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push(`/storefront/${subdomain}/login`);
                return;
            }

            const [{ data: customerData }, { data: bookingsData }, unreads] = await Promise.all([
                supabase.from("customers").select("*").eq("id", user.id).single(),
                supabase.from("bookings").select("status").eq("customer_id", user.id),
                getTotalUnreadCount(user.id),
            ]);

            setUser(user);
            setCustomer(customerData);
            setUnreadCount(unreads);

            if (bookingsData) {
                setBookingStats({
                    total: bookingsData.length,
                    pending: bookingsData.filter((b) => b.status === "pending").length,
                    confirmed: bookingsData.filter((b) => b.status === "confirmed").length,
                });
            }

            setIsLoading(false);
        };

        loadData();
    }, [subdomain, router, supabase]);

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-blue-600/50" />
            </div>
        );
    }

    const displayName = customer?.name || user?.user_metadata?.name || user?.email?.split("@")[0] || "there";
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

    const stats = [
        { label: "Total Bookings", value: bookingStats.total, icon: Calendar, color: "text-blue-400" },
        { label: "Pending", value: bookingStats.pending, icon: Clock, color: "text-amber-400" },
        { label: "Confirmed", value: bookingStats.confirmed, icon: CheckCircle2, color: "text-emerald-400" },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* ── Hero Banner ─────────────────────────────────────────── */}
            <div
                className="relative rounded-2xl overflow-hidden"
                style={{ background: "linear-gradient(135deg, #1e40af 0%, #1d4ed8 40%, #2563eb 70%, #3b82f6 100%)" }}
            >
                {/* Decorative circles */}
                <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/5 pointer-events-none" />
                <div className="absolute -bottom-8 -right-4 h-32 w-32 rounded-full bg-white/5 pointer-events-none" />
                <div className="absolute top-4 right-24 h-10 w-10 rounded-full bg-white/10 pointer-events-none" />

                <div className="relative p-7 sm:p-9">
                    <p className="text-blue-200 text-sm font-medium mb-1">{greeting},</p>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
                        {displayName}! 👋
                    </h1>
                    <p className="text-blue-200 text-sm max-w-sm leading-relaxed">
                        Manage your bookings, communicate with organizers, and track your appointments — all in one place.
                    </p>

                    {/* Inline stat chips on the banner */}
                    <div className="flex flex-wrap gap-3 mt-6">
                        {stats.map((s) => (
                            <div
                                key={s.label}
                                className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2"
                            >
                                <s.icon className={`h-4 w-4 ${s.color}`} />
                                <div>
                                    <span className="text-white font-bold text-base leading-none">{s.value}</span>
                                    <span className="text-blue-200/80 text-xs ml-1.5">{s.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Navigation Cards ────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* My Bookings Card */}
                <div
                    onClick={() => router.push(`/storefront/${subdomain}/customer/bookings`)}
                    className="group bg-white rounded-2xl border border-blue-100/80 p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="h-11 w-11 rounded-2xl bg-blue-50 flex items-center justify-center ring-1 ring-blue-100">
                            <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="h-4 w-4 text-blue-600" />
                        </div>
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">My Bookings</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        View upcoming appointments, track order status, and manage your reservations.
                    </p>
                    {bookingStats.pending > 0 && (
                        <div className="mt-4 inline-flex items-center gap-1.5 bg-amber-50 border border-amber-100 text-amber-700 rounded-full px-3 py-1 text-xs font-medium">
                            <Clock className="h-3 w-3" />
                            {bookingStats.pending} pending {bookingStats.pending === 1 ? "booking" : "bookings"}
                        </div>
                    )}
                    {bookingStats.pending === 0 && bookingStats.total === 0 && (
                        <div className="mt-4 inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-full px-3 py-1 text-xs font-medium">
                            No bookings yet — browse services!
                        </div>
                    )}
                </div>

                {/* Messages Card */}
                <div
                    onClick={() => router.push(`/storefront/${subdomain}/customer/messages`)}
                    className="group bg-white rounded-2xl border border-blue-100/80 p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="h-11 w-11 rounded-2xl bg-blue-50 flex items-center justify-center ring-1 ring-blue-100">
                            <MessageSquare className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="h-4 w-4 text-blue-600" />
                        </div>
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">Messages</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Communicate with organizers, discuss booking details, and receive updates.
                    </p>
                    {unreadCount > 0 ? (
                        <div className="mt-4 inline-flex items-center gap-1.5 bg-blue-600 text-white rounded-full px-3 py-1 text-xs font-semibold shadow-sm shadow-blue-600/30">
                            <span className="h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse" />
                            {unreadCount} unread {unreadCount === 1 ? "message" : "messages"}
                        </div>
                    ) : (
                        <div className="mt-4 inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-full px-3 py-1 text-xs font-medium">
                            All caught up
                        </div>
                    )}
                </div>
            </div>

            {/* ── Back to Shop ────────────────────────────────────────── */}
            <div className="flex justify-center pt-2">
                <Link
                    href={`/storefront/${subdomain}`}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-600 transition-colors group"
                >
                    <Store className="h-4 w-4" />
                    <span>Browse services in the shop</span>
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </Link>
            </div>
        </div>
    );
}
