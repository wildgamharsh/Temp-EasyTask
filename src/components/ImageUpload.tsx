"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
    organizerId: string;
    serviceId?: string;
    type: "logo" | "service" | "gallery";
    onUploadComplete?: (urls: string[]) => void;
    maxFiles?: number;
    currentImages?: string[];
    className?: string;
}

export function ImageUpload({
    organizerId,
    serviceId,
    type,
    onUploadComplete,
    maxFiles = 5,
    currentImages = [],
    className,
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        // Validate file count
        if (files.length + currentImages.length > maxFiles) {
            toast.error(`You can only upload up to ${maxFiles} images`);
            return;
        }

        // Validate file sizes (2MB limit)
        const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
        const invalidFiles = files.filter((file) => file.size > MAX_FILE_SIZE);
        if (invalidFiles.length > 0) {
            toast.error("Some files exceed the 2MB size limit");
            return;
        }

        // Validate file types
        const invalidTypes = files.filter((file) => !file.type.startsWith("image/"));
        if (invalidTypes.length > 0) {
            toast.error("Only image files are allowed");
            return;
        }

        // Create preview URLs
        const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
        setPreviewUrls([...previewUrls, ...newPreviewUrls]);
        setSelectedFiles([...selectedFiles, ...files]);
    };

    const removeFile = (index: number) => {
        // Revoke the preview URL to free memory
        URL.revokeObjectURL(previewUrls[index]);

        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
        setPreviewUrls(previewUrls.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            toast.error("Please select files to upload");
            return;
        }

        setIsUploading(true);
        try {
            let uploadedUrls: string[] = [];

            if (type === "logo") {
                // Import and use the upload function
                const { uploadOrganizerLogo } = await import("@/lib/supabase-data");
                const url = await uploadOrganizerLogo(selectedFiles[0], organizerId);
                if (url) {
                    uploadedUrls = [url];
                }
            } else if (type === "service") {
                if (!serviceId) {
                    throw new Error("Service ID is required for service images");
                }
                const { uploadServiceImages } = await import("@/lib/supabase-data");
                uploadedUrls = await uploadServiceImages(selectedFiles, organizerId, serviceId);
            } else if (type === "gallery") {
                const { uploadGalleryImages } = await import("@/lib/supabase-data");
                uploadedUrls = await uploadGalleryImages(selectedFiles, organizerId);
            }

            if (uploadedUrls.length > 0) {
                toast.success(`Successfully uploaded ${uploadedUrls.length} image(s)`);
                onUploadComplete?.(uploadedUrls);

                // Clear selected files and previews
                previewUrls.forEach((url) => URL.revokeObjectURL(url));
                setSelectedFiles([]);
                setPreviewUrls([]);

                // Reset file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            } else {
                toast.error("Failed to upload images");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload images. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const getTitle = () => {
        switch (type) {
            case "logo":
                return "Upload Logo";
            case "service":
                return "Upload Service Images";
            case "gallery":
                return "Upload Gallery Images";
        }
    };

    const getDescription = () => {
        switch (type) {
            case "logo":
                return "Upload your business logo (max 2MB)";
            case "service":
                return `Upload images for your service (max ${maxFiles} images, 2MB each)`;
            case "gallery":
                return `Upload images to your gallery (max ${maxFiles} images, 2MB each)`;
        }
    };

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{getTitle()}</CardTitle>
                <CardDescription>{getDescription()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* File Input */}
                <div className="space-y-2">
                    <Label htmlFor="image-upload">Select Images</Label>
                    <div className="flex gap-2">
                        <input
                            ref={fileInputRef}
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            multiple={type !== "logo"}
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading || (type === "logo" && selectedFiles.length > 0)}
                            className="flex-1"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Choose Files
                        </Button>
                        {selectedFiles.length > 0 && (
                            <Button
                                type="button"
                                onClick={handleUpload}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload {selectedFiles.length} file(s)
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Preview Grid */}
                {previewUrls.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {previewUrls.map((url, index) => (
                            <div
                                key={index}
                                className="relative group rounded-lg border overflow-hidden bg-muted"
                            >
                                <img
                                    src={url}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-40 object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    disabled={isUploading}
                                    className={cn(
                                        "absolute top-2 right-2 p-1.5 rounded-full",
                                        "bg-destructive text-destructive-foreground",
                                        "opacity-0 group-hover:opacity-100 transition-opacity",
                                        "disabled:opacity-50 disabled:cursor-not-allowed"
                                    )}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 truncate">
                                    {selectedFiles[index].name}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Current Images */}
                {currentImages.length > 0 && (
                    <div className="space-y-2">
                        <Label>Current Images</Label>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {currentImages.map((url, index) => (
                                <div
                                    key={index}
                                    className="relative rounded-lg border overflow-hidden bg-muted"
                                >
                                    <img
                                        src={url}
                                        alt={`Current ${index + 1}`}
                                        className="w-full h-40 object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {previewUrls.length === 0 && currentImages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
                        <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground">
                            No images selected. Click &quot;Choose Files&quot; to upload.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
