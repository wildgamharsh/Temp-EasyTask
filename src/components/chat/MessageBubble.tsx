import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ReactionPicker } from "./ReactionPicker";
import { createClient } from "@/lib/supabase/client";
import { MessageReaction, MessageAttachment } from "@/lib/database.types";
import { FileText, Image as ImageIcon, Film, Music, Archive, Download, ExternalLink } from "lucide-react";

interface MessageBubbleProps {
    messageId: string;
    content: string;
    timestamp: string;
    isOwn: boolean;
    showStatus?: boolean;
    isRead?: boolean;
    currentUserId: string;
    reactions?: MessageReaction[];
    attachments?: MessageAttachment[];
    onProposalAction?: (action: 'accept' | 'reject', messageId: string) => void;
    quoteStatus?: string;
}

interface GroupedReaction {
    emoji: string;
    count: number;
    users: string[];
}

export function MessageBubble({
    messageId,
    content,
    timestamp,
    isOwn,
    showStatus,
    isRead,
    currentUserId,
    reactions = [],
    attachments = [],
    onProposalAction,
    quoteStatus
}: MessageBubbleProps) {
    const supabase = createClient();

    // Group reactions by emoji
    const groupedReactions = useMemo(() => {
        const grouped: Record<string, GroupedReaction> = {};

        reactions.forEach(reaction => {
            if (!grouped[reaction.emoji]) {
                grouped[reaction.emoji] = {
                    emoji: reaction.emoji,
                    count: 0,
                    users: []
                };
            }
            grouped[reaction.emoji].count++;
            grouped[reaction.emoji].users.push(reaction.user_id);
        });

        return Object.values(grouped);
    }, [reactions]);

    const handleReact = async (emoji: string) => {
        // Check if user already reacted with this emoji
        const existingReaction = groupedReactions.find(r =>
            r.emoji === emoji && r.users.includes(currentUserId)
        );

        if (existingReaction) {
            // Remove reaction
            await supabase
                .from('message_reactions')
                .delete()
                .eq('message_id', messageId)
                .eq('user_id', currentUserId)
                .eq('emoji', emoji);
        } else {
            // Add reaction
            await supabase
                .from('message_reactions')
                .insert({
                    message_id: messageId,
                    user_id: currentUserId,
                    emoji
                });
        }
    };

    const isProposal = useMemo(() => {
        try {
            const parsed = JSON.parse(content);
            return parsed.type === 'proposal';
        } catch {
            return false;
        }
    }, [content]);

    const proposalData = useMemo(() => {
        if (!isProposal) return null;
        return JSON.parse(content);
    }, [isProposal, content]);

    const isQuoteRequest = useMemo(() => {
        try {
            const parsed = JSON.parse(content);
            return parsed.type === 'quote_request';
        } catch {
            return false;
        }
    }, [content]);

    const quoteRequestData = useMemo(() => {
        if (!isQuoteRequest) return null;
        return JSON.parse(content);
    }, [isQuoteRequest, content]);

    // Use the prop directly

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

    return (
        <div className={cn("flex w-full mb-4", isOwn ? "justify-end" : "justify-start")}>
            <div className="flex flex-col gap-1 max-w-[80%] md:max-w-[70%]">
                {isProposal ? (
                    <div className={cn(
                        "rounded-2xl shadow-md overflow-hidden border-2",
                        isOwn ? "bg-white border-blue-100" : "bg-white border-blue-600"
                    )}>
                        <div className="bg-blue-600 p-3 text-white">
                            <p className="text-xs font-black uppercase tracking-widest opacity-80">Official Proposal</p>
                        </div>
                        <div className="p-4 space-y-3">
                            <p className="text-sm font-medium text-slate-600">
                                The organizer has proposed a final price for this service.
                            </p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-sm font-bold text-slate-400">Total:</span>
                                <span className="text-3xl font-black text-slate-900">${proposalData.price.toFixed(2)}</span>
                            </div>

                            {!isOwn && (
                                <div className="grid grid-cols-2 gap-2 pt-2">
                                    <ProposalActions
                                        price={proposalData.price}
                                        onAction={(action) => onProposalAction?.(action, messageId)}
                                        disabled={quoteStatus === 'completed' || quoteStatus === 'cancelled'}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ) : isQuoteRequest ? (
                    <div className="rounded-2xl shadow-md overflow-hidden border-2 bg-white border-orange-100 w-full">
                        <div className="bg-orange-50 p-4 border-b border-orange-100 flex items-center justify-center sm:justify-between flex-wrap gap-2">
                            <h4 className="text-sm font-black text-orange-800 uppercase tracking-widest text-center sm:text-left">
                                Quotation Request
                            </h4>
                            <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                                PENDING REVIEW
                            </span>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* Header Info */}
                            <div className="flex items-start justify-between flex-wrap gap-4">
                                <div>
                                    <h3 className="text-lg font-black text-slate-800">{quoteRequestData.data.serviceName}</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">
                                        Requested by {quoteRequestData.data.customerName}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-black text-slate-800 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 inline-block">
                                        {quoteRequestData.data.eventDate || "Date TBD"}
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                                        {quoteRequestData.data.eventTime}
                                    </p>
                                </div>
                            </div>

                            {/* Breakdown */}
                            {quoteRequestData.data.configuration && quoteRequestData.data.configuration.length > 0 && (
                                <div className="pt-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Requested Configuration</p>
                                    <div className="space-y-2">
                                        {quoteRequestData.data.configuration.map((item: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-slate-50 last:border-0">
                                                <span className="font-medium text-slate-600">{item.stepTitle}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900">{item.optionTitle}</span>
                                                    {item.quantity > 1 && (
                                                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                            x{item.quantity}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div
                        className={cn(
                            "px-4 py-2.5 rounded-2xl shadow-sm relative group max-w-full break-words",
                            isOwn
                                ? "bg-primary text-white rounded-tr-none"
                                : "bg-slate-100 text-slate-800 rounded-tl-none"
                        )}
                    >
                        <p className="text-sm leading-relaxed antialiased font-medium whitespace-pre-wrap">{content}</p>

                        {/* Attachments */}
                        {attachments && attachments.length > 0 && (
                            <div className={cn(
                                "mt-2 space-y-2",
                                isOwn ? "border-t border-white/20 pt-2" : "border-t border-slate-200 pt-2"
                            )}>
                                {attachments.map((attachment, index) => {
                                    const Icon = getFileIcon(attachment.type);
                                    const isImage = attachment.type.startsWith("image/");
                                    
                                    if (isImage && attachment.url) {
                                        return (
                                            <a
                                                key={index}
                                                href={attachment.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block"
                                            >
                                                <div className="relative rounded-lg overflow-hidden border border-black/10 group">
                                                    <img
                                                        src={attachment.url}
                                                        alt={attachment.name}
                                                        className="w-full max-w-[200px] h-auto object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <ExternalLink className="w-5 h-5 text-white" />
                                                    </div>
                                                </div>
                                            </a>
                                        );
                                    }
                                    
                                    return (
                                        <a
                                            key={index}
                                            href={attachment.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={cn(
                                                "flex items-center gap-3 p-2.5 rounded-lg border transition-all hover:scale-[1.02]",
                                                isOwn 
                                                    ? "bg-white/10 border-white/20 hover:bg-white/20" 
                                                    : "bg-white border-slate-200 hover:border-slate-300"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                                                isOwn ? "bg-white/20" : "bg-slate-100"
                                            )}>
                                                <Icon className={cn("w-5 h-5", isOwn ? "text-white" : "text-slate-500")} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={cn(
                                                    "text-sm font-medium truncate",
                                                    isOwn ? "text-white" : "text-slate-700"
                                                )}>
                                                    {attachment.name}
                                                </p>
                                                <p className={cn(
                                                    "text-xs",
                                                    isOwn ? "text-white/60" : "text-slate-400"
                                                )}>
                                                    {formatFileSize(attachment.size)}
                                                </p>
                                            </div>
                                            <Download className={cn(
                                                "w-4 h-4 shrink-0",
                                                isOwn ? "text-white/60" : "text-slate-400"
                                            )} />
                                        </a>
                                    );
                                })}
                            </div>
                        )}

                        <div className={cn(
                            "flex items-center gap-1.5 mt-1 opacity-60 text-[10px] font-bold",
                            isOwn ? "justify-end" : "justify-start"
                        )}>
                            <span>{format(new Date(timestamp), "p")}</span>
                            {isOwn && showStatus && (
                                <div className="flex items-center">
                                    {isRead ? (
                                        <div className="flex -space-x-1">
                                            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-white/80">
                                                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" />
                                            </svg>
                                            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-white/80">
                                                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" />
                                            </svg>
                                        </div>
                                    ) : (
                                        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-white/60">
                                            <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" />
                                        </svg>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Decorative tail */}
                        <div className={cn(
                            "absolute top-0 w-2 h-2",
                            isOwn
                                ? "-right-1 bg-primary [clip-path:polygon(0_0,0_100%,100%_0)]"
                                : "-left-1 bg-slate-100 [clip-path:polygon(100%_0,100%_100%,0_0)]"
                        )} />

                        {/* Reaction Picker - Shows on hover */}
                        <div className="absolute -bottom-3 right-2">
                            <ReactionPicker onReact={handleReact} />
                        </div>
                    </div>
                )}


                {/* Display Reactions */}
                {groupedReactions.length > 0 && (
                    <div className={cn(
                        "flex flex-wrap gap-1 px-2",
                        isOwn ? "justify-end" : "justify-start"
                    )}>
                        {groupedReactions.map((reaction, index) => {
                            const userReacted = reaction.users.includes(currentUserId);
                            return (
                                <button
                                    key={index}
                                    onClick={() => handleReact(reaction.emoji)}
                                    className={cn(
                                        "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all hover:scale-110",
                                        userReacted
                                            ? "bg-primary/10 border border-primary/30"
                                            : "bg-slate-100 border border-slate-200 hover:bg-slate-200"
                                    )}
                                >
                                    <span>{reaction.emoji}</span>
                                    <span className="text-[10px] font-bold">{reaction.count}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

interface ProposalActionsProps {
    price: number;
    onAction: (action: 'accept' | 'reject') => void;
    disabled?: boolean;
}

function ProposalActions({ price, onAction, disabled }: ProposalActionsProps) {
    return (
        <div className="flex gap-2 w-full col-span-2">
            <button
                onClick={() => onAction('reject')}
                disabled={disabled}
                className="flex-1 py-2 bg-red-50 text-red-600 font-bold text-xs rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Reject
            </button>
            <button
                onClick={() => onAction('accept')}
                disabled={disabled}
                className="flex-1 py-2 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Accept Offer
            </button>
        </div>
    )
}
