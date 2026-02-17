"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
    ArrowLeft,
    Loader2,
    Save,
    Eye,
    Edit3,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/BackButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LegacyService as DbService } from "@/lib/database.types";
import { getService, updateService } from "@/lib/supabase-data";
import { getPricingConfiguration, savePricingConfiguration } from "@/lib/pricing/data";
import { Service, PricingMode } from "@/types/pricing";
import { ServiceBuilder } from "@/components/pricing/builder/ServiceBuilder";
import { ConsumerPreview } from "@/components/pricing/preview/ConsumerPreview";
import { calculatePriceRange } from "@/lib/pricing/pricing-engine";

// Empty initial config
const INITIAL_SERVICE_CONFIG: Service = {
    id: "",
    name: "",
    description: "",
    pricingMode: PricingMode.CONFIGURED,
    steps: [],
    rules: [],
    basePrice: 0
};

export default function EditPricingServicePage() {
    const params = useParams();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Basic Service Data
    const [dbService, setDbService] = useState<DbService | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [imageInput, setImageInput] = useState("");

    // Pricing Framework Data
    const [serviceConfig, setServiceConfig] = useState<Service>(INITIAL_SERVICE_CONFIG);
    const [activeTab, setActiveTab] = useState<'details' | 'builder' | 'preview'>('details');

    useEffect(() => {
        async function loadData() {
            const id = params.id as string;
            if (!id) return;

            try {
                // 1. Fetch Basic Service Data
                const service = await getService(id);
                if (!service) {
                    toast.error("Service not found");
                    return;
                }
                setDbService(service);
                setTitle(service.title);
                setDescription(service.description);
                setImages(service.images || []);

                // 2. Fetch Pricing Configuration
                const pricingConfig = await getPricingConfiguration(id);
                if (pricingConfig) {
                    // Map DB Pricing Config to UI Service Object
                    setServiceConfig({
                        id: service.id,
                        name: service.title,
                        description: service.description,
                        pricingMode: PricingMode.CONFIGURED,
                        steps: Array.isArray(pricingConfig.steps) ? pricingConfig.steps : [],
                        rules: Array.isArray(pricingConfig.rules) ? pricingConfig.rules : [],
                        basePrice: 0,
                        metadata: {}
                    });
                } else {
                    // Initialize with empty if none exists
                    setServiceConfig({
                        id: service.id,
                        name: service.title,
                        description: service.description,
                        pricingMode: PricingMode.CONFIGURED,
                        steps: [],
                        rules: [],
                        basePrice: 0
                    });
                }
            } catch (err) {
                console.error("Error loading service:", err);
                toast.error("Failed to load service details");
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [params.id]);

    // Handlers
    const addImage = () => {
        if (imageInput.trim() && !images.includes(imageInput.trim())) {
            setImages([...images, imageInput.trim()]);
            setImageInput("");
        }
    };
    const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index));

    const handlePricingUpdate = (updated: Service) => {
        setServiceConfig(updated);
    };

    const handleSave = async () => {
        if (!dbService) return;
        setIsSaving(true);
        try {

            // 1.5 Calculate Min/Max Price Range based on Config
            const { minPrice } = calculatePriceRange(
                serviceConfig.basePrice,
                serviceConfig.steps,
                serviceConfig.rules
            );

            // 1. Update Basic Info (including Calculated Base Price for Search/Display)
            const basicUpdate = await updateService(dbService.id, {
                title,
                description,
                images,
                // basePrice column is removed, so we don't save it to the service record
            });

            if (!basicUpdate) throw new Error("Failed to update basic info");

            // 2. Save Pricing Configuration
            await savePricingConfiguration(
                dbService.id,
                serviceConfig.steps,
                serviceConfig.rules
            );

            toast.success("Service updated successfully!");
            router.refresh();
        } catch (error) {
            console.error("Error updating service:", error);
            toast.error("Failed to update service");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!dbService) return <div className="p-8">Service not found</div>;

    return (
        <div className="space-y-6 max-w-7xl pb-20 fade-in animate-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="mr-2">
                        <BackButton href="/dashboard/services" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Edit Service (Pricing Framework)</h1>
                        <p className="text-muted-foreground">
                            ID: {dbService.id}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b pb-1">
                <button
                    onClick={() => setActiveTab('details')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'details'
                        ? 'bg-white border text-blue-600 border-b-white translate-y-px'
                        : 'text-slate-500 hover:text-slate-900 bg-slate-50'
                        }`}
                >
                    Basic Details
                </button>
                <button
                    onClick={() => setActiveTab('builder')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg flex items-center gap-2 transition-colors ${activeTab === 'builder'
                        ? 'bg-white border text-blue-600 border-b-white translate-y-px'
                        : 'text-slate-500 hover:text-slate-900 bg-slate-50'
                        }`}
                >
                    <Edit3 size={14} />
                    Pricing Builder
                </button>
                <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg flex items-center gap-2 transition-colors ${activeTab === 'preview'
                        ? 'bg-white border text-blue-600 border-b-white translate-y-px'
                        : 'text-slate-500 hover:text-slate-900 bg-slate-50'
                        }`}
                >
                    <Eye size={14} />
                    Preview
                </button>
            </div>

            <div className="min-h-[600px]">
                {/* DETAILS TAB */}
                {activeTab === 'details' && (
                    <div className="space-y-6 max-w-2xl">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Service Title</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => {
                                            setTitle(e.target.value);
                                            setServiceConfig(prev => ({ ...prev, name: e.target.value }));
                                        }}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <textarea
                                        id="description"
                                        rows={4}
                                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                                        value={description}
                                        onChange={(e) => {
                                            setDescription(e.target.value);
                                            setServiceConfig(prev => ({ ...prev, description: e.target.value }));
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Images</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-3">
                                    {images.map((image, index) => (
                                        <div key={index} className="relative group rounded-lg border overflow-hidden aspect-video bg-muted">
                                            <img src={image} alt={`Service ${index}`} className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <div className="h-4 w-4 bg-red-500 rounded-full" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Input placeholder="Image URL (http://...)" value={imageInput} onChange={e => setImageInput(e.target.value)} />
                                    <Button variant="outline" onClick={addImage}>Add URL</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* BUILDER TAB */}
                {activeTab === 'builder' && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-[700px]">
                        <ServiceBuilder
                            service={serviceConfig}
                            onChange={handlePricingUpdate}
                        />
                    </div>
                )}

                {/* PREVIEW TAB */}
                {activeTab === 'preview' && (
                    <div className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[700px]">
                        <ConsumerPreview service={serviceConfig} />
                    </div>
                )}
            </div>
        </div>
    );
}
