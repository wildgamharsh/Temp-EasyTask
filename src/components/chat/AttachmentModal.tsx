"use client";

import React, { useCallback, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Upload, File, Image, FileText, Film, Music, Archive, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AttachmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFilesSelected: (files: File[]) => void;
    maxFiles?: number;
    maxSize?: number; // in bytes
    acceptedTypes?: string[];
}

const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return Image;
    if (type.startsWith("video/")) return Film;
    if (type.startsWith("audio/")) return Music;
    if (type.includes("pdf") || type.includes("document") || type.includes("text")) return FileText;
    if (type.includes("zip") || type.includes("archive") || type.includes("compressed")) return Archive;
    return File;
};

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export function AttachmentModal({
    isOpen,
    onClose,
    onFilesSelected,
    maxFiles = 5,
    maxSize = 10 * 1024 * 1024, // 10MB default
    acceptedTypes
}: AttachmentModalProps) {
    const [mounted, setMounted] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const validateFiles = useCallback((files: File[]): File[] => {
        const validFiles: File[] = [];
        const errors: string[] = [];

        files.forEach((file) => {
            if (file.size > maxSize) {
                errors.push(`${file.name} exceeds ${formatFileSize(maxSize)}`);
                return;
            }
            if (acceptedTypes && acceptedTypes.length > 0) {
                const isAccepted = acceptedTypes.some((type) => {
                    if (type.endsWith("/*")) {
                        return file.type.startsWith(type.replace("/*", "/"));
                    }
                    return file.type === type || file.name.toLowerCase().endsWith(type.replace(".", "."));
                });
                if (!isAccepted) {
                    errors.push(`${file.name} is not an accepted file type`);
                    return;
                }
            }
            validFiles.push(file);
        });

        if (errors.length > 0) {
            setError(errors[0]);
            setTimeout(() => setError(null), 3000);
        }

        return validFiles;
    }, [maxSize, acceptedTypes]);

    const handleFiles = useCallback((files: File[]) => {
        const validFiles = validateFiles(files);
        const totalFiles = selectedFiles.length + validFiles.length;
        
        if (totalFiles > maxFiles) {
            setError(`Maximum ${maxFiles} files allowed`);
            setTimeout(() => setError(null), 3000);
            return;
        }

        setSelectedFiles((prev) => [...prev, ...validFiles]);
    }, [validateFiles, selectedFiles.length, maxFiles]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    }, [handleFiles]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            handleFiles(files);
        }
    }, [handleFiles]);

    const removeFile = useCallback((index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const handleConfirm = useCallback(() => {
        if (selectedFiles.length > 0) {
            onFilesSelected(selectedFiles);
            setSelectedFiles([]);
            onClose();
        }
    }, [selectedFiles, onFilesSelected, onClose]);

    const handleClose = useCallback(() => {
        setSelectedFiles([]);
        setError(null);
        onClose();
    }, [onClose]);

    if (!mounted || !isOpen) return null;

    const acceptedExtensions = acceptedTypes?.map(t => t.replace(".", ".")).join(", ") || "All files";

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl transform transition-all scale-100 opacity-100 flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Upload className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Add Attachments</h3>
                            <p className="text-xs text-slate-500">Max {maxFiles} files, up to {formatFileSize(maxSize)}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                    {/* Drop Zone */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
                            isDragging
                                ? "border-primary bg-primary/5 scale-[1.02]"
                                : "border-slate-200 hover:border-primary/50 hover:bg-slate-50"
                        )}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept={acceptedTypes?.join(",")}
                            onChange={handleFileInput}
                            className="hidden"
                        />
                        <div className="flex flex-col items-center gap-3">
                            <div className={cn(
                                "w-14 h-14 rounded-full flex items-center justify-center transition-colors",
                                isDragging ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                            )}>
                                <Upload className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-700">
                                    {isDragging ? "Drop files here" : "Click to upload or drag and drop"}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {acceptedExtensions}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 animate-in slide-in-from-top-2">
                            <X className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Selected Files List */}
                    {selectedFiles.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Selected Files ({selectedFiles.length}/{maxFiles})
                            </p>
                            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                {selectedFiles.map((file, index) => {
                                    const Icon = getFileIcon(file.type);
                                    const isImage = file.type.startsWith("image/");
                                    
                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors group"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                                {isImage ? (
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={file.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Icon className="w-5 h-5 text-slate-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-700 truncate">
                                                    {file.name}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {formatFileSize(file.size)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFile(index);
                                                }}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 shrink-0 bg-slate-50 rounded-b-2xl">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="h-10 px-4 text-sm font-semibold"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={selectedFiles.length === 0}
                        className="h-10 px-6 text-sm font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                    >
                        {selectedFiles.length > 0 ? (
                            <span className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                Add {selectedFiles.length} File{selectedFiles.length > 1 ? "s" : ""}
                            </span>
                        ) : (
                            "Select Files"
                        )}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
}
