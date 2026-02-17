"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
    onSend: (message: string) => void;
    onTyping?: () => void;
    onStopTyping?: () => void;
    placeholder?: string;
    disabled?: boolean;
}

export function ChatInput({ onSend, onTyping, onStopTyping, placeholder = "Type a message...", disabled }: ChatInputProps) {
    const [message, setMessage] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if (!message.trim() || disabled) return;
        onSend(message.trim());
        setMessage("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Auto-grow textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [message]);

    // Handle typing indicator
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);

        // Broadcast typing status
        if (e.target.value.length > 0 && onTyping) {
            onTyping();
        } else if (e.target.value.length === 0 && onStopTyping) {
            onStopTyping();
        }
    };

    return (
        <div className="flex items-end gap-3 w-full">
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/5 transition-all flex items-end shadow-sm">
                <Textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="min-h-[48px] max-h-[150px] bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 py-3 px-4 resize-none text-sm font-medium hide-scrollbar transition-all"
                    disabled={disabled}
                />
                <div className="p-2 flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors" disabled={disabled}>
                        <Smile className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <Button
                onClick={handleSend}
                disabled={!message.trim() || disabled}
                className="h-12 w-12 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 flex-shrink-0 transition-all active:scale-95 group"
            >
                <Send className="h-5 w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
        </div>
    );
}
