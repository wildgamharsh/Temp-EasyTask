'use client';

import React, { useState, useEffect } from "react";
import { GeneralInfoStep } from "@/components/dashboard/services/steps/GeneralInfoStep";
import { ServiceBuilder } from "@/components/pricing/builder/ServiceBuilder";
import { ConsumerPreview } from "@/components/pricing/preview/ConsumerPreview";
import { Service, PricingMode } from '@/types/pricing';
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createService } from "@/lib/supabase-data";
import { createClient } from "@/lib/supabase/client";
import { savePricingConfiguration } from "@/lib/pricing/data";
import { WEDDING_SAMPLE_CONFIG } from "@/lib/pricing/sample-data";
import { Edit3, Eye, ArrowLeft } from "lucide-react";

const INITIAL_SERVICE_CONFIG: Service = {
    id: `srv-${Date.now()}`,
    name: 'New Custom Service',
    description: '',
    pricingMode: PricingMode.CONFIGURED,
    steps: [],
    rules: [],
    basePrice: 0
};

interface ServiceFormData {
    title: string;
    description: string;
    images: string[];
    highlights: string[];
}

const INITIAL_DATA: ServiceFormData = {
    title: "",
    description: "",
    images: [],
    highlights: [],
};

export default function NewServicePage() {
    const router = useRouter();
    const [step, setStep] = useState<"general" | "pricing">("general");
    const [formData, setFormData] = useState<ServiceFormData>(INITIAL_DATA);
    const [serviceConfig, setServiceConfig] = useState<Service>(INITIAL_SERVICE_CONFIG);
    const [pricingTab, setPricingTab] = useState<'builder' | 'preview'>('builder');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }
        };
        getUser();
    }, []);

    const updateFormData = (updates: Partial<ServiceFormData>) => {
        setFormData((prev) => ({ ...prev, ...updates }));
        if (updates.description !== undefined) {
            setServiceConfig(prev => ({ ...prev, description: updates.description! }));
        }
        if (updates.title !== undefined) {
            setServiceConfig(prev => ({ ...prev, name: updates.title! }));
        }
    };

    const handlePricingUpdate = (updated: Service) => {
        setServiceConfig(updated);
    };

    const handleNext = () => {
        if (step === "general") {
            if (!formData.title || formData.title.length < 5) {
                toast.error("Please enter a valid service title (min 5 chars)");
                return;
            }
            setServiceConfig(prev => ({
                ...prev,
                name: formData.title,
                description: formData.description
            }));
            setStep("pricing");
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (step === "pricing") {
            setStep("general");
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error("You must be logged in to create a service");
                return;
            }

            const newService = await createService({
                organizerId: user.id,
                title: formData.title,
                description: formData.description,
                images: formData.images,
                features: formData.highlights,
                basePrice: 0,
                pricingType: "fixed",
                pricing_model: "fixed",
                province: "Ontario",
                minGuests: 0,
                maxGuests: 0,
                isActive: true,
            });

            if (newService && newService.id) {
                await savePricingConfiguration(
                    newService.id,
                    serviceConfig.steps,
                    serviceConfig.rules
                );
            }

            console.log("Saving Service Config:", serviceConfig);
            toast.success("Service created successfully!");
            router.push("/dashboard/services");

        } catch (error) {
            console.error("Error creating service:", error);
            toast.error("Failed to create service. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const fillSampleData = () => {
        setFormData({
            title: WEDDING_SAMPLE_CONFIG.name,
            description: WEDDING_SAMPLE_CONFIG.description,
            images: [
                "https://img.pikbest.com/photo/20241215/luxury-wedding-stage-decor-with-pink-flowers-and-red-carpet_11258184.jpg!sw800",
                "https://static.vecteezy.com/system/resources/previews/018/740/503/non_2x/beautiful-wedding-stage-for-groom-and-bride-photo.jpg",
                "https://media.gettyimages.com/id/1445272650/video/luxury-dinner-table-in-a-wedding-invitation-wedding-decoration-wedding-dinner-table-wedding.jpg?s=640x640&k=20&c=n85Uphj0dw3xDDoKkthbSqoejb3Gbc-R3pqsw6_P3yc=",
                "https://static.vecteezy.com/system/resources/thumbnails/053/808/762/small_2x/wedding-party-decoration-scene-background-free-photo.jpeg"
            ],
            highlights: ["3 Package Tiers (Basic, Gold, Diamond)", "5 Stunning Wedding Themes", "Professional Catering & Bar Services", "Premium Add-ons Available"],
        });

        setServiceConfig({
            ...WEDDING_SAMPLE_CONFIG,
            id: `temp-${Date.now()}`
        });

        if (step === "general") {
            setStep("pricing");
        }

        toast.success("Wedding Decoration Sample Loaded! 🌸");
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {step === "general" ? (
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-900">General Information</h1>
                        <p className="text-slate-500 mt-1">Let&apos;s start with the basics of your service.</p>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <GeneralInfoStep
                            data={{
                                title: formData.title,
                                description: formData.description,
                                images: formData.images,
                                highlights: formData.highlights,
                            }}
                            onUpdate={updateFormData}
                            organizerId={userId || undefined}
                            serviceId={serviceConfig.id}
                        />
                    </div>

                    <div className="mt-8 flex items-center justify-between">
                        <div />
                        <button
                            onClick={handleNext}
                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Continue to Pricing
                        </button>
                    </div>
                </div>
            ) : (
                <div className="h-screen flex flex-col">
                    <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                <ArrowLeft size={20} />
                                <span className="font-medium">Back</span>
                            </button>
                            <div className="h-6 w-px bg-slate-300" />
                            <h1 className="text-lg font-bold text-slate-900">{formData.title || "New Service"}</h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex p-1 bg-slate-100 rounded-lg border border-slate-200">
                                <button
                                    onClick={() => setPricingTab('builder')}
                                    className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-all ${pricingTab === 'builder'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                >
                                    <Edit3 size={16} />
                                    Builder
                                </button>
                                <button
                                    onClick={() => setPricingTab('preview')}
                                    className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-all ${pricingTab === 'preview'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                >
                                    <Eye size={16} />
                                    Preview
                                </button>
                            </div>

                            <button
                                onClick={fillSampleData}
                                className="text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
                            >
                                <span className="text-lg">✨</span>
                                <span>Fill Sample</span>
                            </button>

                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? "Publishing..." : "Publish"}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        {pricingTab === 'builder' ? (
                            <ServiceBuilder
                                service={serviceConfig}
                                onChange={handlePricingUpdate}
                                fullPage={true}
                            />
                        ) : (
                            <div className="h-full">
                                <ConsumerPreview service={serviceConfig} />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
