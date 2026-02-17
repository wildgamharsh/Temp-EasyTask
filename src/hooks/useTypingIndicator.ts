import { useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

interface UseTypingIndicatorProps {
    conversationId: string;
    userId: string;
    onTypingChange: (isTyping: boolean, userId: string) => void;
}

/**
 * Hook to manage typing indicators
 * - Broadcasts when user is typing
 * - Listens for partner's typing status
 * - Auto-expires typing status after 5 seconds
 */
export function useTypingIndicator({
    conversationId,
    userId,
    onTypingChange
}: UseTypingIndicatorProps) {
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastTypingRef = useRef<number>(0);

    // Broadcast typing status
    const broadcastTyping = useCallback(async () => {
        const now = Date.now();

        // Debounce: Only send if 2 seconds have passed since last broadcast
        if (now - lastTypingRef.current < 2000) return;

        lastTypingRef.current = now;

        try {
            // Upsert typing status with 5-second expiration
            await supabase
                .from('typing_users')
                .upsert({
                    conversation_id: conversationId,
                    user_id: userId,
                    expires_at: new Date(Date.now() + 5000).toISOString()
                }, {
                    onConflict: 'conversation_id,user_id'
                });

            // Clear previous timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Auto-clear typing status after 5 seconds
            typingTimeoutRef.current = setTimeout(async () => {
                await supabase
                    .from('typing_users')
                    .delete()
                    .eq('conversation_id', conversationId)
                    .eq('user_id', userId);
            }, 5000);
        } catch (error) {
            console.error('Error broadcasting typing status:', error);
        }
    }, [conversationId, userId]);

    // Stop typing
    const stopTyping = useCallback(async () => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        try {
            await supabase
                .from('typing_users')
                .delete()
                .eq('conversation_id', conversationId)
                .eq('user_id', userId);
        } catch (error) {
            console.error('Error stopping typing status:', error);
        }
    }, [conversationId, userId]);

    // Subscribe to typing status changes
    useEffect(() => {
        const subscription = supabase
            .channel(`typing:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'typing_users',
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload) => {
                    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                        const typingUser = payload.new as { user_id: string; expires_at: string };

                        // Only notify if it's not the current user
                        if (typingUser.user_id !== userId) {
                            // Check if not expired
                            const expiresAt = new Date(typingUser.expires_at);
                            if (expiresAt > new Date()) {
                                onTypingChange(true, typingUser.user_id);
                            }
                        }
                    } else if (payload.eventType === 'DELETE') {
                        const typingUser = payload.old as { user_id: string };
                        if (typingUser.user_id !== userId) {
                            onTypingChange(false, typingUser.user_id);
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
            stopTyping();
        };
    }, [conversationId, userId, onTypingChange, stopTyping]);

    return {
        broadcastTyping,
        stopTyping
    };
}
