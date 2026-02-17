"use client";

import React, { useState, useRef } from "react";
import { ModernInput } from "../shared/ModernInput";
import { ModernTextarea } from "../shared/ModernTextarea";
import { FeatureTagInput } from "../shared/FeatureTagInput";
import { ImageIcon, Wand2, Link as LinkIcon, UploadCloud, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GeneralInfoStepProps {
    data: {
        title: string;
        description: string;
        images: string[];
        highlights: string[];
    };
    onUpdate: (data: any) => void;
    organizerId?: string;
    serviceId?: string;
}

export function GeneralInfoStep({ data, onUpdate, organizerId, serviceId }: GeneralInfoStepProps) {
    const [activeImageInput, setActiveImageInput] = useState("");
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [isDraggingFile, setIsDraggingFile] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddImage = () => {
        if (!activeImageInput) return;
        onUpdate({ images: [...data.images, activeImageInput] });
        setActiveImageInput("");
    };

    const handleRemoveImage = (index: number) => {
        onUpdate({ images: data.images.filter((_, i) => i !== index) });
    };

    // Reordering Logic
    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData("text/plain", index.toString());
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (dragOverIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        setDragOverIndex(null);
        const dragIndexStr = e.dataTransfer.getData("text/plain");
        if (!dragIndexStr) return; // Might be file drop

        const dragIndex = parseInt(dragIndexStr);
        if (isNaN(dragIndex) || dragIndex === dropIndex) return;

        const newImages = [...data.images];
        const [movedImage] = newImages.splice(dragIndex, 1);
        newImages.splice(dropIndex, 0, movedImage);

        onUpdate({ images: newImages });
    };

    const handleDragEnd = () => {
        setDragOverIndex(null);
    };

    // File Upload Logic
    const handleFileDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingFile(true);
    };

    const handleFileDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingFile(false);
    };

    const handleFileDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingFile(false);

        if (!organizerId || !serviceId) {
            console.error("Missing organizerId or serviceId for upload");
            // Fallback? Or just warn?
            // toast.error("Please ensure you are logged in to upload images.");
            return;
        }

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files);
            const validFiles = files.filter(file => file.type.startsWith("image/"));

            if (validFiles.length > 0) {
                setIsUploading(true);
                try {
                    // Import dynamically to avoid server-side issues if any (though this component is 'use client')
                    const { uploadServiceImages } = await import("@/lib/supabase-data");
                    const uploadedUrls = await uploadServiceImages(validFiles, organizerId, serviceId);

                    if (uploadedUrls && uploadedUrls.length > 0) {
                        onUpdate({ images: [...data.images, ...uploadedUrls] });
                    }
                } catch (error) {
                    console.error("Upload failed", error);
                } finally {
                    setIsUploading(false);
                }
            }
        }
    };

    const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        if (!organizerId || !serviceId) {
            console.error("Missing organizerId or serviceId for upload");
            return;
        }

        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => file.type.startsWith("image/"));

        if (validFiles.length > 0) {
            setIsUploading(true);
            try {
                const { uploadServiceImages } = await import("@/lib/supabase-data");
                const uploadedUrls = await uploadServiceImages(validFiles, organizerId, serviceId);

                if (uploadedUrls && uploadedUrls.length > 0) {
                    onUpdate({ images: [...data.images, ...uploadedUrls] });
                }
            } catch (error) {
                console.error("Upload failed", error);
            } finally {
                setIsUploading(false);
                // Reset input
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. Identity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-b border-gray-100 pb-8">
                <div className="lg:col-span-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Service Identity</h3>
                    <p className="text-sm text-gray-500">
                        Give your service a clear, professional title and detailed description.
                    </p>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <ModernInput
                        label="Service Title"
                        placeholder="e.g. Full Day Wedding Photography"
                        value={data.title}
                        onChange={(e) => onUpdate({ title: e.target.value })}
                        width="full"
                        hint="Make it catchy but descriptive. 50 characters max recommended."
                    />

                    <ModernTextarea
                        label="Description"
                        placeholder="Describe your service in detail..."
                        value={data.description}
                        onChange={(e) => onUpdate({ description: e.target.value })}
                        className="min-h-[120px]"
                        hint="Include what's included, your style, and what makes you unique."
                    />
                </div>
            </div>

            {/* 2. Visuals Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-b border-gray-100 pb-8">
                <div className="lg:col-span-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Visual Gallery</h3>
                    <p className="text-sm text-gray-500">
                        Showcase your best work. High-quality images increase bookings significantly.
                    </p>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-700">
                        <p className="font-semibold mb-1">Pro Tip:</p>
                        Drag images to reorder them using the handle. Drop new files anywhere to upload.
                    </div>
                </div>
                <div className="lg:col-span-2 space-y-4">
                    {/* Image Grid with DnD */}
                    <div
                        onDragOver={handleFileDragOver}
                        onDragLeave={handleFileDragLeave}
                        onDrop={handleFileDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "rounded-xl transition-all duration-200 min-h-[100px] cursor-pointer",
                            isDraggingFile && "ring-4 ring-blue-500/20 bg-blue-50"
                        )}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileInputChange}
                            multiple
                            accept="image/*"
                        />
                        {data.images.length > 0 ? (
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                {data.images.map((url, idx) => (
                                    <div
                                        key={idx}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, idx)}
                                        onDragOver={(e) => handleDragOver(e, idx)}
                                        onDrop={(e) => handleDrop(e, idx)}
                                        onDragEnd={handleDragEnd}
                                        onClick={(e) => e.stopPropagation()}
                                        className={cn(
                                            "group relative aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200 transition-transform duration-200 cursor-move",
                                            dragOverIndex === idx && "opacity-50 scale-95 ring-2 ring-blue-500"
                                        )}
                                    >
                                        <img src={url} alt={`Service ${idx}`} className="w-full h-full object-cover pointer-events-none" />

                                        {/* Drag Handle Overlay */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <span className="bg-white/90 p-1.5 rounded-full shadow-sm">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1" /><circle cx="9" cy="5" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="19" r="1" /></svg>
                                            </span>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent drag start
                                                handleRemoveImage(idx);
                                            }}
                                            className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 hover:bg-white z-10"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={cn(
                                "flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 mb-4 transition-colors",
                                (isDraggingFile || isUploading) ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50 hover:border-blue-300"
                            )}>
                                {isUploading ? (
                                    <>
                                        <div className="h-10 w-10 text-blue-500 mb-2 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                                        <p className="text-sm font-semibold text-blue-700">Uploading images...</p>
                                    </>
                                ) : isDraggingFile ? (
                                    <>
                                        <UploadCloud className="h-10 w-10 text-blue-500 mb-2 animate-bounce" />
                                        <p className="text-sm font-semibold text-blue-700">Drop images here</p>
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon className="h-10 w-10 text-gray-300 mb-2" />
                                        <p className="text-sm text-gray-500 text-center">
                                            Click to browse or drag & drop images here
                                        </p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Add Image Input */}
                    <div className="flex gap-2">
                        <ModernInput
                            placeholder="Paste image URL..."
                            value={activeImageInput}
                            onChange={(e) => setActiveImageInput(e.target.value)}
                            icon={LinkIcon}
                            width="full"
                            wrapperClassName="flex-1"
                            onKeyDown={(e) => e.key === "Enter" && handleAddImage()}
                        />
                        <Button
                            variant="secondary"
                            className="mt-[22px] h-10 border border-gray-200 shadow-sm bg-white hover:bg-gray-50 hover:border-blue-300 text-gray-700"
                            onClick={handleAddImage}
                            disabled={!activeImageInput}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Image
                        </Button>
                    </div>
                    <p className="text-xs text-gray-400 ml-1">
                        Use valid image URLs (jpg, png, webp). We'll support file upload soon.
                    </p>
                </div>
            </div>

            {/* 3. Highlights Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Key Highlights</h3>
                    <p className="text-sm text-gray-500">
                        Quick tags that appear on search results cards. Keep them short.
                    </p>
                </div>
                <div className="lg:col-span-2">
                    <FeatureTagInput
                        label="Service Highlights"
                        value={data.highlights}
                        onChange={(tags) => onUpdate({ highlights: tags })}
                        placeholder="e.g. Instant Delivery, Verified Pro..."
                        hint="Enter up to 5 highlights"
                        maxTags={5}
                    />
                </div>
            </div>
        </div>
    );
}

// Helper icon component since 'X' was blocked by import
function X({ size = 24, className }: { size?: number, className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
    )
}
