"use client";

import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MessageSearchProps {
    conversationId: string;
    onResultClick: (messageId: string) => void;
    className?: string;
}

interface SearchResult {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
    rank: number;
}

export function MessageSearch({ conversationId, onResultClick, className }: MessageSearchProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const { createClient } = await import("@/lib/supabase/client");
            const supabase = createClient();

            const { data, error } = await supabase.rpc('search_messages', {
                p_conversation_id: conversationId,
                p_query: searchQuery
            });

            if (error) throw error;
            setResults(data || []);
        } catch (error) {
            console.error("Search error:", error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        // Debounce search
        const timeoutId = setTimeout(() => {
            handleSearch(value);
        }, 300);

        return () => clearTimeout(timeoutId);
    };

    const highlightMatch = (text: string, query: string) => {
        if (!query) return text;

        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase()
                ? <mark key={i} className="bg-yellow-200 font-bold">{part}</mark>
                : part
        );
    };

    return (
        <div className={cn("relative", className)}>
            {/* Search Toggle */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="h-9 w-9 rounded-full"
            >
                <Search className="h-4 w-4" />
            </Button>

            {/* Search Panel */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Search Input */}
                    <div className="p-4 border-b border-slate-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                value={query}
                                onChange={handleInputChange}
                                placeholder="Search messages..."
                                className="pl-9 pr-9 h-10 rounded-xl"
                                autoFocus
                            />
                            {query && (
                                <button
                                    onClick={() => {
                                        setQuery("");
                                        setResults([]);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Results */}
                    <div className="max-h-96 overflow-y-auto p-2">
                        {loading ? (
                            <div className="p-8 text-center text-sm text-slate-500">
                                Searching...
                            </div>
                        ) : results.length > 0 ? (
                            <div className="space-y-1">
                                {results.map((result) => (
                                    <button
                                        key={result.id}
                                        onClick={() => {
                                            onResultClick(result.id);
                                            setIsOpen(false);
                                        }}
                                        className="w-full p-3 text-left hover:bg-slate-50 rounded-xl transition-colors"
                                    >
                                        <p className="text-sm text-slate-700 line-clamp-2">
                                            {highlightMatch(result.content, query)}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {new Date(result.created_at).toLocaleDateString()}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        ) : query ? (
                            <div className="p-8 text-center text-sm text-slate-500">
                                No messages found
                            </div>
                        ) : (
                            <div className="p-8 text-center text-sm text-slate-500">
                                Type to search messages
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
