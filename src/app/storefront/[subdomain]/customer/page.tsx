"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, MessageSquare, ArrowUpRight, Home } from "lucide-react";

export default function CustomerHomePage() {
    const params = useParams();
    const router = useRouter();
    const subdomain = params.subdomain as string;
    const supabase = createClient();
    
    const [user, setUser] = useState<any>(null);
    const [customer, setCustomer] = useState<any>(null);
    const [organizer, setOrganizer] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push(`/storefront/${subdomain}/login`);
                return;
            }

            const { data: customerData } = await supabase
                .from('customers')
                .select('*')
                .eq('id', user.id)
                .single();

            const { data: organizerData } = await supabase
                .from('organizers')
                .select('business_name, logo_url, subdomain')
                .eq('subdomain', subdomain)
                .single();

            setUser(user);
            setCustomer(customerData);
            setOrganizer(organizerData);
            setIsLoading(false);
        };

        loadData();
    }, [subdomain, router, supabase]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const customerName = customer?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || "Customer";

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    Hello, {customerName}!
                </h1>
                <p className="text-muted-foreground">
                    Welcome to your personal dashboard. Manage your bookings and messages all in one place.
                </p>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    {/* My Bookings Card */}
                    <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 group bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
                        <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                                <Calendar className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-xl">My Bookings</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xs mx-auto">
                                    View your upcoming appointments, track order status, and manage your reservations.
                                </p>
                            </div>
                            <Button 
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                                onClick={() => router.push(`/storefront/${subdomain}/customer/bookings`)}
                            >
                                Check Bookings <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Messages Card */}
                    <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 group bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40">
                        <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                                <MessageSquare className="h-8 w-8 text-purple-600" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-xl">Messages</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xs mx-auto">
                                    Communicate with organizers, discuss booking details, and receive updates.
                                </p>
                            </div>
                            <Button 
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white" 
                                onClick={() => router.push(`/storefront/${subdomain}/customer/messages`)}
                            >
                                View Messages <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Back to Shop */}
            <div className="pt-4 border-t">
                <Button variant="outline" className="w-full" asChild>
                    <Link href={`/storefront/${subdomain}`}>
                        <Home className="mr-2 h-4 w-4" />
                        Back to Shop
                    </Link>
                </Button>
            </div>
        </div>
    );
}
