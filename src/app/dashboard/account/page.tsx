"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, Save, User } from "lucide-react";

export default function ManageAccountPage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const supabase = createClient();

    const [formData, setFormData] = useState({
        name: "",
        businessName: "",
    });

    // Load user profile
    useEffect(() => {
        async function loadProfile() {
            setIsLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                setUser(user);

                const role = user.user_metadata?.role || 'customer';
                const table = role === 'organizer' ? 'organizers' : 'customers';

                const { data: userProfile, error } = await supabase
                    .from(table)
                    .select('*')
                    .eq('id', user.id)
                    .single();

                // If error, it might be that they are in the other table (legacy data issue?)
                // But for now assume metadata is correct or table is correct.

                setProfile(userProfile);

                if (userProfile) {
                    setFormData({
                        name: userProfile.name || "",
                        businessName: (userProfile as any).business_name || "",
                        // Phone number not supported in schema
                    });
                }
            } catch (error) {
                console.error("Error loading profile:", error);
                toast.error("Failed to load profile");
            } finally {
                setIsLoading(false);
            }
        }

        loadProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        try {
            const role = user.user_metadata?.role || 'customer';
            const table = role === 'organizer' ? 'organizers' : 'customers';

            const updates: any = {
                name: formData.name,
            };

            if (role === 'organizer') {
                updates.business_name = formData.businessName;
            }

            const { error } = await supabase
                .from(table)
                .update(updates)
                .eq('id', user.id);

            if (error) throw error;

            toast.success("Profile updated successfully");

            // Reload profile
            const { data: updatedProfile } = await supabase
                .from(table)
                .select('*')
                .eq('id', user.id)
                .single();
            setProfile(updatedProfile);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const initials = formData.name
        ? formData.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "U";

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Manage Account</h1>
                <p className="text-muted-foreground mt-2">
                    Update your profile information and account settings
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                        Update your personal and business details
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Profile Picture */}
                        <div className="flex items-center gap-6">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={profile?.avatar_url} />
                                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium">Profile Picture</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Managed through your Supabase account
                                </p>
                            </div>
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        {/* Business Name */}
                        <div className="space-y-2">
                            <Label htmlFor="businessName">Business Name</Label>
                            <Input
                                id="businessName"
                                type="text"
                                value={formData.businessName}
                                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                placeholder="Your Business Name"
                            />
                            <p className="text-xs text-muted-foreground">
                                Optional - displayed on your storefront and services
                            </p>
                        </div>

                        {/* Email (Read-only) */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={user?.email || ""}
                                disabled
                                className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">
                                Email cannot be changed here.
                            </p>
                        </div>

                        {/* Phone field removed as it does not exist in the database schema yet */}

                        {/* Save Button */}
                        <div className="flex justify-end gap-4 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    if (profile) {
                                        setFormData({
                                            name: profile.full_name || "",
                                            businessName: profile.business_name || "",
                                        });
                                    }
                                }}
                                disabled={isSaving}
                            >
                                Reset
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                        View your account details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">User ID</p>
                            <p className="font-mono text-xs mt-1">{user?.id}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Account Created</p>
                            <p className="mt-1">
                                {user?.created_at
                                    ? new Date(user.created_at).toLocaleDateString()
                                    : "N/A"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
