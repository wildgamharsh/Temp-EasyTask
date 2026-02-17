"use client";


import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
    checkSubdomainAvailability,
    updateOrganizerSubdomain,
    getProfile,
    getStorefrontSettings,
    upsertStorefrontSettings,
    uploadGalleryImages,
    updateOrganizerProfile,
} from "@/lib/supabase-data";
import { Check, X, Loader2, ExternalLink, Globe, Palette, Settings, Image as ImageIcon, Upload, Trash2 } from "lucide-react";

export default function StorefrontSettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const supabase = createClient();

    // Subdomain state
    const [subdomain, setSubdomain] = useState("");
    const [currentSubdomain, setCurrentSubdomain] = useState("");
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [storefrontEnabled, setStorefrontEnabled] = useState(false);

    // Storefront settings state
    const [settings, setSettings] = useState({
        business_name: "",
        tagline: "",
        primary_color: "#3b82f6",
        secondary_color: "#8b5cf6",
        accent_color: "#10b981",
        about_text: "",
        contact_email: "",
        contact_phone: "",
        address: "",
        meta_title: "",
        meta_description: "",
    });

    // Gallery state
    const [gallery, setGallery] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [galleryInput, setGalleryInput] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setUser(user);
            }
        });
    }, []);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const [profile, storefrontSettings] = await Promise.all([
                getProfile(user.id),
                getStorefrontSettings(user.id),
            ]);

            if (profile) {
                setCurrentSubdomain(profile.subdomain || "");
                setSubdomain(profile.subdomain || "");
                setStorefrontEnabled(profile.storefront_enabled || false);
                setGallery(profile.gallery || []);
            }

            if (storefrontSettings) {
                setSettings({
                    business_name: storefrontSettings.business_name || "",
                    tagline: storefrontSettings.tagline || "",
                    primary_color: storefrontSettings.primary_color || "#3b82f6",
                    secondary_color: storefrontSettings.secondary_color || "#8b5cf6",
                    accent_color: storefrontSettings.accent_color || "#10b981",
                    about_text: storefrontSettings.about_text || "",
                    contact_email: storefrontSettings.contact_email || "",
                    contact_phone: storefrontSettings.contact_phone || "",
                    address: storefrontSettings.address || "",
                    meta_title: storefrontSettings.meta_title || "",
                    meta_description: storefrontSettings.meta_description || "",
                });
            }
        } catch (error) {
            console.error("Error loading data:", error);
            toast.error("Failed to load storefront settings");
        } finally {
            setLoading(false);
        }
    };

    const handleCheckAvailability = async () => {
        if (!subdomain || subdomain.length < 3) {
            toast.error("Subdomain must be at least 3 characters");
            return;
        }

        setCheckingAvailability(true);
        try {
            const available = await checkSubdomainAvailability(subdomain.toLowerCase());
            setIsAvailable(available);

            if (available) {
                toast.success("Subdomain is available!");
            } else {
                toast.error("Subdomain is already taken");
            }
        } catch (error) {
            console.error("Error checking availability:", error);
            toast.error("Failed to check availability");
        } finally {
            setCheckingAvailability(false);
        }
    };

    const handleSaveSubdomain = async () => {
        if (!user || !subdomain || !isAvailable) return;

        setSaving(true);
        try {
            const result = await updateOrganizerSubdomain(user.id, subdomain.toLowerCase());

            if (result.success) {
                setCurrentSubdomain(subdomain.toLowerCase());
                setStorefrontEnabled(true);
                toast.success("Subdomain saved successfully!");
            } else {
                toast.error(result.error || "Failed to save subdomain");
            }
        } catch (error) {
            console.error("Error saving subdomain:", error);
            toast.error("Failed to save subdomain");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSettings = async () => {
        if (!user) return;

        setSaving(true);
        try {
            await upsertStorefrontSettings(user.id, settings);
            toast.success("Storefront settings saved successfully!");
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    // Gallery Handlers
    const handleAddGalleryUrl = async () => {
        if (!user || !galleryInput.trim()) return;

        try {
            const newGallery = [...gallery, galleryInput.trim()];
            await updateOrganizerProfile(user.id, { gallery: newGallery });
            setGallery(newGallery);
            setGalleryInput("");
            toast.success("Image added to gallery");
        } catch (error) {
            console.error("Error adding gallery image:", error);
            toast.error("Failed to add image");
        }
    };

    const handleDeleteGalleryImage = async (index: number) => {
        if (!user) return;

        try {
            const newGallery = gallery.filter((_, i) => i !== index);
            await updateOrganizerProfile(user.id, { gallery: newGallery });
            setGallery(newGallery);
            toast.success("Image removed");
        } catch (error) {
            console.error("Error removing gallery image:", error);
            toast.error("Failed to remove image");
        }
    };

    const handleFileUpload = async (files: FileList | null) => {
        if (!user || !files || files.length === 0) return;

        setUploading(true);
        try {
            const fileArray = Array.from(files);
            // Use existing utility that handles upload + profile update
            const uploadedUrls = await uploadGalleryImages(fileArray, user.id);
            setGallery(prev => [...prev, ...uploadedUrls]);
            toast.success(`Uploaded ${uploadedUrls.length} images`);
        } catch (error) {
            console.error("Error uploading images:", error);
            toast.error("Failed to upload images");
        } finally {
            setUploading(false);
            setIsDragging(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            await handleFileUpload(files);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Storefront Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your online storefront and customize your booking page
                </p>
            </div>

            <Tabs defaultValue="subdomain" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="subdomain">
                        <Globe className="w-4 h-4 mr-2" />
                        Subdomain
                    </TabsTrigger>
                    <TabsTrigger value="branding">
                        <Palette className="w-4 h-4 mr-2" />
                        Branding
                    </TabsTrigger>
                    <TabsTrigger value="content">
                        <Settings className="w-4 h-4 mr-2" />
                        Content
                    </TabsTrigger>
                    <TabsTrigger value="gallery">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Gallery
                    </TabsTrigger>
                </TabsList>

                {/* Subdomain Tab */}
                <TabsContent value="subdomain">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Storefront URL</CardTitle>
                            <CardDescription>
                                Choose a unique subdomain for your online booking page
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {currentSubdomain && storefrontEnabled && (
                                <Alert>
                                    <Check className="w-4 h-4" />
                                    <AlertDescription>
                                        Your storefront is live at:{" "}
                                        <a
                                            href={`https://${currentSubdomain}.easytask.com`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                                        >
                                            {currentSubdomain}.easytask.com
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="subdomain">Subdomain</Label>
                                    <div className="flex gap-2 mt-2">
                                        <div className="flex-1 flex items-center gap-2">
                                            <Input
                                                id="subdomain"
                                                value={subdomain}
                                                onChange={(e) => {
                                                    setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                                                    setIsAvailable(null);
                                                }}
                                                placeholder="your-business"
                                                className="flex-1"
                                            />
                                            <span className="text-muted-foreground whitespace-nowrap">
                                                .easytask.com
                                            </span>
                                        </div>
                                        <Button
                                            onClick={handleCheckAvailability}
                                            disabled={checkingAvailability || !subdomain || subdomain === currentSubdomain}
                                            variant="outline"
                                        >
                                            {checkingAvailability ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                "Check"
                                            )}
                                        </Button>
                                    </div>
                                    {isAvailable !== null && (
                                        <p className={`text-sm mt-2 flex items-center gap-2 ${isAvailable ? "text-green-600" : "text-red-600"}`}>
                                            {isAvailable ? (
                                                <>
                                                    <Check className="w-4 h-4" />
                                                    Available! Click save to claim it.
                                                </>
                                            ) : (
                                                <>
                                                    <X className="w-4 h-4" />
                                                    Already taken. Try another.
                                                </>
                                            )}
                                        </p>
                                    )}
                                </div>

                                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                                    <p className="text-sm font-medium">Subdomain Requirements:</p>
                                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                        <li>3-63 characters long</li>
                                        <li>Lowercase letters, numbers, and hyphens only</li>
                                        <li>Must start and end with a letter or number</li>
                                        <li>Cannot use reserved words (admin, api, www, etc.)</li>
                                    </ul>
                                </div>

                                <Button
                                    onClick={handleSaveSubdomain}
                                    disabled={!isAvailable || saving || subdomain === currentSubdomain}
                                    className="w-full"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Subdomain"
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Branding Tab */}
                <TabsContent value="branding">
                    <Card>
                        <CardHeader>
                            <CardTitle>Branding & Theme</CardTitle>
                            <CardDescription>
                                Customize the look and feel of your storefront
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="business_name">Business Name</Label>
                                    <Input
                                        id="business_name"
                                        value={settings.business_name}
                                        onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                                        placeholder="Your Business Name"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="tagline">Tagline</Label>
                                    <Input
                                        id="tagline"
                                        value={settings.tagline}
                                        onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                                        placeholder="Your catchy tagline"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="mb-4 block">Theme Colors</Label>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="primary_color" className="text-sm">Primary</Label>
                                        <div className="flex gap-2 items-center mt-1">
                                            <Input
                                                id="primary_color"
                                                type="color"
                                                value={settings.primary_color}
                                                onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                                                className="h-10 w-20"
                                            />
                                            <Input
                                                value={settings.primary_color}
                                                onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="secondary_color" className="text-sm">Secondary</Label>
                                        <div className="flex gap-2 items-center mt-1">
                                            <Input
                                                id="secondary_color"
                                                type="color"
                                                value={settings.secondary_color}
                                                onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                                                className="h-10 w-20"
                                            />
                                            <Input
                                                value={settings.secondary_color}
                                                onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="accent_color" className="text-sm">Accent</Label>
                                        <div className="flex gap-2 items-center mt-1">
                                            <Input
                                                id="accent_color"
                                                type="color"
                                                value={settings.accent_color}
                                                onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                                                className="h-10 w-20"
                                            />
                                            <Input
                                                value={settings.accent_color}
                                                onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button onClick={handleSaveSettings} disabled={saving} className="w-full">
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Branding"
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Content Tab */}
                <TabsContent value="content">
                    <Card>
                        <CardHeader>
                            <CardTitle>Content & Contact</CardTitle>
                            <CardDescription>
                                Manage your storefront content and contact information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label htmlFor="about_text">About Your Business</Label>
                                <Textarea
                                    id="about_text"
                                    value={settings.about_text}
                                    onChange={(e) => setSettings({ ...settings, about_text: e.target.value })}
                                    placeholder="Tell customers about your business..."
                                    rows={6}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="contact_email">Contact Email</Label>
                                    <Input
                                        id="contact_email"
                                        type="email"
                                        value={settings.contact_email}
                                        onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                                        placeholder="contact@yourbusiness.com"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="contact_phone">Contact Phone</Label>
                                    <Input
                                        id="contact_phone"
                                        type="tel"
                                        value={settings.contact_phone}
                                        onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="address">Business Address</Label>
                                <Textarea
                                    id="address"
                                    value={settings.address}
                                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                    placeholder="Your business address..."
                                    rows={3}
                                />
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="font-semibold mb-4">SEO Settings</h3>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="meta_title">Page Title</Label>
                                        <Input
                                            id="meta_title"
                                            value={settings.meta_title}
                                            onChange={(e) => setSettings({ ...settings, meta_title: e.target.value })}
                                            placeholder="Your Business Name - Event Services"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="meta_description">Meta Description</Label>
                                        <Textarea
                                            id="meta_description"
                                            value={settings.meta_description}
                                            onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })}
                                            placeholder="A brief description of your services for search engines..."
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button onClick={handleSaveSettings} disabled={saving} className="w-full">
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Content"
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>


                {/* Gallery Tab */}
                <TabsContent value="gallery">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gallery Images</CardTitle>
                            <CardDescription>
                                Showcase your best work. Drag and drop images, upload files, or paste URLs.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Drag and Drop Zone */}
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`
                                    border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
                                    flex flex-col items-center justify-center gap-4
                                    ${isDragging
                                        ? "border-primary bg-primary/5 scale-[0.99]"
                                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                    }
                                `}
                            >
                                <div className={`p-4 rounded-full ${isDragging ? "bg-primary/10" : "bg-slate-100"}`}>
                                    <Upload className={`w-8 h-8 ${isDragging ? "text-primary" : "text-slate-400"}`} />
                                </div>

                                <div className="space-y-1">
                                    <p className="font-medium text-slate-900">
                                        {uploading ? "Uploading..." : "Drag & drop images here"}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        or click below to browse files
                                    </p>
                                </div>

                                <div className="flex gap-4 items-center w-full max-w-sm justify-center">
                                    <div className="relative">
                                        <Input
                                            type="file"
                                            className="hidden"
                                            id="file-upload"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload(e.target.files)}
                                            disabled={uploading}
                                        />
                                        <Button asChild variant="secondary" disabled={uploading}>
                                            <Label htmlFor="file-upload" className="cursor-pointer">
                                                Select Files
                                            </Label>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-slate-200"></div>
                                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase">Or add via URL</span>
                                <div className="flex-grow border-t border-slate-200"></div>
                            </div>

                            {/* URL Input */}
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Paste image URL..."
                                    value={galleryInput}
                                    onChange={(e) => setGalleryInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddGalleryUrl()}
                                />
                                <Button onClick={handleAddGalleryUrl} disabled={!galleryInput.trim()}>
                                    Add Link
                                </Button>
                            </div>

                            {/* Gallery Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                {gallery.map((url, index) => (
                                    <div key={index} className="group relative aspect-square rounded-lg overflow-hidden border bg-slate-100">
                                        <img
                                            src={url}
                                            alt={`Gallery ${index + 1}`}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => handleDeleteGalleryImage(index)}
                                                className="h-8 w-8"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div >
    );
}
