"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    DollarSign,
    Calendar,
    Package,
    TrendingUp,
    ArrowUpRight,
    Clock,
    User,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { getServicesByOrganizer, getBookingsByOrganizer, Booking } from "@/lib/supabase-data";
// Local interface based on database schema
import { Organizer } from "@/lib/database.types";
// Local interface or imported
interface DashboardProfile extends Organizer {
    // legacy extensions if any
}

const statusConfig = {
    pending: {
        label: "Pending",
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    },
    confirmed: {
        label: "Confirmed",
        className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    },
    completed: {
        label: "Completed",
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    },
    cancelled: {
        label: "Cancelled",
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    },
};

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [recentBookings, setRecentBookings] = useState<any[]>([]);
    const supabase = createClient();

    useEffect(() => {
        async function loadDashboardData() {
            try {
                const { data: { user: currentUser } } = await supabase.auth.getUser();

                if (!currentUser) {
                    router.push("/login");
                    return;
                }
                setUser(currentUser);

                const { data: userProfile, error: profileError } = await supabase
                    .from('organizers')
                    .select('*')
                    .eq('id', currentUser.id)
                    .single();

                if (profileError || !userProfile || userProfile.onboarding_completed === false) {
                    toast.info("Almost there!", {
                        description: "Just a few more steps to complete your profile.",
                        duration: 5000,
                    });
                    router.replace("/onboarding");
                    return;
                }

                setProfile(userProfile);

                // Fetch recent bookings only
                const bookings = await getBookingsByOrganizer(currentUser.id);
                setRecentBookings(bookings.slice(0, 5));

            } catch (err) {
                console.error("Error loading dashboard data:", err);
                setError("Failed to load dashboard data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }

        loadDashboardData();
    }, [router, supabase]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    Welcome back, {profile?.businessName || profile?.name}!
                </h1>
                <p className="text-muted-foreground">
                    Let&apos;s get your business up and running.
                </p>
            </div>

            {/* Get Started Section */}
            <div className="space-y-6">

                <div className="grid gap-4 md:grid-cols-2">

                    {/* Card 1: Personalize Storefront */}
                    <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 group bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
                        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                        <Package className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <h3 className="font-bold text-lg">Personalize Storefront</h3>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-200 lg:max-w-md">
                                    Create a professional website for your organization in minutes. Build your brand with our intuitive editor.
                                </p>
                                <Button className="w-fit bg-blue-600 hover:bg-blue-700 text-white px-8" onClick={() => router.push('/dashboard/storefront-builder')}>
                                    Start Building <ArrowUpRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                            <div className="hidden md:flex items-center justify-center p-2">
                                <Image
                                    src="/images/STOREFRONT_new.png"
                                    alt="Storefront Builder"
                                    width={140}
                                    height={100}
                                    className="object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 2: Create Services */}
                    <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 group bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40">
                        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                        <TrendingUp className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <h3 className="font-bold text-lg">Create Services</h3>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-200 lg:max-w-md">
                                    Define your offerings, set prices, and manage availability. Turn your expertise into bookable services.
                                </p>
                                <Button className="w-fit bg-purple-600 hover:bg-purple-700 text-white px-8" onClick={() => router.push('/dashboard/services')}>
                                    Add Service <ArrowUpRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                            <div className="hidden md:flex items-center justify-center p-2">
                                <Image
                                    src="/images/AI AGENT_new.png"
                                    alt="Create Services"
                                    width={140}
                                    height={100}
                                    className="object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500"
                                    style={{ filter: "sepia(1) saturate(3) hue-rotate(240deg) brightness(0.9)" }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 3: Manage Bookings */}
                    <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 group bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40">
                        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                        <Calendar className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <h3 className="font-bold text-lg">Manage Bookings</h3>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-200 lg:max-w-md">
                                    Track orders, manage calendar, and handle customer requests. Keep your business organized and on schedule.
                                </p>
                                <Button className="w-fit bg-emerald-600 hover:bg-emerald-700 text-white px-8" onClick={() => router.push('/dashboard/bookings')}>
                                    View Bookings <ArrowUpRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                            <div className="hidden md:flex items-center justify-center p-2">
                                <Image
                                    src="/images/DASHBOARD_new.png"
                                    alt="Manage Bookings"
                                    width={140}
                                    height={100}
                                    className="object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500"
                                    style={{ filter: "sepia(1) saturate(3) hue-rotate(85deg) brightness(0.85)" }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

        </div>
    );
}
