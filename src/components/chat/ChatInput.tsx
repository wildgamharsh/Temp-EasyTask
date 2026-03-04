"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip, X, FileText, Image as ImageIcon, Film, Music, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AttachmentModal } from "./AttachmentModal";
import { cn } from "@/lib/utils";

interface ChatInputProps {
    onSend: (message: string, attachments: File[]) => void;
    onTyping?: () => void;
    onStopTyping?: () => void;
    placeholder?: string;
    disabled?: boolean;
}

const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return ImageIcon;
    if (type.startsWith("video/")) return Film;
    if (type.startsWith("audio/")) return Music;
    if (type.includes("pdf") || type.includes("document") || type.includes("text")) return FileText;
    if (type.includes("zip") || type.includes("archive") || type.includes("compressed")) return Archive;
    return FileText;
};

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export function ChatInput({ onSend, onTyping, onStopTyping, placeholder = "Type a message...", disabled }: ChatInputProps) {
    const [message, setMessage] = useState("");
    const [pendingAttachments, setPendingAttachments] = useState<File[]>([]);
    const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if ((!message.trim() && pendingAttachments.length === 0) || disabled) return;
        onSend(message.trim(), pendingAttachments);
        setMessage("");
        setPendingAttachments([]);
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

    const handleFilesSelected = (files: File[]) => {
        setPendingAttachments((prev) => [...prev, ...files]);
    };

    const removeAttachment = (index: number) => {
        setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [message]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);

        if (e.target.value.length > 0 && onTyping) {
            onTyping();
        } else if (e.target.value.length === 0 && onStopTyping) {
            onStopTyping();
        }
    };

    const canSend = message.trim() || pendingAttachments.length > 0;

    return (
        <div className="flex flex-col gap-3 w-full">
            {/* Attachment Staging Area */}
            {pendingAttachments.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    {pendingAttachments.map((file, index) => {
                        const Icon = getFileIcon(file.type);
                        const isImage = file.type.startsWith("image/");
                        
                        return (
                            <div
                                key={index}
                                className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm group"
                            >
                                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                    {isImage ? (
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Icon className="w-4 h-4 text-slate-500" />
                                    )}
                                </div>
                                <div className="flex flex-col min-w-0 max-w-[120px]">
                                    <span className="text-xs font-medium text-slate-700 truncate">
                                        {file.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                        {formatFileSize(file.size)}
                                    </span>
                                </div>
                                <button
                                    onClick={() => removeAttachment(index)}
                                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors shrink-0"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

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
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors" 
                            onClick={() => setIsAttachmentModalOpen(true)}
                            disabled={disabled}
                        >
                            <Paperclip className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors" disabled={disabled}>
                            <Smile className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <Button
                    onClick={handleSend}
                    disabled={!canSend || disabled}
                    className="h-12 w-12 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 flex-shrink-0 transition-all active:scale-95 group"
                >
                    <Send className="h-5 w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
            </div>

            <AttachmentModal
                isOpen={isAttachmentModalOpen}
                onClose={() => setIsAttachmentModalOpen(false)}
                onFilesSelected={handleFilesSelected}
                maxFiles={5}
                maxSize={10 * 1024 * 1024}
            />
        </div>
    );
}
