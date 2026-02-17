"use client";

import React, { useState } from "react";
import { ThumbsUp, Heart, Laugh, Zap, Frown, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReactionPickerProps {
    onReact: (emoji: string) => void;
    className?: string;
}

const REACTIONS = [
    { emoji: "👍", icon: ThumbsUp, label: "Like" },
    { emoji: "❤️", icon: Heart, label: "Love" },
    { emoji: "😂", icon: Laugh, label: "Laugh" },
    { emoji: "😮", icon: Zap, label: "Wow" },
    { emoji: "😢", icon: Frown, label: "Sad" },
    { emoji: "🎉", icon: PartyPopper, label: "Celebrate" },
];

export function ReactionPicker({ onReact, className }: ReactionPickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleReact = (emoji: string) => {
        onReact(emoji);
        setIsOpen(false);
    };

    return (
        <div className={cn("relative", className)}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded-full"
                aria-label="Add reaction"
            >
                <span className="text-sm">😊</span>
            </button>

            {/* Reaction Picker Popup */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Picker */}
                    <div className="absolute bottom-full mb-2 left-0 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 flex gap-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        {REACTIONS.map(({ emoji, icon: Icon, label }) => (
                            <button
                                key={emoji}
                                onClick={() => handleReact(emoji)}
                                className="group/reaction p-2 hover:bg-slate-50 rounded-xl transition-all hover:scale-110 active:scale-95"
                                title={label}
                            >
                                <span className="text-xl">{emoji}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
