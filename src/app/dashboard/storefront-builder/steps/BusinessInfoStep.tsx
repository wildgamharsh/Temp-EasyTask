/**
 * Business Info Step - Step 1 of Storefront Builder
 * Collects business details, logo, about us, and contact information
 */

"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Building2, Mail, Phone, MapPin, Upload,
    Facebook, Instagram, Twitter, Linkedin,
    Globe, Loader2, CheckCircle, XCircle, Sparkles, Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../../../components/ui/popover";
import { toast } from "sonner";
import { checkSubdomainAvailability } from "../actions";
import ImageUploader from "@/components/ui/image-uploader";

export interface BusinessInfoData {
    businessName: string;
    subdomain: string;
    shortDescription: string;
    logoUrl: string;
    aboutUs: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    socialLinks: Record<string, string>;
}

interface BusinessInfoStepProps {
    data: BusinessInfoData;
    onChange: (data: BusinessInfoData) => void;
    onAiGenerate?: (businessName: string, model: string, apiKey?: string) => Promise<void>;
}

export default function BusinessInfoStep({ data, onChange, onAiGenerate }: BusinessInfoStepProps) {
    const [subdomainStatus, setSubdomainStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable' | 'error'>('idle');
    const [subdomainMessage, setSubdomainMessage] = useState('');
    const [aiModel, setAiModel] = useState("nvidia/nemotron-3-nano-30b-a3b:free");
    const [apiKey, setApiKey] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleChange = (field: keyof BusinessInfoData, value: string | boolean | Record<string, string>) => {
        onChange({ ...data, [field]: value });
    };

    // Subdomain Debounce Check
    useEffect(() => {
        const checkSubdomain = async () => {
            if (!data.subdomain || data.subdomain.length < 3) {
                setSubdomainStatus('idle');
                setSubdomainMessage('');
                return;
            }

            setSubdomainStatus('checking');
            const result = await checkSubdomainAvailability(data.subdomain);

            if (result.available) {
                setSubdomainStatus('available');
                setSubdomainMessage('Subdomain is available!');
            } else {
                setSubdomainStatus('unavailable');
                setSubdomainMessage('Subdomain is already taken.');
            }
        };

        const timeoutId = setTimeout(checkSubdomain, 500);
        return () => clearTimeout(timeoutId);
    }, [data.subdomain]);

    const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Only allow alphanumeric and hyphens
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        handleChange("subdomain", value);
    };

    const handleSocialLinkChange = (platform: string, value: string) => {
        onChange({
            ...data,
            socialLinks: { ...data.socialLinks, [platform]: value },
        });
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold mb-2 text-slate-900">Business Information</h2>
                <p className="text-slate-600">Tell us about your business and how customers can reach you</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Business Name */}
                <div className="space-y-2">
                    <Label htmlFor="businessName" className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Business Name *
                    </Label>
                    <Input
                        id="businessName"
                        value={data.businessName}
                        onChange={(e) => handleChange("businessName", e.target.value)}
                        placeholder="Your Business Name"
                        required
                    />
                </div>

                {/* AI Generation Control */}
                {onAiGenerate && (
                    <div className="md:col-span-2 flex items-center gap-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900">Auto-Generate Profile</p>
                            <p className="text-xs text-blue-700">Use AI to create description, contact info, and site content based on your business name.</p>
                        </div>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100">
                                    <Settings2 className="w-4 h-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                                <div className="space-y-4">
                                    <h4 className="font-medium text-sm">AI Model Settings</h4>

                                    <div className="space-y-2">
                                        <Label htmlFor="aiModel" className="text-xs">Model Name</Label>
                                        <Input
                                            id="aiModel"
                                            value={aiModel}
                                            onChange={(e) => setAiModel(e.target.value)}
                                            className="h-8 text-xs"
                                        />
                                        <p className="text-[10px] text-muted-foreground">Default: nvidia/nemotron-3-nano-30b-a3b:free</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="apiKey" className="text-xs">
                                            OpenRouter API Key <span className="text-muted-foreground font-normal">(Optional)</span>
                                        </Label>
                                        <Input
                                            id="apiKey"
                                            type="password"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            placeholder="sk-or-..."
                                            className="h-8 text-xs"
                                        />
                                        <p className="text-[10px] text-muted-foreground">Leave blank to use system key.</p>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Button
                            onClick={async () => {
                                if (!data.businessName) {
                                    toast.error("Please enter a business name first");
                                    return;
                                }
                                setIsGenerating(true);
                                try {
                                    await onAiGenerate(data.businessName, aiModel, apiKey);
                                } finally {
                                    setIsGenerating(false);
                                }
                            }}
                            disabled={isGenerating || !data.businessName}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                "Generate"
                            )}
                        </Button>
                    </div>
                )}

                {/* Subdomain */}
                <div className="space-y-2">
                    <Label htmlFor="subdomain" className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Storefront Subdomain
                    </Label>
                    <div className="relative">
                        <Input
                            id="subdomain"
                            value={data.subdomain || ''}
                            onChange={handleSubdomainChange}
                            placeholder="your-business"
                            className={`pr-10 focus:border-blue-500 focus-visible:ring-blue-500 ${subdomainStatus === 'available' ? 'border-green-500 focus:border-green-500' :
                                subdomainStatus === 'unavailable' ? 'border-red-500 focus:border-red-500' : 'border-slate-200'
                                }`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {subdomainStatus === 'checking' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                            {subdomainStatus === 'available' && <CheckCircle className="w-4 h-4 text-green-500" />}
                            {subdomainStatus === 'unavailable' && <XCircle className="w-4 h-4 text-red-500" />}
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">
                            {data.subdomain ? `${data.subdomain}.zaaro.com` : 'your-business.zaaro.com'}
                        </span>
                        <span className={
                            subdomainStatus === 'available' ? 'text-green-600 font-medium' :
                                subdomainStatus === 'unavailable' ? 'text-red-600 font-medium' :
                                    'text-muted-foreground'
                        }>
                            {subdomainMessage}
                        </span>
                    </div>
                </div>
            </div>

            {/* Short Description */}
            <div className="space-y-2">
                <Label htmlFor="shortDescription">
                    Short Description (1-2 sentences)
                </Label>
                <Textarea
                    id="shortDescription"
                    value={data.shortDescription}
                    onChange={(e) => handleChange("shortDescription", e.target.value)}
                    placeholder="A brief tagline or description of your business"
                    rows={2}
                    maxLength={200}
                />
                <p className="text-xs text-gray-500">{data.shortDescription.length}/200 characters</p>
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
                <Label>Business Logo</Label>
                <ImageUploader
                    value={data.logoUrl}
                    onChange={(url) => handleChange("logoUrl", url)}
                    onUpload={async (file) => {
                        // For now, convert to base64
                        // TODO: Implement actual upload to storage
                        return new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result as string);
                            reader.readAsDataURL(file);
                        });
                    }}
                    variant="mini"
                    placeholder="Upload your logo"
                />
                <p className="text-xs text-slate-500">Recommended: Square image, at least 200x200px</p>
            </div>

            {/* About Us */}
            <div className="space-y-2">
                <Label htmlFor="aboutUs">
                    About Your Business *
                </Label>
                <Textarea
                    id="aboutUs"
                    value={data.aboutUs}
                    onChange={(e) => handleChange("aboutUs", e.target.value)}
                    placeholder="Tell your story. What makes your business special? What services do you offer? What's your mission?"
                    rows={6}
                    required
                />
                <p className="text-xs text-gray-500">This will appear in the About section of your storefront</p>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="contactEmail" className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                        </Label>
                        <Input
                            id="contactEmail"
                            type="email"
                            value={data.contactEmail}
                            onChange={(e) => handleChange("contactEmail", e.target.value)}
                            placeholder="contact@yourbusiness.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contactPhone" className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Phone
                        </Label>
                        <Input
                            id="contactPhone"
                            type="tel"
                            value={data.contactPhone}
                            onChange={(e) => handleChange("contactPhone", e.target.value)}
                            placeholder="+1 (555) 123-4567"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Address
                    </Label>
                    <Input
                        id="address"
                        value={data.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                        placeholder="123 Business St, City, State 12345"
                    />
                </div>
            </div>

            {/* Social Media Links */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Social Media (Optional)</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="facebook" className="flex items-center gap-2">
                            <Facebook className="w-4 h-4" />
                            Facebook
                        </Label>
                        <Input
                            id="facebook"
                            value={data.socialLinks.facebook || ""}
                            onChange={(e) => handleSocialLinkChange("facebook", e.target.value)}
                            placeholder="https://facebook.com/yourpage"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="instagram" className="flex items-center gap-2">
                            <Instagram className="w-4 h-4" />
                            Instagram
                        </Label>
                        <Input
                            id="instagram"
                            value={data.socialLinks.instagram || ""}
                            onChange={(e) => handleSocialLinkChange("instagram", e.target.value)}
                            placeholder="https://instagram.com/yourpage"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="twitter" className="flex items-center gap-2">
                            <Twitter className="w-4 h-4" />
                            Twitter/X
                        </Label>
                        <Input
                            id="twitter"
                            value={data.socialLinks.twitter || ""}
                            onChange={(e) => handleSocialLinkChange("twitter", e.target.value)}
                            placeholder="https://twitter.com/yourpage"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="linkedin" className="flex items-center gap-2">
                            <Linkedin className="w-4 h-4" />
                            LinkedIn
                        </Label>
                        <Input
                            id="linkedin"
                            value={data.socialLinks.linkedin || ""}
                            onChange={(e) => handleSocialLinkChange("linkedin", e.target.value)}
                            placeholder="https://linkedin.com/company/yourpage"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
