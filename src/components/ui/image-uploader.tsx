/**
 * ImageUploader Component
 * Reusable component for image uploads with three methods:
 * 1. Drag and Drop
 * 2. File Upload
 * 3. URL Input
 * 
 * Variants: 'standard' | 'mini'
 */

"use client";

import { useState } from "react";
import { Upload, Link as LinkIcon, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
    value?: string;
    onChange: (url: string) => void;
    onUpload?: (file: File) => Promise<string | null>;
    variant?: 'standard' | 'mini';
    className?: string;
    disabled?: boolean;
    placeholder?: string;
}

export default function ImageUploader({
    value,
    onChange,
    onUpload,
    variant = 'standard',
    className,
    disabled = false,
    placeholder = "Upload an image"
}: ImageUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [urlInput, setUrlInput] = useState("");
    const [showUrlInput, setShowUrlInput] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (disabled) return;

        const file = e.dataTransfer.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;

        await handleFileUpload(file);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        await handleFileUpload(file);
        e.target.value = ''; // Reset input
    };

    const handleFileUpload = async (file: File) => {
        if (!onUpload) {
            // Fallback to base64 if no upload handler provided
            const reader = new FileReader();
            reader.onloadend = () => {
                onChange(reader.result as string);
            };
            reader.readAsDataURL(file);
            return;
        }

        setIsUploading(true);
        try {
            const url = await onUpload(file);
            if (url) onChange(url);
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleUrlSubmit = () => {
        if (urlInput.trim()) {
            onChange(urlInput.trim());
            setUrlInput("");
            setShowUrlInput(false);
        }
    };

    const handleRemove = () => {
        onChange("");
    };

    // Mini variant
    if (variant === 'mini') {
        return (
            <div className={cn("inline-flex flex-col gap-3", className)}>
                {value ? (
                    <div className="relative w-full h-24 rounded-lg border-2 border-slate-200 overflow-hidden group">
                        <img src={value} alt="Preview" className="w-full h-full object-cover" />
                        <button
                            onClick={handleRemove}
                            disabled={disabled}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>
                ) : (
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={cn(
                            "w-full h-24 rounded-lg border-2 border-dashed transition-all cursor-pointer flex items-center justify-center",
                            isDragging
                                ? "border-blue-500 bg-blue-50"
                                : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/50",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => !disabled && document.getElementById('mini-file-input')?.click()}
                    >
                        {isUploading ? (
                            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        ) : (
                            <Upload className="w-5 h-5 text-slate-400" />
                        )}
                    </div>
                )}

                <input
                    type="file"
                    id="mini-file-input"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={disabled || isUploading}
                />

                {!value && (
                    <div className="flex gap-2 w-full">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                            onClick={() => document.getElementById('mini-file-input')?.click()}
                            disabled={disabled || isUploading}
                        >
                            <Upload className="w-3 h-3 mr-1" />
                            Upload
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                            onClick={() => setShowUrlInput(!showUrlInput)}
                            disabled={disabled}
                        >
                            <LinkIcon className="w-3 h-3 mr-1" />
                            URL
                        </Button>
                    </div>
                )}

                {showUrlInput && !value && (
                    <div className="flex gap-2 w-full animate-in slide-in-from-top-2">
                        <Input
                            type="url"
                            placeholder="https://..."
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                            className="text-xs h-8 border-slate-200 focus:border-blue-500"
                            disabled={disabled}
                        />
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleUrlSubmit}
                            disabled={!urlInput.trim() || disabled}
                            className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3"
                        >
                            Add
                        </Button>
                    </div>
                )}
            </div>
        );
    }

    // Standard variant
    return (
        <div className={cn("space-y-4", className)}>
            {value ? (
                <div className="relative rounded-lg border border-slate-200 overflow-hidden group">
                    <img src={value} alt="Preview" className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => document.getElementById('standard-file-input')?.click()}
                            disabled={disabled}
                        >
                            Replace
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleRemove}
                            disabled={disabled}
                        >
                            Remove
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                        "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 flex flex-col items-center justify-center gap-3",
                        isDragging
                            ? "border-blue-500 bg-blue-50 scale-[0.99]"
                            : "border-slate-200 hover:border-blue-300 hover:bg-slate-50",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <div className={cn("p-3 rounded-full", isDragging ? "bg-blue-100" : "bg-slate-100")}>
                        {isUploading ? (
                            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                        ) : (
                            <Upload className={cn("w-6 h-6", isDragging ? "text-blue-600" : "text-slate-400")} />
                        )}
                    </div>

                    <div className="space-y-1">
                        <p className="font-medium text-slate-900">
                            {isUploading ? "Uploading..." : "Drag & drop image here"}
                        </p>
                        <p className="text-sm text-slate-500">or use the options below</p>
                    </div>

                    <div className="flex gap-2 w-full max-w-sm justify-center">
                        <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            className="flex-1"
                            onClick={() => document.getElementById('standard-file-input')?.click()}
                            disabled={disabled || isUploading}
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Browse Files
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                            onClick={() => setShowUrlInput(!showUrlInput)}
                            disabled={disabled}
                        >
                            <LinkIcon className="w-4 h-4 mr-2" />
                            Add URL
                        </Button>
                    </div>
                </div>
            )}

            <input
                type="file"
                id="standard-file-input"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
                disabled={disabled || isUploading}
            />

            {showUrlInput && !value && (
                <div className="flex gap-2 animate-in slide-in-from-top-2">
                    <Input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                        className="border-slate-200 focus:border-blue-500"
                        disabled={disabled}
                    />
                    <Button
                        type="button"
                        onClick={handleUrlSubmit}
                        disabled={!urlInput.trim() || disabled}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Add URL
                    </Button>
                </div>
            )}
        </div>
    );
}
