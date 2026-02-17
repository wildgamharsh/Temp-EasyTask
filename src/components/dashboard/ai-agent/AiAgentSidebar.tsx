"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Settings, LogOut, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getAiConversations, deleteAiConversation } from "@/app/dashboard/ai-agent/actions";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, isToday, isYesterday, subDays, isAfter } from "date-fns";


interface Conversation {
    id: string;
    title: string;
    updated_at: string;
}

interface AiAgentSidebarProps {
    activeId: string | null;
    onSelect: (id: string) => void;
    onNewChat: () => void;
    userProfile: { name?: string; avatar_url?: string };
    onViewChange?: (view: 'chat' | 'models') => void;
}

export function AiAgentSidebar({ activeId, onSelect, onNewChat, userProfile, onViewChange }: AiAgentSidebarProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const loadConversations = async () => {
        try {
            const data = await getAiConversations();
            setConversations(data as unknown as Conversation[]);
        } catch (error) {
            console.error("Error loading conversations:", error);
            toast.error("Failed to load history.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadConversations();
        
        // Listen for conversation updates
        const handleUpdate = () => void loadConversations();
        window.addEventListener("ai-conversation-updated", handleUpdate);
        return () => window.removeEventListener("ai-conversation-updated", handleUpdate);
    }, []);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this conversation?")) {
            const result = await deleteAiConversation(id);
            if (result.success) {
                toast.success("Conversation deleted");
                await loadConversations();
                if (activeId === id) {
                    onSelect(""); // Clear selection if deleted
                }
            } else {
                toast.error("Failed to delete conversation");
            }
        }
    };

    const filteredConversations = conversations.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Grouping Logic
    const today = filteredConversations.filter(c => isToday(new Date(c.updated_at)));
    const yesterday = filteredConversations.filter(c => isYesterday(new Date(c.updated_at)));
    const last7Days = filteredConversations.filter(c => {
        const date = new Date(c.updated_at);
        return isAfter(date, subDays(new Date(), 7)) && !isToday(date) && !isYesterday(date);
    });
    const older = filteredConversations.filter(c => {
        const date = new Date(c.updated_at);
        return !isAfter(date, subDays(new Date(), 7));
    });

    return (
        <div className="w-64 flex flex-col h-full bg-white border-r border-gray-100 shrink-0 font-sans">
            {/* Header */}
            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 relative">
                             <img src="/images/logo.png" alt="Bolt" className="object-contain w-full h-full" />
                        </div>
                        <span className="font-semibold text-gray-800 tracking-tight">Bolt</span>
                    </div>
                    <Button 
                        onClick={() => {
                            onNewChat();
                            onViewChange?.('chat');
                        }} 
                        size="sm" 
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border border-blue-100 shadow-sm h-8 px-3 rounded-lg text-xs font-medium transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        New Chat
                    </Button>
                </div>

                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input 
                        placeholder="Search..." 
                        className="pl-9 h-9 bg-gray-50 border-gray-100 text-sm rounded-lg focus-visible:ring-blue-100 focus-visible:ring-offset-0 focus-visible:border-blue-200 transition-all placeholder:text-gray-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Navigation Links */}
            <div className="px-3 pb-4 space-y-0.5">
                <Button 
                    variant="ghost" 
                    className="w-full justify-start text-gray-600 hover:text-blue-700 hover:bg-blue-50/60 h-9 rounded-lg px-3 mb-0.5 transition-colors"
                    onClick={() => onViewChange?.('models')} // Reusing 'models' view key for Configuration
                >
                    <Settings className="w-4 h-4 mr-3 opacity-70" />
                    <span className="text-sm font-medium">Models</span>
                </Button>
            </div>            {/* Scrollable History */}
            <ScrollArea className="flex-1 px-3">
                <div className="space-y-6 pb-4">
                    {/* Today */}
                    {today.length > 0 && (
                        <div className="space-y-1">
                            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2 font-mono">Today</h4>
                            {today.map(c => (
                                <ConversationItem 
                                    key={c.id} 
                                    conversation={c} 
                                    isActive={activeId === c.id} 
                                    onSelect={onSelect} 
                                    onDelete={handleDelete} 
                                />
                            ))}
                        </div>
                    )}

                    {/* Yesterday */}
                    {yesterday.length > 0 && (
                        <div className="space-y-1">
                            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2 font-mono">Yesterday</h4>
                            {yesterday.map(c => (
                                <ConversationItem 
                                    key={c.id} 
                                    conversation={c} 
                                    isActive={activeId === c.id} 
                                    onSelect={onSelect} 
                                    onDelete={handleDelete} 
                                />
                            ))}
                        </div>
                    )}

                     {/* Last 7 Days */}
                     {last7Days.length > 0 && (
                        <div className="space-y-1">
                            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2 font-mono">Previous 7 Days</h4>
                            {last7Days.map(c => (
                                <ConversationItem 
                                    key={c.id} 
                                    conversation={c} 
                                    isActive={activeId === c.id} 
                                    onSelect={onSelect} 
                                    onDelete={handleDelete} 
                                />
                            ))}
                        </div>
                    )}

                    {/* Older */}
                    {older.length > 0 && (
                        <div className="space-y-1">
                            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2 font-mono">Older</h4>
                            {older.map(c => (
                                <ConversationItem 
                                    key={c.id} 
                                    conversation={c} 
                                    isActive={activeId === c.id} 
                                    onSelect={onSelect} 
                                    onDelete={handleDelete} 
                                />
                            ))}
                        </div>
                    )}

                    {conversations.length === 0 && !isLoading && (
                        <div className="text-center py-10 px-4">
                            <p className="text-xs text-gray-400 font-medium">No chat history found.</p>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Profile Footer */}
            <div className="p-3 border-t border-gray-100 bg-white">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start h-auto py-2.5 px-2 hover:bg-gray-50 rounded-lg group transition-colors">
                            <Avatar className="h-8 w-8 mr-3 border border-gray-100 shadow-sm">
                                <AvatarImage src={userProfile?.avatar_url} />
                                <AvatarFallback className="text-xs bg-blue-50 text-blue-600 font-semibold">
                                    {userProfile?.name?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left min-w-0">
                                <p className="text-sm font-semibold text-gray-700 truncate group-hover:text-gray-900 transition-colors">{userProfile?.name || "User"}</p>
                                <p className="text-[11px] text-gray-500 truncate font-medium">Free Plan</p>
                            </div>
                            <MoreHorizontal className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
                        <DropdownMenuItem className="cursor-pointer">
                            <Settings className="w-4 h-4 mr-2 text-gray-500" />
                            Settings
                        </DropdownMenuItem>
                         <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer">
                            <LogOut className="w-4 h-4 mr-2" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

function ConversationItem({ conversation, isActive, onSelect, onDelete }: { 
    conversation: Conversation; 
    isActive: boolean; 
    onSelect: (id: string) => void; 
    onDelete: (e: React.MouseEvent, id: string) => void; 
}) {
    return (
        <div 
            className={cn(
                "group relative flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer transition-all duration-200 text-sm",
                isActive ? "bg-blue-50 text-blue-900 font-semibold shadow-sm ring-1 ring-blue-100" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
            onClick={() => onSelect(conversation.id)}
        >
            <span className="truncate pr-6">{conversation.title || "Untitled Chat"}</span>
            <div className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-all duration-200 scale-90",
                "group-hover:opacity-100 group-hover:scale-100"
            )}>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full" onClick={(e) => onDelete(e, conversation.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                </Button>
            </div>
        </div>
    );
}
