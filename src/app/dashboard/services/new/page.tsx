'use client';

import React, { useState, useEffect } from "react";
import { ServiceWorkflowLayout } from "@/components/dashboard/services/ServiceWorkflowLayout";
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
import { Edit3, Eye } from "lucide-react";

// Initial Empty Service for the Framework
const INITIAL_SERVICE_CONFIG: Service = {
    id: `srv-${Date.now()}`,
    name: 'New Custom Service',
    description: '',
    pricingMode: PricingMode.CONFIGURED,
    steps: [],
    rules: [],
    basePrice: 0
};

// Mock Form Data (Subset of original to keep General Info working)
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

    // Pricing Framework State
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
        // Sync Helper: Update description in service config if changed in general info
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
            // Sync title/desc to service config on transition
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

            // TODO: In a real implementation, we would save the 'serviceConfig' JSON 
            // to a 'configuration' column or related table in the database.
            // For now, we create the base service record mostly empty.

            const newService = await createService({
                organizerId: user.id,
                title: formData.title,
                description: formData.description,
                images: formData.images,
                features: formData.highlights,

                // Defaults for legacy compatibility
                basePrice: 0,
                pricingType: "fixed",
                pricing_model: "fixed", // Placeholder
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
        // 1. Fill General Info
        setFormData({
            title: WEDDING_SAMPLE_CONFIG.name,
            description: WEDDING_SAMPLE_CONFIG.description,
            images: [
                "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?auto=format&fit=crop&q=80&w=1200",
                "https://images.unsplash.com/photo-1519225421980-715cb0202128?auto=format&fit=crop&q=80&w=1200"
            ],
            highlights: ["Theme-based Customization", "Floral Density Options", "Luxury Add-ons"],
        });

        // 2. Fill Pricing Config
        setServiceConfig({
            ...WEDDING_SAMPLE_CONFIG,
            // ID will be overwritten on save, but good to have a temp one
            id: `temp-${Date.now()}`
        });

        toast.success("Sweetie's Wedding Sample Loaded! 🌸");
    };

    return (
        <ServiceWorkflowLayout
            currentStep={step}
            title={step === "general" ? "General Information" : "Pricing Configuration"}
            subtitle={step === "general" ? "Let's start with the basics of your service." : "Configure your dynamic pricing framework."}
            onNext={handleNext}
            onBack={step === "pricing" ? handleBack : undefined}
            nextLabel={step === "general" ? "Continue to Pricing" : "Publish Service"}
            isNextLoading={isSubmitting}
            headerAction={
                <button
                    onClick={fillSampleData}
                    className="text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
                >
                    <span className="text-lg">✨</span>
                    <span className="hidden sm:inline">Fill Sample Data</span>
                </button>
            }
        >
            {step === "general" ? (
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
            ) : (
                <div className="space-y-6">
                    {/* Visual Tabs for Builder vs Preview */}
                    <div className="flex p-1 bg-slate-100 rounded-lg w-fit border border-slate-200">
                        <button
                            onClick={() => setPricingTab('builder')}
                            className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-all ${pricingTab === 'builder'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-900'
                                }`}
                        >
                            <Edit3 size={16} />
                            Builder & Graph
                        </button>
                        <button
                            onClick={() => setPricingTab('preview')}
                            className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-all ${pricingTab === 'preview'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-900'
                                }`}
                        >
                            <Eye size={16} />
                            Consumer Preview
                        </button>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                        {pricingTab === 'builder' ? (
                            <div>
                                <ServiceBuilder
                                    service={serviceConfig}
                                    onChange={handlePricingUpdate}
                                    fullPage={true}
                                />
                            </div>
                        ) : (
                            <div className="h-[600px] bg-slate-50 overflow-y-auto">
                                <ConsumerPreview service={serviceConfig} />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </ServiceWorkflowLayout>
    );
}
