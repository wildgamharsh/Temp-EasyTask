"use client";

import React, { useState, useRef } from "react";
import { ImageIcon, Link as LinkIcon, UploadCloud, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ModernInput } from "@/components/dashboard/services/shared/ModernInput";

interface AdvancedImageUploadProps {
    images: string[];
    onImagesChange: (newImages: string[]) => void;
    organizerId: string;
    bucketPath?: string; // e.g. 'service-images' or 'gallery'
    className?: string;
    maxImages?: number;
    showPreview?: boolean;
}

export function AdvancedImageUpload({
    images,
    onImagesChange,
    organizerId,
    bucketPath = 'gallery', // Default to gallery if not specified
    className,
    maxImages = 10,
    showPreview = true
}: AdvancedImageUploadProps) {
    const [activeImageInput, setActiveImageInput] = useState("");
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [isDraggingFile, setIsDraggingFile] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddImageUrl = () => {
        if (!activeImageInput) return;
        if (images.length >= maxImages) return;
        onImagesChange([...images, activeImageInput]);
        setActiveImageInput("");
    };

    const handleRemoveImage = (index: number) => {
        onImagesChange(images.filter((_, i) => i !== index));
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
        if (!dragIndexStr) return;

        const dragIndex = parseInt(dragIndexStr);
        if (isNaN(dragIndex) || dragIndex === dropIndex) return;

        const newImages = [...images];
        const [movedImage] = newImages.splice(dragIndex, 1);
        newImages.splice(dropIndex, 0, movedImage);

        onImagesChange(newImages);
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

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files);
            const validFiles = files.filter(file => file.type.startsWith("image/")); // Basic validation

            if (validFiles.length > 0) {
                await uploadFiles(validFiles);
            }
        }
    };

    const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => file.type.startsWith("image/"));
        if (validFiles.length > 0) {
            await uploadFiles(validFiles);
        }
    };

    const uploadFiles = async (files: File[]) => {
        if (images.length + files.length > maxImages) {
            // Toast error here ideally
            console.error("Too many images");
            return;
        }

        setIsUploading(true);
        try {
            // We'll use the gallery upload function as it fits generic usage
            const { uploadGalleryImages } = await import("@/lib/supabase-data");
            // Note: uploadGalleryImages expects organizerId. 
            const uploadedUrls = await uploadGalleryImages(files, organizerId);

            if (uploadedUrls && uploadedUrls.length > 0) {
                onImagesChange([...images, ...uploadedUrls]);
            }
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
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
                {showPreview && (images.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-4">
                        {images.map((url, idx) => (
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
                                <img src={url} alt={`Image ${idx}`} className="w-full h-full object-cover pointer-events-none" />

                                {/* Drag Handle Overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <span className="bg-white/90 p-1.5 rounded-full shadow-sm">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1" /><circle cx="9" cy="5" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="19" r="1" /></svg>
                                    </span>
                                </div>

                                <button
                                    onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        handleRemoveImage(idx);
                                    }}
                                    className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 hover:bg-white z-10"
                                >
                                    <X className="h-4 w-4" />
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
                ))}
                {!showPreview && (
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
                    onKeyDown={(e) => e.key === "Enter" && handleAddImageUrl()}
                />
                <Button
                    variant="secondary"
                    className="mt-[22px] h-10 border border-gray-200 shadow-sm bg-white hover:bg-gray-50 hover:border-blue-300 text-gray-700"
                    onClick={handleAddImageUrl}
                    disabled={!activeImageInput}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                </Button>
            </div>
            <p className="text-xs text-gray-400 ml-1">
                You can upload up to {maxImages} images.
            </p>
        </div>
    );
}
