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
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function CustomerMessagesPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams();
    const subdomain = params.subdomain as string;
    const activeId = searchParams.get("conv");
    const activeType = searchParams.get("type") as 'conversation' | 'quote' || 'conversation';
    const targetOrganizerId = searchParams.get("organizer");

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

        const taggedConvs = convs.map(c => ({ ...c, itemType: 'conversation' }));
        const taggedQuotes = quotes.map(q => ({ ...q, itemType: 'quote' }));

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

    useEffect(() => {
        if (!currentUser) return;

        const sub = subscribeToUpdates(currentUser.id, () => {
            refreshData(currentUser.id);
        });

        return () => {
            sub.unsubscribe();
        };
    }, [currentUser]);

    useEffect(() => {
        const handleStartChat = async () => {
            if (!currentUser || activeId || !targetOrganizerId) return;

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
        <div className="h-full flex flex-col">
            {/* Header */}
            {!activeId && (
                <div className="flex-shrink-0 text-center space-y-2 pb-4">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        Messages
                    </h1>
                    <p className="text-muted-foreground">
                        Communicate with organizers about your bookings
                    </p>
                </div>
            )}

            <div className="flex-1 min-h-0 flex flex-col">
                <Card className="overflow-hidden border-0 shadow-md flex-1">
                    <CardContent className="p-0 h-full">
                        <div className="grid grid-cols-1 md:grid-cols-12 h-full">
                            {/* Conversations Sidebar */}
                            <div className={cn(
                                "md:col-span-4 border-r border-slate-100 flex flex-col h-full bg-slate-50/30",
                                activeId ? "hidden md:flex" : "flex"
                            )}>
                                <div className="p-4 border-b border-slate-100 flex-shrink-0">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="Search conversations..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9 bg-white border-slate-200 rounded-xl h-10 text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto hide-scrollbar min-h-0">
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
                                "md:col-span-8 flex flex-col h-full min-h-0 relative",
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
                                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                                        <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center">
                                            <MessageSquare className="h-8 w-8 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">Your Messages</h3>
                                            <p className="text-sm text-slate-500 mt-1 max-w-xs">
                                                Select a conversation to communicate with organizers.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
