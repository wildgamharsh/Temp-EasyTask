/**
 * Storefront Builder Wizard - Client Component
 * 3-step wizard for business setup, content, and design
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Check, ChevronRight, LayoutDashboard,
    Palette, Image as ImageIcon, Lock,
    Globe, ExternalLink, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { OrganizerProfile, StorefrontSettings } from "@/lib/database.types";

// Import step components
import BusinessInfoStep, { BusinessInfoData } from "./steps/BusinessInfoStep";
import ContentStep from "./steps/ContentStep";
import DesignStep from "./steps/DesignStep";
import AuthPagesStep from "./steps/AuthPagesStep";

interface StorefrontBuilderWizardProps {
    profile: OrganizerProfile;
    initialSettings: StorefrontSettings | null;
}

const STEPS = [
    {
        id: 1,
        name: "Business Info",
        description: "Core business details",
        icon: LayoutDashboard
    },
    {
        id: 2,
        name: "Branding & Design",
        description: "Colors and templates",
        icon: Palette
    },
    {
        id: 3,
        name: "Content & Homepage",
        description: "Hero, gallery, testimonials",
        icon: ImageIcon
    },
    {
        id: 4,
        name: "Login & Signup",
        description: "Authentication pages",
        icon: Lock
    },
];

export default function StorefrontBuilderWizard({ profile, initialSettings }: StorefrontBuilderWizardProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    // Form data state
    const [businessData, setBusinessData] = useState<BusinessInfoData>({
        businessName: profile.business_name || "",
        subdomain: profile.subdomain || "",
        shortDescription: "",
        logoUrl: profile.logo_url || "",
        aboutUs: profile.description || "",
        contactEmail: initialSettings?.contact_email || "",
        contactPhone: initialSettings?.contact_phone || "",
        address: initialSettings?.address || "",
        socialLinks: initialSettings?.social_links || {},
        pricingDisplay: initialSettings?.pricing_display ?? true,
    });

    const [contentData, setContentData] = useState({
        testimonials: initialSettings?.testimonials || [],
        galleryImages: initialSettings?.gallery_images || [],
        galleryTestimonials: initialSettings?.gallery_testimonials || [],
        heroTitle: initialSettings?.hero_title || `Welcome to ${profile.business_name}`,
        heroSubtitle: initialSettings?.hero_subtitle || "",
        bannerUrl: initialSettings?.banner_url || "",
        showHero: initialSettings?.show_hero ?? true,
        showAbout: initialSettings?.show_about ?? false,
        showTestimonials: initialSettings?.show_testimonials ?? false,
        showGallery: initialSettings?.show_gallery ?? false,
        showContact: initialSettings?.show_contact ?? true,
        showSocialLinks: initialSettings?.show_social_links ?? true,
    });

    const [authData, setAuthData] = useState({
        authDescription: initialSettings?.auth_description || "",
        loginHeading: initialSettings?.login_heading || "",
        loginDescription: initialSettings?.login_description || "",
        signupHeading: initialSettings?.signup_heading || "",
        signupDescription: initialSettings?.signup_description || "",
        authBackgroundUrl: initialSettings?.auth_background_url || "",
    });

    const [designData, setDesignData] = useState<{
        template?: 'modern' | 'classic' | 'elegant';
        templateCategory?: import("@/lib/database.types").TemplateCategory;
        fontFamily: string;
        templateColors?: {
            goldPrimary: string;
            goldDark: string;
            charcoalPrimary: string;
            charcoalDark: string;
            bgLight: string;
            bgCard: string;
            textPrimary: string;
            textSecondary: string;
            textMuted: string;
            borderLight: string;
            borderGold: string;
        };
        themeColors: {
            primary: string;
            secondary: string;
            accent: string;
            background: string;
            text: string;
            muted: string;
        };
    }>({
        template: 'elegant',
        templateCategory: 'variant-claude-sonnet-4',
        fontFamily: initialSettings?.font_family || 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        // Initialize templateColors from theme_colors if available
        templateColors: initialSettings?.theme_colors ? {
            goldPrimary: initialSettings.theme_colors.primary || '#D4AF37',
            goldDark: initialSettings.theme_colors.secondary || '#B8941F',
            charcoalPrimary: initialSettings.theme_colors.text || '#2C2C2C',
            charcoalDark: '#1a1a1a',
            bgLight: initialSettings.theme_colors.background || '#F8F8F8',
            bgCard: '#ffffff',
            textPrimary: initialSettings.theme_colors.text || '#2C2C2C',
            textSecondary: initialSettings.theme_colors.muted || '#6b7280',
            textMuted: '#9ca3af',
            borderLight: '#e5e7eb',
            borderGold: initialSettings.theme_colors.accent || '#D4AF37',
        } : undefined,
        themeColors: initialSettings?.theme_colors || {
            primary: '#2563eb',
            secondary: '#1d4ed8',
            accent: '#f59e0b',
            background: '#ffffff',
            text: '#1f2937',
            muted: '#6b7280',
        },
    });

    const handleStepClick = (stepId: number) => {
        setCurrentStep(stepId);
    };

    const handlePublishClick = () => {
        // Check if subdomain has changed
        if (businessData.subdomain !== profile.subdomain) {
            setIsConfirmOpen(true);
        } else {
            handlePublish();
        }
    };

    const handlePublish = async () => {
        setIsLoading(true);
        setIsConfirmOpen(false); // Close modal if open

        try {
            const { saveStorefrontSettings } = await import("./actions");

            const result = await saveStorefrontSettings({
                businessData,
                contentData: {
                    ...contentData,
                    ...authData, // Merge auth data into content data for saving
                },
                designData: {
                    ...designData,
                    template: designData.template || 'elegant',
                },
                subdomain: businessData.subdomain !== profile.subdomain ? businessData.subdomain : undefined,
            });

            if (!result.success) {
                toast.error(result.error || "Failed to save settings");
                return;
            }

            toast.success("Storefront published successfully!");
            router.push("/dashboard");
        } catch (error) {
            console.error("Error publishing storefront:", error);
            toast.error("Failed to publish storefront");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAiGenerate = async (businessName: string, model: string, apiKey?: string) => {
        setIsLoading(true);
        try {
            const { generateStorefrontContent } = await import("./actions");
            const result = await generateStorefrontContent(businessName, model, apiKey);

            if (result.success && result.data) {
                const aiData = result.data;

                // Update Business Data
                setBusinessData(prev => ({
                    ...prev,
                    shortDescription: aiData.shortDescription || prev.shortDescription,
                    aboutUs: aiData.aboutUs || prev.aboutUs,
                    contactEmail: aiData.contactEmail || prev.contactEmail,
                    contactPhone: aiData.contactPhone || prev.contactPhone,
                    address: aiData.address || prev.address,
                }));

                // Update Content Data
                setContentData(prev => ({
                    ...prev,
                    heroTitle: aiData.heroTitle || prev.heroTitle,
                    heroSubtitle: aiData.heroSubtitle || prev.heroSubtitle,
                    testimonials: aiData.testimonials || prev.testimonials,
                }));

                toast.success("Profile generated successfully!");
            } else {
                toast.error(result.error || "Failed to generate profile");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-full overflow-hidden bg-slate-50">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col z-10 shadow-sm">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-blue-600" />
                        Store Builder
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Configure your online presence</p>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {STEPS.map((step) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        return (
                            <button
                                key={step.id}
                                onClick={() => handleStepClick(step.id)}
                                className={cn(
                                    "w-full text-left flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group",
                                    isActive
                                        ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-md flex items-center justify-center transition-colors",
                                    isActive ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                                )}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{step.name}</p>
                                    <p className={cn("text-xs", isActive ? "text-blue-500" : "text-slate-400")}>
                                        {step.description}
                                    </p>
                                </div>
                                {isActive && <ChevronRight className="w-4 h-4 text-blue-400" />}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100 bg-slate-50/30">
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <Globe className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-500 truncate flex-1">
                            {businessData.subdomain ? `${businessData.subdomain}.easytask.com` : 'your-site.easytask.com'}
                        </span>
                        <a href="#" className="hidden hover:text-blue-600"><ExternalLink className="w-3 h-3" /></a>
                    </div>
                    <Button
                        onClick={handlePublishClick}
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 transition-all hover:shadow-lg hover:shadow-blue-300"
                    >
                        {isLoading ? "Publishing..." : "Publish Changes"}
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative scroll-smooth flex flex-col">
                <div className="flex-1 max-w-5xl mx-auto p-8 lg:p-12 pb-24 w-full">
                    {currentStep === 1 && (
                        <BusinessInfoStep
                            data={businessData}
                            onChange={setBusinessData}
                            onAiGenerate={handleAiGenerate}
                        />
                    )}
                    {currentStep === 2 && (
                        <DesignStep
                            data={designData}
                            onChange={setDesignData}
                            businessName={businessData.businessName}
                        />
                    )}
                    {currentStep === 3 && (
                        <ContentStep
                            data={contentData}
                            onChange={setContentData}
                            businessData={businessData}
                            onBusinessChange={setBusinessData}
                        />
                    )}
                    {currentStep === 4 && (
                        <AuthPagesStep
                            data={authData}
                            onChange={(d) => setAuthData(d)}
                            businessName={businessData.businessName}
                        />
                    )}

                    {/* Inline Next Button */}
                    {currentStep < 4 && (
                        <div className="flex justify-end mt-8 pt-6 border-t border-slate-100">
                            <Button
                                onClick={() => setCurrentStep(prev => Math.min(prev + 1, 4))}
                                size="lg"
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/10 rounded-lg px-8 py-6 text-lg font-medium transition-all hover:translate-x-1 flex items-center gap-2"
                            >
                                Next Step
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>
                    )}
                </div>
            </main>

            {/* Confirmation Modal */}
            {
                isConfirmOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <Card className="w-full max-w-md p-6 space-y-4 shadow-xl border-0">
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                    Change Subdomain?
                                </h3>
                                <p className="text-sm text-slate-600">
                                    You are about to change your storefront address from <strong className="text-slate-900">{profile.subdomain}</strong> to <strong className="text-green-600">{businessData.subdomain}</strong>.
                                </p>
                                <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-md border border-yellow-100">
                                    ⚠️ The old address will be released and may be taken by another business. Links to your old address will stop working.
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="outline" onClick={() => setIsConfirmOpen(false)} className="border-slate-200">
                                    Cancel
                                </Button>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handlePublish} disabled={isLoading}>
                                    {isLoading ? "Updating..." : "Confirm & Publish"}
                                </Button>
                            </div>
                        </Card>
                    </div>
                )
            }
        </div >
    );
}
