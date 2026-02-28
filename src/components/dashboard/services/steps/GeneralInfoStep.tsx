"use client";

import React, { useState } from "react";
import { ModernInput } from "../shared/ModernInput";
import { ModernTextarea } from "../shared/ModernTextarea";
import { FeatureTagInput } from "../shared/FeatureTagInput";
import { ServiceImagePickerModal } from "../shared/ServiceImagePickerModal";
import { Plus, GripVertical, X as XIcon, ImagePlus } from "lucide-react";
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

export function GeneralInfoStep({ data, onUpdate }: GeneralInfoStepProps) {
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    /* ──────────────── Image Picker ──────────────── */

    const handleImageSelect = (url: string) => {
        onUpdate({ images: [...data.images, url] });
    };

    const handleRemoveImage = (index: number) => {
        onUpdate({ images: data.images.filter((_, i) => i !== index) });
    };

    /* ──────────────── Drag to Reorder ──────────────── */

    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData("text/plain", index.toString());
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (dragOverIndex !== index) setDragOverIndex(index);
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        setDragOverIndex(null);
        const dragIndexStr = e.dataTransfer.getData("text/plain");
        if (!dragIndexStr) return;
        const dragIndex = parseInt(dragIndexStr);
        if (isNaN(dragIndex) || dragIndex === dropIndex) return;

        const newImages = [...data.images];
        const [moved] = newImages.splice(dragIndex, 1);
        newImages.splice(dropIndex, 0, moved);
        onUpdate({ images: newImages });
    };

    const handleDragEnd = () => setDragOverIndex(null);

    return (
        <>
            <ServiceImagePickerModal
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelect={handleImageSelect}
            />

            {/*
             * Two-pane layout:
             *   Left  (55%) — Text fields + highlights
             *   Right (45%) — Image gallery
             */}
            <div className="flex gap-8 min-h-0">

                {/* ═══════════════════════════════════════
                    LEFT PANE — Service Identity + Highlights
                    ═══════════════════════════════════════ */}
                <div className="flex-[55] flex flex-col gap-8 min-w-0">

                    {/* Identity */}
                    <section>
                        <SectionLabel
                            number={1}
                            title="Service Identity"
                            subtitle="Give your service a clear, professional title and description."
                        />
                        <div className="flex flex-col gap-5 mt-5">
                            <ModernInput
                                label="Service Title"
                                placeholder="e.g. Full Day Wedding Photography"
                                value={data.title}
                                onChange={(e) => onUpdate({ title: e.target.value })}
                                width="full"
                                hint="Make it catchy but descriptive. 50 characters recommended."
                            />
                            <ModernTextarea
                                label="Description"
                                placeholder="Describe your service — what's included, your style, and what makes you unique..."
                                value={data.description}
                                onChange={(e) => onUpdate({ description: e.target.value })}
                                className="min-h-[160px]"
                                hint="Services with detailed descriptions get significantly more inquiries."
                            />
                        </div>
                    </section>

                    {/* Highlights */}
                    <section>
                        <SectionLabel
                            number={2}
                            title="Key Highlights"
                            subtitle="Short tags shown on your listing card in search results. Keep them snappy."
                        />
                        <div className="mt-5">
                            <FeatureTagInput
                                label="Service Highlights"
                                value={data.highlights}
                                onChange={(tags) => onUpdate({ highlights: tags })}
                                placeholder="e.g. Instant Delivery, Verified Pro…"
                                hint="Paste a comma-separated or line-separated list to add multiple at once"
                                maxTags={5}
                            />
                        </div>
                    </section>
                </div>

                {/* Vertical divider */}
                <div className="w-px bg-gray-100 shrink-0 self-stretch" />

                {/* ═══════════════════════════════════════
                    RIGHT PANE — Visual Gallery
                    ═══════════════════════════════════════ */}
                <div className="flex-[45] flex flex-col min-w-0">
                    <div className="flex items-start justify-between mb-5">
                        <SectionLabel
                            number={3}
                            title="Visual Gallery"
                            subtitle="Showcase your best work. High-quality images increase bookings."
                        />
                        <button
                            onClick={() => setIsPickerOpen(true)}
                            className="flex items-center gap-1.5 shrink-0 ml-4 mt-0.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-blue-600/30"
                        >
                            <ImagePlus size={15} />
                            Add Image
                        </button>
                    </div>

                    {data.images.length === 0 ? (
                        /* Single clean empty zone */
                        <div
                            onClick={() => setIsPickerOpen(true)}
                            className="cursor-pointer group w-full aspect-video rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center transition-colors hover:border-blue-300 hover:bg-blue-50/40"
                        >
                            <ImagePlus size={32} className="text-gray-300 group-hover:text-blue-400 mb-2 transition-colors" />
                            <p className="text-sm font-medium text-gray-400 group-hover:text-blue-500 transition-colors">
                                Click to add your first photo
                            </p>
                            <p className="text-xs text-gray-300 mt-1 group-hover:text-blue-400 transition-colors">
                                Or use the Add Image button above
                            </p>
                        </div>
                    ) : (
                        /* Filled image grid */
                        <div className="flex flex-col gap-3">
                            {/* Cover image — full width, taller */}
                            {data.images[0] && (
                                <div
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, 0)}
                                    onDragOver={(e) => handleDragOver(e, 0)}
                                    onDrop={(e) => handleDrop(e, 0)}
                                    onDragEnd={handleDragEnd}
                                    className={cn(
                                        "group relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200 cursor-move transition-all duration-200",
                                        dragOverIndex === 0 && "opacity-50 scale-[0.98] ring-2 ring-blue-500"
                                    )}
                                >
                                    <img
                                        src={data.images[0]}
                                        alt="Cover"
                                        className="w-full h-full object-cover pointer-events-none"
                                    />
                                    {/* Cover badge */}
                                    <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
                                        COVER
                                    </div>
                                    <ImageHoverOverlay
                                        onRemove={(e) => {
                                            e.stopPropagation();
                                            handleRemoveImage(0);
                                        }}
                                    />
                                </div>
                            )}

                            {/* Remaining images — 3-col grid */}
                            {data.images.length > 1 && (
                                <div className="grid grid-cols-3 gap-3">
                                    {data.images.slice(1).map((url, relIdx) => {
                                        const idx = relIdx + 1;
                                        return (
                                            <div
                                                key={idx}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, idx)}
                                                onDragOver={(e) => handleDragOver(e, idx)}
                                                onDrop={(e) => handleDrop(e, idx)}
                                                onDragEnd={handleDragEnd}
                                                className={cn(
                                                    "group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 cursor-move transition-all duration-200",
                                                    dragOverIndex === idx && "opacity-50 scale-95 ring-2 ring-blue-500"
                                                )}
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Image ${idx}`}
                                                    className="w-full h-full object-cover pointer-events-none"
                                                />
                                                <ImageHoverOverlay
                                                    onRemove={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveImage(idx);
                                                    }}
                                                />
                                            </div>
                                        );
                                    })}

                                    {/* Add more slot */}
                                    {data.images.length < 10 && (
                                        <button
                                            onClick={() => setIsPickerOpen(true)}
                                            className="aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400 hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-500 transition-all"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Pro tip */}
                            <p className="text-xs text-gray-400 mt-1">
                                <span className="font-semibold text-gray-500">Tip:</span> Drag images to reorder them. The first image is your cover photo.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

/* ─── Sub-components ─── */

function SectionLabel({
    number,
    title,
    subtitle,
}: {
    number: number;
    title: string;
    subtitle: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                {number}
            </span>
            <div>
                <h3 className="text-base font-semibold text-gray-900 leading-snug">{title}</h3>
                <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
            </div>
        </div>
    );
}

function ImageHoverOverlay({ onRemove }: { onRemove: (e: React.MouseEvent) => void }) {
    return (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-start justify-between p-2 opacity-0 group-hover:opacity-100">
            {/* Drag handle */}
            <span className="bg-white/90 p-1 rounded-md shadow-sm text-gray-600">
                <GripVertical size={14} />
            </span>
            {/* Remove button */}
            <button
                onClick={onRemove}
                className="bg-white/90 p-1 rounded-md shadow-sm text-gray-600 hover:text-red-600 hover:bg-white transition-colors"
            >
                <XIcon size={14} />
            </button>
        </div>
    );
}
