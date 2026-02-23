"use client";

import { useState } from "react";
import {
    Settings,
    DollarSign,
    Bell,
    Shield,
    Palette,
    Save,
    RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function SettingsPage() {
    const [platformFee, setPlatformFee] = useState("12");
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [autoApprove, setAutoApprove] = useState(false);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast.success("Settings saved successfully!");
        setIsSaving(false);
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Settings
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Configure platform-wide settings and preferences.
                    </p>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                    {isSaving ? (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
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

            {/* Fee Settings */}
            <Card className="border-slate-200">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Fee Structure</CardTitle>
                            <CardDescription>
                                Configure platform commission and fees
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="platform-fee">Platform Commission (%)</Label>
                            <div className="relative">
                                <Input
                                    id="platform-fee"
                                    type="number"
                                    value={platformFee}
                                    onChange={(e) => setPlatformFee(e.target.value)}
                                    className="pr-8"
                                    min="0"
                                    max="100"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    %
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">
                                Applied to all bookings across the platform
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="min-payout">Minimum Payout (CAD)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    $
                                </span>
                                <Input
                                    id="min-payout"
                                    type="number"
                                    defaultValue="50"
                                    className="pl-8"
                                    min="0"
                                />
                            </div>
                            <p className="text-xs text-slate-500">
                                Minimum balance required for organizer payouts
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="border-slate-200">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Bell className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Notifications</CardTitle>
                            <CardDescription>
                                Manage email and alert preferences
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-base">Email Notifications</Label>
                            <p className="text-sm text-slate-500">
                                Receive email alerts for new signups, bookings, and disputes
                            </p>
                        </div>
                        <Switch
                            checked={emailNotifications}
                            onCheckedChange={setEmailNotifications}
                        />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-base">Auto-Approve Organizers</Label>
                            <p className="text-sm text-slate-500">
                                Automatically approve new organizer registrations
                            </p>
                        </div>
                        <Switch
                            checked={autoApprove}
                            onCheckedChange={setAutoApprove}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="border-slate-200">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Security & Access</CardTitle>
                            <CardDescription>
                                Platform security and maintenance options
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-base">Maintenance Mode</Label>
                            <p className="text-sm text-slate-500">
                                Temporarily disable public access for maintenance
                            </p>
                        </div>
                        <Switch
                            checked={maintenanceMode}
                            onCheckedChange={setMaintenanceMode}
                        />
                    </div>
                    {maintenanceMode && (
                        <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                            <p className="text-sm text-yellow-800">
                                ⚠️ <strong>Warning:</strong> Maintenance mode is active. Users cannot access the platform.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Platform Branding */}
            <Card className="border-slate-200">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Palette className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Platform Branding</CardTitle>
                            <CardDescription>
                                Customize the platform appearance
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="platform-name">Platform Name</Label>
                            <Input
                                id="platform-name"
                                defaultValue="Zaaro"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="support-email">Support Email</Label>
                            <Input
                                id="support-email"
                                type="email"
                                defaultValue="support@zaaro.ai"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
