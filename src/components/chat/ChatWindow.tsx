"use client";

import React, { useEffect, useState, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { getMessages, sendMessage, markAsRead, subscribeToMessages, subscribeToReactions } from "@/lib/supabase-chat";
import { createClient } from "@/lib/supabase/client";
import { Message, MessageReaction, ChatParticipant } from "@/lib/database.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { MessageSearch } from "./MessageSearch";
import { ManageQuoteModal } from "./ManageQuoteModal";
import { ConfirmBookingModal } from "./ConfirmBookingModal";
import { Button } from "@/components/ui/button";
interface ChatWindowProps {
    conversationId: string;
    currentUser: ChatParticipant;
    partner: ChatParticipant | null;
    bookingId?: string;
    type?: 'conversation' | 'quote';
    quoteStatus?: string;
}

export function ChatWindow({ conversationId, currentUser, partner, bookingId, type = 'conversation', quoteStatus: initialQuoteStatus }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [partnerTyping, setPartnerTyping] = useState(false);
    const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const messageRefs = useRef<{ [key: string]: HTMLDivElement }>({});

    // Quote specific state
    const [quoteData, setQuoteData] = useState<any>(null);
    const [quoteStatus, setQuoteStatus] = useState(initialQuoteStatus);
    const [bookingDetails, setBookingDetails] = useState<any>(null); // New state for booking
    const [isManageQuoteOpen, setIsManageQuoteOpen] = useState(false);
    const [isConfirmBookingOpen, setIsConfirmBookingOpen] = useState(false);

    // Initial load
    useEffect(() => {
        const loadMessages = async () => {
            setLoading(true);
            const history = await getMessages(conversationId, type);
            setMessages(history);
            setLoading(false);
            scrollToBottom();
            await markAsRead(conversationId, currentUser.id, type);
        };

        if (conversationId) {
            loadMessages();
        }
    }, [conversationId, currentUser.id, type]);

    // Real-time subscription
    useEffect(() => {
        const msgChannel = subscribeToMessages(conversationId, (newMessage) => {
            setMessages((prev) => {
                if (prev.some(m => m.id === newMessage.id)) {
                    return prev.map(m => m.id === newMessage.id ? newMessage : m);
                }
                return [...prev, newMessage];
            });
            if (newMessage.sender_id !== currentUser.id && !newMessage.is_read) {
                markAsRead(conversationId, currentUser.id, type);
            }
        }, type);

        // Reactions for conversations only for now
        const reactionChannel = type === 'conversation' ? subscribeToReactions(conversationId, (payload) => {
            const { eventType, new: newReaction, old: oldReaction } = payload;
            const targetMessageId = newReaction?.message_id || oldReaction?.message_id;
            if (!targetMessageId) return;

            setMessages((prev) => prev.map((msg) => {
                if (msg.id !== targetMessageId) return msg;
                const currentReactions = msg.reactions || [];
                if (eventType === 'INSERT') {
                    if (currentReactions.some(r => r.id === newReaction.id)) return msg;
                    return { ...msg, reactions: [...currentReactions, newReaction as MessageReaction] };
                }
                if (eventType === 'DELETE') {
                    return { ...msg, reactions: currentReactions.filter(r => r.id !== oldReaction.id) };
                }
                return msg;
            }));
        }, type) : { unsubscribe: () => { } };

        return () => {
            msgChannel.unsubscribe();
            reactionChannel.unsubscribe();
        };
    }, [conversationId, currentUser.id, type]);

    // Fetch and subscribe to Quote updates
    useEffect(() => {
        if (type !== 'quote') return;

        const supabase = createClient();

        const fetchDetails = async () => {
            const { data } = await supabase.from('quotes').select('*').eq('id', conversationId).single();
            if (data) {
                setQuoteData(data);
                setQuoteStatus(data.status);

                // If quote is completed, fetch booking details to check status
                if (data.status === 'completed' && data.booking_id) {
                    const { data: booking } = await supabase.from('bookings').select('*, customer:customers(name), organizer:organizers(business_name)').eq('id', data.booking_id).single();
                    setBookingDetails(booking);
                }
            }
        };
        fetchDetails();

        const channel = supabase
            .channel(`quote_status:${conversationId}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'quotes', filter: `id=eq.${conversationId}` },
                async (payload: any) => {
                    setQuoteData(payload.new);
                    setQuoteStatus(payload.new.status);

                    if (payload.new.status === 'completed' && payload.new.booking_id) {
                        const { data: booking } = await supabase.from('bookings').select('*, customer:customers(name), organizer:organizers(business_name)').eq('id', payload.new.booking_id).single();
                        setBookingDetails(booking);
                    }
                }
            )
            .subscribe();

        // Subscribe to bookings too? Maybe overkill, but good for "Completed" updates
        const bookingChannel = supabase
            .channel(`booking_updates:${conversationId}`) // Just unique ID
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'bookings' },
                (payload: any) => {
                    if (bookingDetails && payload.new.id === bookingDetails.id) {
                        setBookingDetails((prev: any) => ({ ...prev, ...payload.new }));
                    }
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
            bookingChannel.unsubscribe();
        };
    }, [conversationId, type, bookingDetails?.id]); // Added bookingDetails dependency safely? actually better to check ID inside



    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    const handleSend = async (content: string) => {
        if (quoteStatus === 'completed' || quoteStatus === 'cancelled') return;

        const tempId = `temp-${Date.now()}`;
        const optimisticMessage: Message = {
            id: tempId,
            conversation_id: type === 'conversation' ? conversationId : undefined,
            quote_id: type === 'quote' ? conversationId : undefined,
            sender_id: currentUser.id,
            content: content,
            created_at: new Date().toISOString(),
            is_read: false
        };

        setMessages((prev) => [...prev, optimisticMessage]);
        stopTyping();

        try {
            const newMessage = await sendMessage(conversationId, currentUser.id, content, type);
            setMessages((prev) => prev.map((msg) => msg.id === tempId ? newMessage : msg));
        } catch (error) {
            console.error("Failed to send message:", error);
            setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
        }
    };

    const { broadcastTyping, stopTyping } = useTypingIndicator({
        conversationId,
        userId: currentUser.id, // Only use conv ID for typing for now, might need updating for quotes
        onTypingChange: (isTyping, userId) => {
            if (userId !== currentUser.id) setPartnerTyping(isTyping);
        }
    });

    const isCurrentUserOrganizer = quoteData?.organizer_id === currentUser.id;
    const isCompleted = quoteStatus === 'completed';
    const isCancelled = quoteStatus === 'cancelled' || quoteStatus === 'rejected';

    return (
        <div className="flex-1 flex flex-col min-w-0 min-h-0 h-full bg-white shadow-xl border-l border-slate-100 overflow-hidden relative">

            {type === 'quote' && (
                <>
                    <ManageQuoteModal
                        isOpen={isManageQuoteOpen}
                        onClose={() => setIsManageQuoteOpen(false)}
                        conversationId={conversationId} // Pass quoteId technically
                        quoteData={quoteData?.quote_data}
                        currentPrice={quoteData?.proposed_price}
                    />
                    <ConfirmBookingModal
                        isOpen={isConfirmBookingOpen}
                        onClose={() => setIsConfirmBookingOpen(false)}
                        quoteId={conversationId}
                    />
                </>
            )}

            <header className="p-4 md:p-6 bg-white border-b border-slate-50 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 border-white shadow-sm ring-1 ring-slate-100">
                        <AvatarImage src={(partner as any)?.logo_url} />
                        <AvatarFallback className="bg-slate-100 text-slate-600 font-black text-xs">
                            {(partner?.name || "?").charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-slate-900 tracking-tight">
                                {(partner as any)?.business_name || partner?.name || "Client / Provider"}
                            </h3>
                            {(partner as any)?.role === 'organizer' && (
                                <ShieldCheck className="h-4 w-4 text-primary fill-primary/10" />
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {type === 'quote' ? (
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={`
                                        uppercase text-[10px] font-bold tracking-widest border-none px-2 py-0.5
                                        ${quoteStatus === 'pending' ? 'bg-orange-100 text-orange-600' : ''}
                                        ${quoteStatus === 'finalizing' ? 'bg-blue-100 text-blue-600' : ''}
                                        ${quoteStatus === 'completed' ? 'bg-emerald-100 text-emerald-600' : ''}
                                        ${quoteStatus === 'cancelled' ? 'bg-red-100 text-red-600' : ''}
                                        ${quoteStatus === 'rejected' ? 'bg-red-100 text-red-600' : ''}
                                        ${!quoteStatus ? 'bg-slate-100 text-slate-600' : ''} 
                                    `}>
                                        {quoteStatus || 'Draft'}
                                    </Badge>

                                    {isCurrentUserOrganizer && !isCompleted && !isCancelled && (
                                        <>
                                            <Button onClick={() => setIsManageQuoteOpen(true)} size="sm" variant="outline" className="h-6 text-[10px] font-bold px-2 rounded-lg">
                                                Edit Quote
                                            </Button>
                                            <Button onClick={() => setIsConfirmBookingOpen(true)} size="sm" className="h-6 text-[10px] font-bold px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                                                Confirm Booking
                                            </Button>
                                        </>
                                    )}

                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Now</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <MessageSearch conversationId={conversationId} onResultClick={(id) => {
                        const el = messageRefs.current[id];
                        if (el && scrollRef.current) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        setHighlightedMessageId(id);
                        setTimeout(() => setHighlightedMessageId(null), 2000);
                    }} />
                </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
                {/* Message List rendering */}
                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-40">
                        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                            <span className="text-4xl">👋</span>
                        </div>
                        <p className="text-sm font-black text-slate-900">Start the conversation</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {messages.map((msg, index) => (
                            <div
                                key={msg.id}
                                ref={(el) => { if (el) messageRefs.current[msg.id] = el; }}
                                className={highlightedMessageId === msg.id ? "animate-pulse" : ""}
                            >
                                <MessageBubble
                                    messageId={msg.id}
                                    content={msg.content}
                                    timestamp={msg.created_at}
                                    isOwn={msg.sender_id === currentUser.id}
                                    showStatus={index === messages.length - 1}
                                    isRead={msg.is_read}
                                    reactions={msg.reactions}
                                    currentUserId={currentUser.id}
                                    // onProposalAction logic...
                                    // For now, if we want inline buttons we can pass a simplified handler:
                                    onProposalAction={async (action, id) => {
                                        const { acceptProposal, rejectProposal } = await import("@/lib/quote-actions");
                                        if (action === 'accept') await acceptProposal(conversationId); // quoteId
                                        else await rejectProposal(conversationId);
                                    }}
                                    quoteStatus={quoteStatus}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex-shrink-0 p-6 bg-slate-50 border-t border-slate-100 z-10">
                {isCompleted ? (
                    <div className="text-center p-3 bg-white rounded-xl border border-slate-200 text-slate-500 text-sm font-medium">
                        This quote has been completed and closed.
                    </div>
                ) : isCancelled ? (
                    <div className="text-center p-3 bg-white rounded-xl border border-slate-200 text-slate-500 text-sm font-medium">
                        This quote has been cancelled.
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto w-full">
                        <ChatInput onSend={handleSend} onTyping={broadcastTyping} onStopTyping={stopTyping} />
                    </div>
                )}
            </div>
        </div>
    );
}
