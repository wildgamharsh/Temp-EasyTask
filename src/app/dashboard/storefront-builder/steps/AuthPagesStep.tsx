/**
 * Auth Pages Step - Step 4 of Storefront Builder
 * Customization for Login and Signup pages
 */

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Loader2, Trash2 } from "lucide-react";
import { uploadStorefrontImage } from "../actions";
import { toast } from "sonner";

interface AuthPagesData {
    authDescription: string;
    loginHeading: string;
    loginDescription: string;
    signupHeading: string;
    signupDescription: string;
    authBackgroundUrl: string;
}

interface AuthPagesStepProps {
    data: AuthPagesData;
    onChange: (data: AuthPagesData) => void;
    businessName: string;
}

export default function AuthPagesStep({ data, onChange, businessName }: AuthPagesStepProps) {
    const [isUploading, setIsUploading] = useState(false);

    const handleChange = (field: keyof AuthPagesData, value: string) => {
        onChange({ ...data, [field]: value });
    };

    const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be smaller than 5MB");
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'auth-background');

            const result = await uploadStorefrontImage(formData);

            if (result.success && result.url) {
                handleChange("authBackgroundUrl", result.url);
                toast.success("Background uploaded successfully");
            } else {
                toast.error(result.error || "Upload failed");
            }
        } catch (error) {
            toast.error("Upload failed");
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Authentication Pages</h2>
                <p className="text-slate-600">Customize the look of your customer Login and Signup screens.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">

                {/* Visual Settings */}
                <div className="space-y-6">
                    <Card className="p-6 border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Background Image</h3>
                        <div className="space-y-4">
                            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                                {data.authBackgroundUrl ? (
                                    <>
                                        <img
                                            src={data.authBackgroundUrl}
                                            alt="Auth Background"
                                            className="w-full h-full object-cover"
                                        />
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="absolute top-2 right-2 h-8 w-8"
                                            onClick={() => handleChange("authBackgroundUrl", "")}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-2">
                                            <Upload className="w-8 h-8 opacity-50" />
                                        </div>
                                        <span className="text-sm">No image set</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <input
                                        type="file"
                                        id="auth-bg-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleBackgroundUpload}
                                        disabled={isUploading}
                                    />
                                    <Button
                                        variant="outline"
                                        className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                                        onClick={() => document.getElementById("auth-bg-upload")?.click()}
                                        disabled={isUploading}
                                    >
                                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                        {data.authBackgroundUrl ? "Replace Image" : "Upload Image"}
                                    </Button>
                                </div>
                                <Button
                                    variant="ghost"
                                    className="text-slate-500"
                                    onClick={() => handleChange("authBackgroundUrl", "https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")}
                                >
                                    Use Default
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Content Settings */}
                <div className="space-y-6">

                    {/* Login Page Config */}
                    <Card className="p-6 border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">IN</div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Login Screen</h3>
                                <p className="text-xs text-slate-500">What returning customers see</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-slate-600">Heading</Label>
                                <Input
                                    value={data.loginHeading || ""}
                                    onChange={(e) => handleChange("loginHeading", e.target.value)}
                                    placeholder={`Welcome back to ${businessName}`}
                                    className="border-slate-200 focus:border-blue-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-600">Subtext</Label>
                                <Textarea
                                    value={data.loginDescription || ""}
                                    onChange={(e) => handleChange("loginDescription", e.target.value)}
                                    placeholder="Please sign in to continue."
                                    className="border-slate-200 focus:border-blue-500 resize-none"
                                    rows={2}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Signup Page Config */}
                    <Card className="p-6 border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-green-200">
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-bold text-sm">UP</div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Signup Screen</h3>
                                <p className="text-xs text-slate-500">What new customers see</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-slate-600">Heading</Label>
                                <Input
                                    value={data.signupHeading || ""}
                                    onChange={(e) => handleChange("signupHeading", e.target.value)}
                                    placeholder={`Join ${businessName}`}
                                    className="border-slate-200 focus:border-blue-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-600">Subtext</Label>
                                <Textarea
                                    value={data.signupDescription || ""}
                                    onChange={(e) => handleChange("signupDescription", e.target.value)}
                                    placeholder="Create an account to verify your booking."
                                    className="border-slate-200 focus:border-blue-500 resize-none"
                                    rows={2}
                                />
                            </div>
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    );
}
