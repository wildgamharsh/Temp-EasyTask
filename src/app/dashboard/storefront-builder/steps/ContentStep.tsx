/**
 * Content Step - Step 2 of Storefront Builder
 * Manages testimonials, gallery, hero section, and component visibility
 */

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Plus, X, Star, Upload, Image as ImageIcon, Loader2, Link, Trash2, Edit2, MessageSquare } from "lucide-react";
// NO_OP - used multi_replace instead
import { uploadStorefrontImage } from "../actions";
import { toast } from "sonner";
import ImageUploader from "@/components/ui/image-uploader";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface Testimonial {
    name: string;
    role?: string;
    content: string;
    rating?: number;
    image?: string;
}

interface GalleryTestimonial {
    image_url: string;
    testimonials: Array<{
        name: string;
        comment: string;
        date?: string;
    }>;
}

interface ContentData {
    testimonials: Array<{
        name: string;
        role?: string;
        content: string;
        rating?: number;
        image?: string;
    }>;
    galleryImages: string[];
    galleryTestimonials: GalleryTestimonial[];
    heroTitle: string;
    heroSubtitle: string;
    bannerUrl: string;
    showHero: boolean;
    showAbout: boolean;
    showTestimonials: boolean;
    showGallery: boolean;
    showContact: boolean;
    showSocialLinks: boolean;
    authDescription?: string;
    loginHeading?: string;
    loginDescription?: string;
    signupHeading?: string;
    signupDescription?: string;
    authBackgroundUrl?: string;
}

import { BusinessInfoData } from "./BusinessInfoStep";

interface ContentStepProps {
    data: ContentData;
    onChange: (data: ContentData) => void;
    businessData: BusinessInfoData;
    onBusinessChange: (data: BusinessInfoData) => void;
}

export default function ContentStep({ data, onChange, businessData, onBusinessChange }: ContentStepProps) {
    const [newTestimonial, setNewTestimonial] = useState<Testimonial>({
        name: "",
        role: "",
        content: "",
        rating: 5,
    });

    const [isUploading, setIsUploading] = useState(false);
    const [galleryUrl, setGalleryUrl] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    // State for gallery image editing
    const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
    const [editTestimonialName, setEditTestimonialName] = useState("");
    const [editTestimonialComment, setEditTestimonialComment] = useState("");
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const handleChange = (field: keyof ContentData, value: ContentData[keyof ContentData]) => {
        onChange({ ...data, [field]: value });
    };

    const addTestimonial = () => {
        if (!newTestimonial.name || !newTestimonial.content) {
            return;
        }
        onChange({
            ...data,
            testimonials: [...data.testimonials, newTestimonial],
        });
        setNewTestimonial({ name: "", role: "", content: "", rating: 5 });
    };

    const removeTestimonial = (index: number) => {
        onChange({
            ...data,
            testimonials: data.testimonials.filter((_, i) => i !== index),
        });
    };

    const handleFileUpload = async (file: File, type: 'gallery' | 'banner') => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type); // 'gallery' folder is used for generic assets

            const result = await uploadStorefrontImage(formData);

            if (!result.success || !result.url) {
                toast.error(result.error || "Failed to upload image");
                return null;
            }

            return result.url;
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("An unexpected error occurred");
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        setIsUploading(true);
        const newImages: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const url = await handleFileUpload(files[i], 'gallery');
            if (url) newImages.push(url);
        }

        if (newImages.length > 0) {
            onChange({
                ...data,
                galleryImages: [...data.galleryImages, ...newImages],
            });
            toast.success("Images uploaded successfully");
        }
        setIsUploading(false);
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = await handleFileUpload(file, 'banner');
        if (url) {
            handleChange("bannerUrl", url);
            toast.success("Banner updated successfully");
        }
    };

    const removeGalleryImage = (index: number) => {
        const imageUrlToRemove = data.galleryImages[index];
        onChange({
            ...data,
            galleryImages: data.galleryImages.filter((_, i) => i !== index),
            // Also remove associated testimonials
            galleryTestimonials: data.galleryTestimonials?.filter(gt => gt.image_url !== imageUrlToRemove) || []
        });
    };

    const handleAddGalleryUrl = () => {
        if (!galleryUrl) return;

        onChange({
            ...data,
            galleryImages: [...data.galleryImages, galleryUrl],
        });
        setGalleryUrl("");
        toast.success("Image URL added successfully");
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
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const newImages: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const url = await handleFileUpload(files[i], 'gallery');
            if (url) newImages.push(url);
        }

        if (newImages.length > 0) {
            onChange({
                ...data,
                galleryImages: [...data.galleryImages, ...newImages],
            });
            toast.success(`Uploaded ${newImages.length} images`);
        }
        setIsUploading(false);
    };

    // Gallery Testimonial Logic
    const openEditDialog = (index: number) => {
        const imageUrl = data.galleryImages[index];
        const existingData = data.galleryTestimonials?.find(gt => gt.image_url === imageUrl);

        // Use first testimonial if available
        const testimonial = existingData?.testimonials?.[0];

        setEditingImageIndex(index);
        setEditTestimonialName(testimonial?.name || "");
        setEditTestimonialComment(testimonial?.comment || "");
        setIsEditDialogOpen(true);
    };

    const saveGalleryTestimonial = () => {
        if (editingImageIndex === null) return;

        const imageUrl = data.galleryImages[editingImageIndex];
        const currentTestimonials = data.galleryTestimonials || [];

        let updatedTestimonials = [...currentTestimonials];
        const existingIndex = updatedTestimonials.findIndex(gt => gt.image_url === imageUrl);

        if (!editTestimonialName && !editTestimonialComment) {
            // Remove if empty
            if (existingIndex >= 0) {
                updatedTestimonials.splice(existingIndex, 1);
            }
        } else {
            // Add or Update
            const newEntry = {
                image_url: imageUrl,
                testimonials: [{
                    name: editTestimonialName,
                    comment: editTestimonialComment,
                    date: new Date().toISOString()
                }]
            };

            if (existingIndex >= 0) {
                updatedTestimonials[existingIndex] = newEntry;
            } else {
                updatedTestimonials.push(newEntry);
            }
        }

        onChange({
            ...data,
            galleryTestimonials: updatedTestimonials
        });

        setIsEditDialogOpen(false);
        toast.success("Image details saved");
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Storefront Content</h2>
                <p className="text-slate-600">Manage your homepage sections and gallery.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">

                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Hero Section */}
                    <Card className="p-6 border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">Hero Section</h3>
                                <p className="text-sm text-slate-500">The main banner of your site</p>
                            </div>
                            <Switch
                                checked={data.showHero}
                                onCheckedChange={(checked) => handleChange("showHero", checked)}
                                className="data-[state=checked]:bg-blue-600"
                            />
                        </div>

                        {data.showHero && (
                            <div className="space-y-5 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <Label htmlFor="heroTitle" className="text-slate-700">Headline</Label>
                                    <Input
                                        id="heroTitle"
                                        value={data.heroTitle}
                                        onChange={(e) => handleChange("heroTitle", e.target.value)}
                                        className="border-slate-200 focus:border-blue-500 font-medium text-lg"
                                        placeholder="e.g. Premium Event Services"
                                        maxLength={60}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="heroSubtitle" className="text-slate-700">Subheadline</Label>
                                    <Input
                                        id="heroSubtitle"
                                        value={data.heroSubtitle}
                                        onChange={(e) => handleChange("heroSubtitle", e.target.value)}
                                        className="border-slate-200 focus:border-blue-500"
                                        placeholder="e.g. We make your moments unforgettable"
                                        maxLength={120}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-700">Banner Image</Label>
                                    <ImageUploader
                                        value={data.bannerUrl}
                                        onChange={(url) => handleChange("bannerUrl", url)}
                                        onUpload={async (file) => {
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            formData.append('type', 'banner');

                                            const result = await uploadStorefrontImage(formData);
                                            if (result.success && result.url) {
                                                return result.url;
                                            }
                                            toast.error(result.error || "Upload failed");
                                            return null;
                                        }}
                                        variant="standard"
                                        disabled={isUploading}
                                    />
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Gallery Section */}
                    <Card className="p-6 border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">Portfolio Gallery</h3>
                                <p className="text-sm text-slate-500">Drag & drop to upload</p>
                            </div>
                            <Switch
                                checked={data.showGallery}
                                onCheckedChange={(checked) => handleChange("showGallery", checked)}
                                className="data-[state=checked]:bg-blue-600"
                            />
                        </div>

                        {data.showGallery && (
                            <div className="space-y-6 pt-2">
                                {/* Drag & Drop Zone */}
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`
                                        border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
                                        flex flex-col items-center justify-center gap-3
                                        ${isDragging
                                            ? "border-blue-500 bg-blue-50 scale-[0.99]"
                                            : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                                        }
                                    `}
                                >
                                    <div className={`p-3 rounded-full ${isDragging ? "bg-blue-100" : "bg-slate-100"}`}>
                                        <Upload className={`w-6 h-6 ${isDragging ? "text-blue-600" : "text-slate-400"}`} />
                                    </div>

                                    <div className="space-y-1">
                                        <p className="font-medium text-slate-900">
                                            {isUploading ? "Uploading..." : "Click or drag images here"}
                                        </p>
                                    </div>

                                    <div className="flex gap-2 w-full max-w-sm justify-center">
                                        <input
                                            type="file"
                                            id="gallery-upload"
                                            accept="image/*"
                                            multiple
                                            onChange={handleGalleryUpload}
                                            className="hidden"
                                            disabled={isUploading}
                                        />
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="w-full"
                                            disabled={isUploading}
                                            onClick={() => document.getElementById("gallery-upload")?.click()}
                                        >
                                            Browse Files
                                        </Button>
                                    </div>
                                </div>

                                {/* Gallery Grid */}
                                {data.galleryImages.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {data.galleryImages.map((image, index) => {
                                            const hasTestimonial = data.galleryTestimonials?.some(gt => gt.image_url === image && gt.testimonials.length > 0);

                                            return (
                                                <div key={index} className="relative group aspect-[3/4] rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                                                    <img
                                                        src={image}
                                                        alt={`Gallery ${index + 1}`}
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                    />

                                                    {/* Badge if has testimonial */}
                                                    {hasTestimonial && (
                                                        <div className="absolute top-2 left-2 bg-blue-500 text-white p-1.5 rounded-full shadow-md z-10">
                                                            <MessageSquare className="w-3 h-3" />
                                                        </div>
                                                    )}

                                                    {/* Actions Overlay */}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        <Button
                                                            size="icon"
                                                            variant="secondary"
                                                            className="h-8 w-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200"
                                                            onClick={() => openEditDialog(index)}
                                                            title="Edit Details"
                                                        >
                                                            <Edit2 className="w-4 h-4 text-slate-700" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="destructive"
                                                            className="h-8 w-8 rounded-full"
                                                            onClick={() => removeGalleryImage(index)}
                                                            title="Remove Image"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>

                </div>

                {/* Sidebar (Visibility) */}
                <div className="space-y-6">
                    <Card className="p-5 border-slate-200 shadow-sm bg-slate-50/50">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                            Visibility Control
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                                <span className="text-sm font-medium">About Section</span>
                                <Switch
                                    checked={data.showAbout}
                                    onCheckedChange={(checked) => handleChange("showAbout", checked)}
                                    className="data-[state=checked]:bg-blue-600"
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                                <span className="text-sm font-medium">Testimonials</span>
                                <Switch
                                    checked={data.showTestimonials}
                                    onCheckedChange={(checked) => handleChange("showTestimonials", checked)}
                                    className="data-[state=checked]:bg-blue-600"
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                                <span className="text-sm font-medium">Contact Footer</span>
                                <Switch
                                    checked={data.showContact}
                                    onCheckedChange={(checked) => handleChange("showContact", checked)}
                                    className="data-[state=checked]:bg-blue-600"
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                                <span className="text-sm font-medium">Social Links</span>
                                <Switch
                                    checked={data.showSocialLinks}
                                    onCheckedChange={(checked) => handleChange("showSocialLinks", checked)}
                                    className="data-[state=checked]:bg-blue-600"
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                                <span className="text-sm font-medium">Map Location</span>
                                <Input
                                    className="h-8 w-24 text-xs"
                                    placeholder={businessData.socialLinks.google_maps ? "Linked" : "Optional"}
                                    value={businessData.socialLinks.google_maps || ""}
                                    onChange={(e) => onBusinessChange({
                                        ...businessData,
                                        socialLinks: {
                                            ...businessData.socialLinks,
                                            google_maps: e.target.value
                                        }
                                    })}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Testimonials Quick Add */}
                    <Card className="p-5 border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4">Add Testimonial</h3>
                        <div className="space-y-3">
                            <Input
                                placeholder="Client Name"
                                value={newTestimonial.name}
                                onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                                className="border-slate-200 bg-slate-50 mb-2"
                            />
                            <Textarea
                                placeholder="Their review..."
                                value={newTestimonial.content}
                                onChange={(e) => setNewTestimonial({ ...newTestimonial, content: e.target.value })}
                                className="border-slate-200 bg-slate-50 resize-none"
                                rows={2}
                            />
                            <div className="flex gap-1 mb-2">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <button
                                        key={rating}
                                        type="button"
                                        onClick={() => setNewTestimonial({ ...newTestimonial, rating })}
                                        className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={`w-4 h-4 ${rating <= (newTestimonial.rating || 5)
                                                ? "fill-amber-400 text-amber-400"
                                                : "text-slate-200"
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <Button onClick={addTestimonial} size="sm" className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                                <Plus className="w-3 h-3 mr-2" /> Add
                            </Button>

                            {/* List */}
                            {data.testimonials.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                                    {data.testimonials.map((t, idx) => (
                                        <div key={idx} className="text-xs p-2 bg-slate-50 rounded flex justify-between items-center group">
                                            <span className="font-medium truncate max-w-[120px]">{t.name}</span>
                                            <button onClick={() => removeTestimonial(idx)} className="text-slate-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Edit Image Details Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Image Details</DialogTitle>
                        <DialogDescription>
                            Add a client review to display with this image in the full-screen view.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Client Name</Label>
                            <Input
                                placeholder="e.g. Sarah J."
                                value={editTestimonialName}
                                onChange={(e) => setEditTestimonialName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Client Review</Label>
                            <Textarea
                                placeholder="What did they say about this event/work?"
                                rows={4}
                                value={editTestimonialComment}
                                onChange={(e) => setEditTestimonialComment(e.target.value)}
                            />
                            <p className="text-xs text-slate-500">
                                Leave blank to show only the image (centered) in the gallery viewer.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={saveGalleryTestimonial}>Save Details</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
