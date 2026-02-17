"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { getConversations, getQuotes, subscribeToUpdates, startConversation } from "@/lib/supabase-chat";
import { ConversationWithDetails, Customer } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";
import { Loader2, MessageSquare, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function CustomerMessagesPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams();
    const subdomain = params.subdomain as string;
    const activeId = searchParams.get("conv");
    const activeType = searchParams.get("type") as 'conversation' | 'quote' || 'conversation';
    const targetOrganizerId = searchParams.get("organizer");

    // Merged list
    const [allItems, setAllItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<Customer | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const supabase = createClient();

    const refreshData = async (userId: string) => {
        const [convs, quotes] = await Promise.all([
            getConversations(userId),
            getQuotes(userId)
        ]);

        // Add type property
        const taggedConvs = convs.map(c => ({ ...c, itemType: 'conversation' }));
        const taggedQuotes = quotes.map(q => ({ ...q, itemType: 'quote' }));

        // Merge and sort
        const merged = [...taggedConvs, ...taggedQuotes].sort((a, b) => {
            return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
        });

        setAllItems(merged);
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch Customer Profile
            const { data: profile } = await supabase
                .from("customers")
                .select("*")
                .eq("id", user.id)
                .single();

            setCurrentUser(profile);

            await refreshData(user.id);
            setLoading(false);
        };

        init();
    }, []);

    // Subscribe to updates
    useEffect(() => {
        if (!currentUser) return;

        const sub = subscribeToUpdates(currentUser.id, () => {
            refreshData(currentUser.id);
        });

        return () => {
            sub.unsubscribe();
        };
    }, [currentUser]);

    // Handle "Contact Organizer" redirection
    useEffect(() => {
        const handleStartChat = async () => {
            if (!currentUser || activeId || !targetOrganizerId) return;

            // Check existing conversation
            const existingConv = allItems.find(c =>
                c.itemType === 'conversation' &&
                (c.organizer_id === targetOrganizerId && c.customer_id === currentUser.id)
            );

            if (existingConv) {
                router.replace(`/storefront/${subdomain}/customer/messages?conv=${existingConv.id}&type=conversation`);
            } else {
                try {
                    setLoading(true);
                    const newConvId = await startConversation(currentUser.id, targetOrganizerId);
                    router.replace(`/storefront/${subdomain}/customer/messages?conv=${newConvId}&type=conversation`);
                } catch (error) {
                    console.error("Failed to start conversation:", error);
                    setLoading(false);
                }
            }
        };

        if (!loading && currentUser && targetOrganizerId && !activeId) {
            // Only run if checking for targetOrganizer and no active chat is selected yet
            handleStartChat();
        }
    }, [currentUser, activeId, targetOrganizerId, allItems, loading, router, subdomain]);

    const filteredItems = allItems.filter(item => {
        const isCustomer = item.customer_id === currentUser?.id;
        const partner = isCustomer ? item.organizer : item.customer;

        if (!searchQuery) return true;
        if (!partner) return false;

        const nameMatch = (partner.name || "").toLowerCase().includes(searchQuery.toLowerCase());
        const businessName = "business_name" in partner ? (partner as any).business_name : "";
        const businessMatch = (businessName || "").toLowerCase().includes(searchQuery.toLowerCase());
        return nameMatch || businessMatch;
    });

    const activeItem = allItems.find(c => c.id === activeId);

    // Determine partner
    const partner = activeItem
        ? (activeItem.customer_id === currentUser?.id ? activeItem.organizer : activeItem.customer)
        : null;

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 h-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Conversations Sidebar */}
                <div className={cn(
                    "md:col-span-4 border-r border-slate-50 flex flex-col h-full bg-slate-50/30",
                    activeId ? "hidden md:flex" : "flex"
                )}>
                    <div className="p-6 border-b border-slate-50">
                        <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tight flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            Messages
                        </h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-white border-slate-100 rounded-2xl h-11 text-sm font-medium focus-visible:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto hide-scrollbar">
                        <ChatList
                            conversations={filteredItems}
                            activeConversationId={activeId || undefined}
                            onSelect={(id, type) => router.push(`/storefront/${subdomain}/customer/messages?conv=${id}&type=${type}`)}
                            currentUserId={currentUser?.id || ""}
                        />
                    </div>
                </div>

                {/* Chat Area */}
                <div className={cn(
                    "md:col-span-8 flex flex-col h-full min-h-0 relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]",
                    !activeId ? "hidden md:flex" : "flex"
                )}>
                    {activeItem && currentUser ? (
                        <div className="flex-1 flex flex-col h-full min-h-0">
                            {/* Mobile Back Button */}
                            <button
                                onClick={() => router.push(`/storefront/${subdomain}/customer/messages`)}
                                className="md:hidden absolute top-4 left-4 z-50 h-10 w-10 bg-white rounded-full shadow-lg flex items-center justify-center border border-slate-100 text-slate-600 active:scale-90 transition-transform"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                            </button>

                            <ChatWindow
                                conversationId={activeItem.id}
                                currentUser={currentUser}
                                partner={partner as any}
                                bookingId={activeItem.booking_id}
                                type={activeType}
                                quoteStatus={activeItem.status}
                            />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                            <div className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center mb-2 rotate-3">
                                <MessageSquare className="h-10 w-10 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Your Messages</h3>
                                <p className="text-sm text-slate-500 font-bold max-w-xs mx-auto">
                                    Select a conversation to communicate with organizers.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
