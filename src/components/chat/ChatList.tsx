"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ChevronDown, ChevronRight, MessageSquare, BookOpen, CheckCircle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Union type for items
type ChatItem = any; // Using any to avoid strict type hell with mixed types temporarily, better to use proper Union

interface ChatListProps {
    conversations: ChatItem[];
    activeConversationId?: string;
    onSelect: (id: string, type: 'conversation' | 'quote') => void;
    currentUserId: string;
}

export function ChatList({ conversations, activeConversationId, onSelect, currentUserId }: ChatListProps) {
    if (conversations.length === 0) {
        return (
            <div className="p-8 text-center space-y-3">
                <div className="w-16 h-16 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center mx-auto">
                    <span className="text-2xl text-slate-300">💬</span>
                </div>
                <div>
                    <p className="text-sm font-black text-slate-900">No conversations</p>
                    <p className="text-[11px] text-slate-500 font-bold">Your messages will appear here.</p>
                </div>
            </div>
        );
    }

    // Identify types based on properties (is_quote check or table origin)
    // We assume the parent component passes a mixed list where we can distinguish
    // Ideally update mapped objects to have 'type' property

    // Categorize
    const chats = conversations.filter(c => !c.status && !c.quote_data); // Standard conversations (no status/quote_data)
    const openQuotes = conversations.filter(c => (c.status === 'pending' || c.status === 'finalizing' || c.status === 'quote_requested'));
    const closedQuotes = conversations.filter(c => (c.status === 'completed' || c.status === 'cancelled' || c.status === 'rejected'));

    // If no quotes exist, just show list without categories (as requested: "in the starting don't shwo the categroies")
    const showCategories = openQuotes.length > 0 || closedQuotes.length > 0;

    if (!showCategories) {
        return (
            <div className="flex flex-col">
                {conversations.map(c => (
                    <ChatListItem
                        key={c.id}
                        item={c}
                        activeId={activeConversationId}
                        onSelect={() => onSelect(c.id, 'conversation')}
                        currentUserId={currentUserId}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-1 p-2">
            <CategorySection
                title="Chats"
                icon={<MessageSquare className="h-3.5 w-3.5" />}
                items={chats}
                activeId={activeConversationId}
                onSelect={(id: string) => onSelect(id, 'conversation')}
                currentUserId={currentUserId}
                defaultOpen={true}
            />

            <CategorySection
                title="Open Quotes"
                icon={<BookOpen className="h-3.5 w-3.5" />}
                items={openQuotes}
                activeId={activeConversationId}
                onSelect={(id: string) => onSelect(id, 'quote')}
                currentUserId={currentUserId}
                defaultOpen={true}
            />

            <CategorySection
                title="Closed Quotes"
                icon={<CheckCircle className="h-3.5 w-3.5" />}
                items={closedQuotes}
                activeId={activeConversationId}
                onSelect={(id: string) => onSelect(id, 'quote')}
                currentUserId={currentUserId}
                defaultOpen={false}
            />
        </div>
    );
}

function CategorySection({ title, icon, items, activeId, onSelect, currentUserId, defaultOpen }: any) {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    if (items.length === 0) return null;

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-2">
            <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 text-xs font-black text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors">
                {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                <span className="flex items-center gap-2">{icon} {title} <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-full">{items.length}</span></span>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="flex flex-col">
                    {items.map((item: any) => (
                        <ChatListItem
                            key={item.id}
                            item={item}
                            activeId={activeId}
                            onSelect={() => onSelect(item.id)}
                            currentUserId={currentUserId}
                        />
                    ))}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}

function ChatListItem({ item, activeId, onSelect, currentUserId }: any) {
    const isCustomer = item.customer_id === currentUserId;
    const partner = isCustomer ? item.organizer : item.customer;
    const isActive = activeId === item.id;

    // Robust checks for optional partner data
    const businessName = partner && "business_name" in partner ? partner.business_name : undefined;
    const logoUrl = partner && "logo_url" in partner ? partner.logo_url : undefined; // Customer usually doesn't have logo_url directly unless mapped
    // If partner is customer, they have 'name' and 'email'.
    // If partner is organizer, they have 'business_name', 'name', 'logo_url'.

    const displayName = partner
        ? (businessName || partner.name)
        : "Unknown User";

    const avatarInitial = (displayName || "?").charAt(0);

    return (
        <button
            onClick={onSelect}
            className={cn(
                "w-full p-3 flex items-center gap-3 transition-all relative group rounded-xl",
                isActive ? "bg-primary/5" : "hover:bg-slate-100"
            )}
        >
            {isActive && <div className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-full" />}

            <div className="relative flex-shrink-0">
                <Avatar className="h-9 w-9 border border-slate-200">
                    <AvatarImage src={logoUrl} />
                    <AvatarFallback className="bg-white text-slate-600 font-bold text-[10px]">
                        {avatarInitial}
                    </AvatarFallback>
                </Avatar>
                {/* Status dot if needed */}
            </div>

            <div className="flex-1 min-w-0 text-left overflow-hidden">
                <div className="flex justify-between items-center mb-0.5">
                    <h4 className={cn(
                        "text-xs font-bold truncate",
                        isActive ? "text-primary" : "text-slate-700"
                    )}>
                        {displayName}
                    </h4>
                    <span className="text-[10px] font-medium text-slate-400 flex-shrink-0">
                        {item.last_message_at ? format(new Date(item.last_message_at), "MMM d") : ""}
                    </span>
                </div>

                <div className="flex justify-between items-center gap-2">
                    <p className={cn(
                        "text-[11px] truncate",
                        item.unread_count && item.unread_count > 0 ? "text-slate-900 font-bold" : "text-slate-500 font-medium"
                    )}>
                        {getPreviewText(item)}
                    </p>

                    {item.unread_count > 0 && (
                        <span className="h-4 min-w-[16px] px-1 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                            {item.unread_count}
                        </span>
                    )}
                </div>

                {item.status && (
                    <div className="mt-1 flex items-center gap-1">
                        <span className={cn(
                            "text-[9px] px-1.5 py-0.5 rounded-md uppercase font-bold tracking-wider",
                            item.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                                item.status === 'pending' ? "bg-amber-100 text-amber-700" :
                                    "bg-slate-100 text-slate-600"
                        )}>
                            {item.status}
                        </span>
                    </div>
                )}
            </div>
        </button>
    );
}

function getPreviewText(item: any) {
    if (item.last_message) {
        try {
            // Try to parse if it's JSON (special system messages)
            const data = JSON.parse(item.last_message);
            if (data.type === 'quote_request') return "New Quote Request";
            if (data.type === 'proposal') return `Proposal: $${data.price}`;
            if (data.type === 'status_change') return `Status: ${data.status}`;
            if (data.text) return data.text;
        } catch (e) {
            // Plain text
            return item.last_message;
        }
    }
    return "Start a conversation...";
}
