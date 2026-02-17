"use client";


import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Home, ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function UnauthorizedContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<any>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const attemptedPage = searchParams.get("page") || "this page";
    const requiredRole = searchParams.get("required") || "different permissions";

    useEffect(() => {
        async function loadUserRole() {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }
            setUser(user);

            try {
                // Try metadata first
                let role = user.user_metadata?.role;

                if (!role) {
                    // Check tables
                    const { data: organizer } = await supabase.from("organizers").select("id").eq("id", user.id).single();
                    if (organizer) role = "organizer";
                    else {
                        const { data: customer } = await supabase.from("customers").select("id").eq("id", user.id).single();
                        if (customer) role = "customer";
                    }
                }

                setUserRole(role || null);
            } catch (error) {
                console.error("Error loading user profile:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadUserRole();
    }, [router]);

    const getDashboardPath = () => {
        if (!userRole) return "/";
        switch (userRole) {
            case "customer":
                return "/customer";
            case "organizer":
                return "/dashboard";
            case "admin":
                return "/admin";
            default:
                return "/";
        }
    };

    const getRoleName = (role: string) => {
        return role.charAt(0).toUpperCase() + role.slice(1);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-destructive/5 via-background to-destructive/10 p-4">
            <Card className="max-w-lg w-full border-destructive/20">
                <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                        <ShieldAlert className="h-8 w-8 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl">Access Denied</CardTitle>
                    <CardDescription className="text-base">
                        You don&apos;t have permission to access this page
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Role Information */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Your Role:</span>
                            <Badge variant="secondary" className="capitalize">
                                {userRole ? getRoleName(userRole) : "Unknown"}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Required Role:</span>
                            <Badge variant="outline" className="capitalize">
                                {requiredRole}
                            </Badge>
                        </div>
                        <div className="pt-2 border-t">
                            <p className="text-sm text-muted-foreground">
                                <span className="font-medium">Attempted to access:</span> {attemptedPage}
                            </p>
                        </div>
                    </div>

                    {/* Explanation */}
                    <div className="text-sm text-muted-foreground space-y-2">
                        <p>
                            This page is restricted to users with {requiredRole} permissions.
                            Your current account is registered as a {userRole}.
                        </p>
                        <p>
                            If you believe this is an error, please contact support or check your account settings.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 pt-2">
                        <Button
                            onClick={() => router.push(getDashboardPath())}
                            className="w-full"
                            size="lg"
                        >
                            Go to My Dashboard
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button
                            onClick={() => router.push("/")}
                            variant="outline"
                            className="w-full"
                        >
                            <Home className="mr-2 h-4 w-4" />
                            Back to Home
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function UnauthorizedPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <UnauthorizedContent />
        </Suspense>
    );
}
