"use client";

import React, { useState, useRef } from "react";
import { X, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureTagInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
    label?: string;
    hint?: string;
    error?: string;
    maxTags?: number;
    placeholder?: string;
}

export function FeatureTagInput({
    value = [],
    onChange,
    label,
    hint,
    error,
    maxTags = 10,
    placeholder = "Add a feature...",
}: FeatureTagInputProps) {
    const [inputValue, setInputValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTag();
        } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
            removeTag(value.length - 1);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const paste = e.clipboardData.getData("text");

        // Split by newlines or commas
        const items = paste
            .split(/[\n,]/) // Split by newline or comma
            .map(item => item.trim())
            .filter(item => item.length > 0);

        if (items.length === 0) return;

        // Filter duplicates and limit to maxTags
        const newTags = items.filter(item => !value.includes(item));
        const availableSlots = maxTags - value.length;
        const tagsToAdd = newTags.slice(0, availableSlots);

        if (tagsToAdd.length > 0) {
            onChange([...value, ...tagsToAdd]);
            setInputValue("");
        }
    };

    const addTag = () => {
        const trimmed = inputValue.trim();
        if (!trimmed) return;

        if (value.includes(trimmed)) {
            setInputValue(""); // Clear duplicate attempt
            return;
        }

        if (value.length >= maxTags) return;

        onChange([...value, trimmed]);
        setInputValue("");
    };

    const removeTag = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide ml-0.5">
                    {label}
                </label>
            )}

            <div
                className={cn(
                    "flex flex-wrap items-center gap-2 min-h-[42px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm transition-all duration-200 cursor-text",
                    isFocused
                        ? "border-blue-500 ring-[3px] ring-blue-500/10"
                        : "hover:border-blue-300",
                    error && "border-red-300 ring-red-500/10"
                )}
                onClick={() => inputRef.current?.focus()}
            >
                {/* Tags */}
                {value.map((tag, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium animate-in zoom-in-50 duration-200"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeTag(index);
                            }}
                            className="text-blue-400 hover:text-blue-900 transition-colors"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}

                {/* Input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => {
                        setIsFocused(false);
                        addTag(); // Auto-add on blur if content exists
                    }}
                    placeholder={value.length === 0 ? placeholder : ""}
                    className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
                    disabled={value.length >= maxTags}
                />
            </div>

            {/* Helper Text / Error */}
            {(error || hint) && (
                <div className="flex items-center justify-between ml-0.5 mt-1">
                    {error ? (
                        <p className="text-xs text-red-600 font-medium">{error}</p>
                    ) : (
                        <p className="text-xs text-gray-500">{hint}</p>
                    )}
                    <p className="text-xs text-gray-400">
                        {value.length}/{maxTags}
                    </p>
                </div>
            )}

            {/* Quick Add Hint */}
            {inputValue && !error && (
                <p className="text-xs text-blue-600 font-medium ml-0.5 mt-1 animate-in fade-in slide-in-from-top-1">
                    Press <kbd className="font-sans px-1 rounded bg-blue-100 text-blue-800">Enter</kbd> to add
                </p>
            )}
        </div>
    );
}
