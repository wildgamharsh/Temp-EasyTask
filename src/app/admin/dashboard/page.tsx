"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    DollarSign,
    Users,
    Building2,
    Calendar,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertTriangle,
    ArrowRight,
    UserPlus,
    CreditCard,
    Star,
} from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
    totalOrganizers: number;
    organizerChange: string;
    totalCustomers: number;
    customerChange: string;
    totalRevenue: number;
    revenueChange: string;
    activeBookings: number;
    bookingChange: string;
}

interface RecentActivity {
    id: string;
    type: "booking" | "organizer" | "payment" | "review";
    message: string;
    time: string;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [alerts, setAlerts] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await fetch("/api/admin/dashboard");
            const data = await response.json();
            if (data) {
                if (data.stats) setStats(data.stats);
                if (data.recentActivity) setRecentActivity(data.recentActivity);
                if (data.alerts) setAlerts(data.alerts);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getActivityIcon = (type: string) => {
        switch (type) {
            case "booking":
                return <Calendar className="h-4 w-4 text-blue-600" />;
            case "organizer":
                return <UserPlus className="h-4 w-4 text-green-600" />;
            case "payment":
                return <CreditCard className="h-4 w-4 text-purple-600" />;
            case "review":
                return <Star className="h-4 w-4 text-yellow-600" />;
            default:
                return <CheckCircle className="h-4 w-4 text-slate-400" />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    <span className="text-slate-500 font-medium">Loading platform data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Dashboard
                </h1>
                <p className="text-slate-500 mt-1">
                    Welcome back! Here&apos;s what&apos;s happening on your platform.
                </p>
            </div>

            {/* KPI Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Revenue"
                    value={`$${stats?.totalRevenue?.toLocaleString() ?? "0"}`}
                    change={stats?.revenueChange}
                    trend="up"
                    description="Platform fees collected"
                    icon={DollarSign}
                    variant="highlight"
                />
                <StatCard
                    title="Active Organizers"
                    value={stats?.totalOrganizers || 0}
                    change={stats?.organizerChange}
                    trend="up"
                    description="Verified & listing"
                    icon={Building2}
                />
                <StatCard
                    title="Total Customers"
                    value={stats?.totalCustomers?.toLocaleString() ?? "0"}
                    change={stats?.customerChange}
                    trend="up"
                    description="Registered users"
                    icon={Users}
                />
                <StatCard
                    title="Active Bookings"
                    value={stats?.activeBookings || 0}
                    change={stats?.bookingChange}
                    trend="up"
                    description="This month"
                    icon={Calendar}
                />
            </div>

            {/* Main Content Grid */}
            {recentActivity.length > 0 && (
                <div className="grid gap-6 lg:grid-cols-7">
                    {/* Recent Activity */}
                    <Card className="lg:col-span-7 border-slate-200 shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold text-slate-900">
                                Recent Activity
                            </CardTitle>
                            <CardDescription>
                                Latest events on the platform
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-4">
                                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                            {getActivityIcon(activity.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-700 leading-snug">
                                                {activity.message}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {activity.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                </div>
            )}

            {/* Alerts Section */}
            <div className="grid gap-6 md:grid-cols-3">
                {alerts?.highValueRefunds > 0 && (
                    <Card className="border-orange-200 bg-orange-50/50">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">High-Value Refunds</h4>
                                    <p className="text-sm text-slate-600 mt-1">
                                        {alerts.highValueRefunds} refund request{alerts.highValueRefunds > 1 ? "s" : ""} over $500 pending review
                                    </p>
                                    <Button variant="link" className="px-0 h-auto text-orange-700 hover:text-orange-800 mt-2">
                                        Review Now →
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {alerts?.revenueMilestone && (
                    <Card className="border-blue-200 bg-blue-50/50">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <TrendingUp className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">Revenue Milestone</h4>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Platform crossed $100K in monthly GMV
                                    </p>
                                    <Button variant="link" className="px-0 h-auto text-blue-700 hover:text-blue-800 mt-2">
                                        View Report →
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="border-green-200 bg-green-50/50">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900">All Systems Healthy</h4>
                                <p className="text-sm text-slate-600 mt-1">
                                    {alerts?.systemHealthy ? "Database, payments, and APIs running smoothly" : "Some systems may be experiencing issues"}
                                </p>
                                <Button variant="link" className="px-0 h-auto text-green-700 hover:text-green-800 mt-2">
                                    View Status →
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
