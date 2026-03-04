import { createClient } from "./supabase/client";
import { Conversation, Message, ConversationWithDetails, Quote, QuoteWithDetails, MessageReaction, MessageAttachment } from "./database.types";

/**
 * Fetch all conversations for the current user
 */
export async function getConversations(userId: string): Promise<ConversationWithDetails[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("conversations")
        .select(`
            *,
            customer:customers(*),
            organizer:organizers(*),
            booking:bookings(service_name, event_date)
        `)
        .or(`customer_id.eq.${userId},organizer_id.eq.${userId}`)
        .order("last_message_at", { ascending: false });

    if (error) {
        console.error("Error fetching conversations:", error);
        return [];
    }

    return data as ConversationWithDetails[];
}

/**
 * Fetch all quotes for the current user
 */
export async function getQuotes(userId: string): Promise<any[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("quotes")
        .select(`
            *,
            customer:customers(*),
            organizer:organizers(*),
            booking:bookings(service_name, event_date)
        `)
        .or(`customer_id.eq.${userId},organizer_id.eq.${userId}`)
        .order("last_message_at", { ascending: false });

    if (error) {
        console.error("Error fetching quotes:", error);
        return [];
    }

    return data;
}

/**
 * Fetch message history for a conversation or quote
 */
export async function getMessages(id: string, type: 'conversation' | 'quote' = 'conversation'): Promise<Message[]> {
    const supabase = createClient();

    let query = supabase
        .from("messages")
        .select(`
            *,
            reactions:message_reactions(*)
        `)
        .order("created_at", { ascending: true });

    if (type === 'conversation') {
        query = query.eq("conversation_id", id);
    } else {
        query = query.eq("quote_id", id);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching messages:", error);
        return [];
    }

    return data as Message[];
}

/**
 * Send a new message
 */
export async function sendMessage(id: string, senderId: string, content: string, type: 'conversation' | 'quote' = 'conversation', attachments?: MessageAttachment[]) {
    const supabase = createClient();

    const payload: any = {
        sender_id: senderId,
        content
    };

    if (type === 'conversation') {
        payload.conversation_id = id;
    } else {
        payload.quote_id = id;
    }

    if (attachments && attachments.length > 0) {
        payload.attachments = attachments;
    }

    const { data, error } = await supabase
        .from("messages")
        .insert(payload)
        .select()
        .single();

    if (error) {
        console.error("Error sending message:", error);
        throw error;
    }

    return data as Message;
}

/**
 * Mark all messages as read
 */
export async function markAsRead(id: string, userId: string, type: 'conversation' | 'quote' = 'conversation') {
    const supabase = createClient();
    let query = supabase.from("messages").update({ is_read: true }).neq("sender_id", userId).eq("is_read", false);

    if (type === 'conversation') {
        query = query.eq("conversation_id", id);
    } else {
        query = query.eq("quote_id", id);
    }

    const { error } = await query;

    if (error) {
        console.error("Error marking messages as read:", error);
    }
}

/**
 * Get total unread count across all conversations and quotes
 */
export async function getTotalUnreadCount(userId: string): Promise<number> {
    const supabase = createClient();

    // We can count all unread messages where the user is NOT the sender
    // The RLS filtering (users view msgs) ensures we only count messages in conversations/quotes we belong to.
    const { count, error } = await supabase
        .from("messages")
        .select('*', { count: 'exact', head: true })
        .eq("is_read", false)
        .neq("sender_id", userId);

    if (error) {
        console.error("Error fetching total unread count:", error);
        return 0;
    }

    return count || 0;
}

/**
 * Subscribe to new messages
 */
export function subscribeToMessages(id: string, onMessage: (message: Message) => void, type: 'conversation' | 'quote' = 'conversation') {
    const supabase = createClient();
    const filter = type === 'conversation' ? `conversation_id=eq.${id}` : `quote_id=eq.${id}`;

    return supabase
        .channel(`messages:${id}`)
        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "messages",
                filter: filter
            },
            (payload) => {
                if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                    onMessage(payload.new as Message);
                }
            }
        )
        .subscribe();
}

/**
 * Subscribe to item updates (conversation or quote)
 */
export function subscribeToUpdates(userId: string, onUpdate: (item: any, type: 'conversation' | 'quote') => void) {
    const supabase = createClient();

    // Subscribe to conversations
    const subConv = supabase
        .channel(`conversations:${userId}`)
        .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "conversations" },
            (payload) => {
                const conv = payload.new as Conversation;
                if (conv.customer_id === userId || conv.organizer_id === userId) {
                    onUpdate(conv, 'conversation');
                }
            }
        )
        .subscribe();

    // Subscribe to quotes
    const subQuote = supabase
        .channel(`quotes:${userId}`)
        .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "quotes" },
            (payload) => {
                const quote = payload.new as Quote;
                if (quote.customer_id === userId || quote.organizer_id === userId) {
                    onUpdate(quote, 'quote');
                }
            }
        )
        .subscribe();

    return {
        unsubscribe: () => {
            subConv.unsubscribe();
            subQuote.unsubscribe();
        }
    };
}

/**
 * Legacy: Subscribe to conversations only (for backward compatibility)
 */
export function subscribeToConversations(userId: string, onUpdate: (item: any) => void) {
    const supabase = createClient();
    return supabase
        .channel(`conversations_legacy:${userId}`)
        .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "conversations" },
            (payload) => {
                const conv = payload.new as Conversation;
                if (conv.customer_id === userId || conv.organizer_id === userId) {
                    onUpdate(conv);
                }
            }
        )
        .subscribe();
}

/**
 * Subscribe to message reactions
 */
export function subscribeToReactions(id: string, onReactionChange: (payload: any) => void, type: 'conversation' | 'quote' = 'conversation') {
    const supabase = createClient();

    return supabase
        .channel(`reactions:${id}`)
        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "message_reactions",
                filter: type === 'conversation' ? `conversation_id=eq.${id}` : undefined
            },
            (payload) => {
                onReactionChange(payload);
            }
        )
        .subscribe();
}

/**
 * Helper: Start Conversation (Classic)
 */
export async function startConversation(customerId: string, organizerId: string, bookingId?: string): Promise<string> {
    const supabase = createClient();
    const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("customer_id", customerId)
        .eq("organizer_id", organizerId)
        .maybeSingle();

    if (existing) return existing.id;

    const { data: created, error } = await supabase
        .from("conversations")
        .insert({
            customer_id: customerId,
            organizer_id: organizerId,
            booking_id: bookingId || null
        })
        .select("id")
        .single();

    if (error) throw error;
    return created.id;
}

/**
 * Upload attachment to Supabase storage
 */
export async function uploadChatAttachment(file: File, conversationId: string): Promise<MessageAttachment> {
    const supabase = createClient();
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${conversationId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
        .from('chat_attachments')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error("Error uploading attachment:", error);
        throw error;
    }

    const { data: { publicUrl } } = supabase.storage
        .from('chat_attachments')
        .getPublicUrl(fileName);

    return {
        name: file.name,
        url: publicUrl,
        type: file.type,
        size: file.size
    };
}
