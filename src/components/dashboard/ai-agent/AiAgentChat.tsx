"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, Sparkles, Paperclip, Mic, Globe, Copy, RefreshCw, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModelSelector, type Model } from "./ModelSelector";
import { toast } from "sonner";
import { chatWithAi, createAiConversation, getAiMessages } from "@/app/dashboard/ai-agent/actions";
import { AiAgentSidebar } from "./AiAgentSidebar";
import { AiConfirmation } from "./AiConfirmation";
import { MarkdownMessage } from "./MarkdownMessage";
import { type ModelConfig } from "./ai-models";
import { AiOrb } from "./AiOrb";
import type { ChatCompletionMessageParam, ChatCompletionMessageToolCall } from "openai/resources/index.mjs";
import { cn } from "@/lib/utils";

import { HARDCODED_MODELS } from "./ai-models";
import { AiConfiguration, getModelSettings } from "./AiConfiguration";


// Type definition for messages
interface Message {
    role: "user" | "assistant" | "system" | "tool";
    content: string | null;
    id?: string;
    tool_calls?: ChatCompletionMessageToolCall[];
    tool_call_id?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AiAgentChat({ userProfile }: { userProfile: { name?: string; avatar_url?: string } }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [availableModels] = useState<Model[]>(HARDCODED_MODELS);
    const [selectedModel, setSelectedModel] = useState(HARDCODED_MODELS[0].model_name);

    // View State
    const [view, setView] = useState<'chat' | 'models'>('chat');

    // Custom Configuration for temporary session overrides
    const [customConfig, setCustomConfig] = useState<ModelConfig | null>(null);

    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

    interface ConfirmationRequest {
        toolCall: unknown;
        message: Message;
    }

    const [confirmationRequest, setConfirmationRequest] = useState<ConfirmationRequest | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Apply custom config to selection if present
    useEffect(() => {
        if (customConfig) {
            // If we have a custom config, we conceptually "select" that model.
            setSelectedModel(customConfig.modelName);
        } else {
            // Reset to default if cleared, if not already valid
            if (!HARDCODED_MODELS.some(m => m.model_name === selectedModel)) {
                setSelectedModel(HARDCODED_MODELS[0].model_name);
            }
        }
    }, [customConfig]);

    // Load default model from settings on mount
    useEffect(() => {
        const settings = getModelSettings();
        if (settings.defaultModel && HARDCODED_MODELS.some(m => m.model_name === settings.defaultModel)) {
            setSelectedModel(settings.defaultModel);
        }
    }, []);

    // Load saved conversation and draft on mount
    useEffect(() => {
        const savedId = localStorage.getItem("active_ai_chat_id");
        const savedDraft = localStorage.getItem("ai_chat_draft");

        if (savedDraft) {
            setInput(savedDraft);
        }

        if (savedId) {
            handleSelectConversation(savedId);
        } else {
            // Restore draft messages if available and no active conversation
            const savedMessages = localStorage.getItem("ai_chat_messages_draft");
            if (savedMessages) {
                try {
                    setMessages(JSON.parse(savedMessages));
                } catch (e) {
                    console.error("Failed to parse saved draft messages", e);
                }
            }
        }
    }, []);

    // Reload custom config when switching back to chat view
    useEffect(() => {
        if (view === 'chat') {
            const savedConfig = localStorage.getItem("ai_custom_config");
            if (savedConfig) {
                try {
                    setCustomConfig(JSON.parse(savedConfig));
                } catch {
                    setCustomConfig(null);
                }
            } else {
                setCustomConfig(null);
            }
        }
    }, [view]);

    // Auto-save draft and state
    // Note: Dependency array [input, messages, activeConversationId] must remain constant in size.
    useEffect(() => {
        if (input) {
            localStorage.setItem("ai_chat_draft", input);
        } else {
            localStorage.removeItem("ai_chat_draft");
        }

        // Save messages for current active conversation or draft
        if (messages.length > 0) {
            if (activeConversationId) {
                localStorage.setItem(`ai_chat_messages_${activeConversationId}`, JSON.stringify(messages));
            } else {
                localStorage.setItem("ai_chat_messages_draft", JSON.stringify(messages));
            }
        }
    }, [input, messages, activeConversationId]);

    const handleSelectConversation = async (id: string) => {
        try {
            setIsLoading(true);
            setActiveConversationId(id);
            localStorage.setItem("active_ai_chat_id", id);

            const history = await getAiMessages(id);
            if (history.length > 0) {
                setMessages(history as Message[]);
                // Cache it
                localStorage.setItem(`ai_chat_messages_${id}`, JSON.stringify(history));
            } else {
                // Try to load from cache if API returns nothing
                const cached = localStorage.getItem(`ai_chat_messages_${id}`);
                if (cached) {
                    setMessages(JSON.parse(cached));
                } else {
                    setMessages([]);
                }
            }

        } catch (error) {
            console.error("Error loading conversation:", error);
            toast.error("Failed to load conversation.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = async () => {
        try {
            setActiveConversationId(null);
            localStorage.removeItem("active_ai_chat_id");
            localStorage.removeItem("ai_chat_messages_draft"); // Clear draft history
            setMessages([]);
            setInput("");
            // Don't auto-create db entry until first message sent
        } catch (error) {
            console.error("Error creating new chat:", error);
            toast.error("An error occurred while creating the chat.");
        }
    };

    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // --- Message Sending Logic ---
    const handleSendMessage = async (e?: React.FormEvent, customPrompt?: string) => {
        e?.preventDefault();
        setConfirmationRequest(null); // Clear any pending confirmation when starting new chat
        const content = customPrompt || input;

        if ((!content.trim() && !customPrompt) || isLoading) return;

        const userMessage: Message = {
            role: "user",
            content: content,
            id: crypto.randomUUID(),
        };

        // Optimistic update
        const history = [...messages, userMessage];
        setMessages(history);
        setInput("");

        // Ensure conversation exists
        let currentConvId = activeConversationId;
        if (!currentConvId) {
            try {
                const newConv = await createAiConversation(content.substring(0, 30));
                if (newConv) {
                    currentConvId = newConv.id;
                    setActiveConversationId(currentConvId);
                    localStorage.setItem("active_ai_chat_id", currentConvId as string);
                    // Trigger sidebar update
                    window.dispatchEvent(new CustomEvent("ai-conversation-updated"));
                } else {
                    throw new Error("Failed to create conversation");
                }
            } catch (error) {
                console.error("Creation error:", error);
                toast.error("Failed to start new chat. Please try again.");
                setIsLoading(false);
                return;
            }
        }

        setIsLoading(true);

        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const apiMessages = history.map(({ id, ...m }) => m);

            // Prepare client config if custom settings are active
            const baseClientConfig = customConfig ? {
                apiKey: customConfig.apiKey,
                baseUrl: customConfig.baseUrl,
            } : {};

            const modelToUse = customConfig?.modelName || selectedModel;

            // Check if tools are disabled for this model
            const settings = getModelSettings();
            const toolsDisabled = settings.disabledTools.includes(modelToUse);

            const clientConfig = {
                ...baseClientConfig,
                disableTools: toolsDisabled
            };

            const response = await chatWithAi(
                apiMessages as unknown as ChatCompletionMessageParam[],
                modelToUse,
                undefined,
                currentConvId || undefined,
                clientConfig // Pass optional client config
            );

            if (response.status === "success") {
                const assistantMessage = response.message;
                // Ensure ID exists to prevent key warnings
                const msgWithId = {
                    ...assistantMessage,
                    id: (assistantMessage as { id?: string }).id || crypto.randomUUID()
                };
                setMessages(prev => [...prev, msgWithId as unknown as Message]);

                // Refresh sidebar to show updated title/preview if applicable
                window.dispatchEvent(new CustomEvent("ai-conversation-updated"));
            } else if (response.status === "needs_confirmation") {
                setConfirmationRequest({
                    toolCall: response.toolCall,
                    message: response.message as unknown as Message
                });
            } else if (response.status === "error") {
                toast.error(`Error: ${response.error}`);
            }
        } catch (error) {
            console.error("Chat error:", error);
            toast.error("Failed to send message");
            setConfirmationRequest(null); // Reset confirmation if processed
        } finally {
            setIsLoading(false);
            // Do NOT clear confirmation request here, otherwise the modal will never show
        }
    };

    const handleConfirmTool = async () => {
        if (!confirmationRequest) return;

        setIsLoading(true);
        // Add the pending assistant message to UI history if not already there
        const msgs = [...messages];
        // Ensure the assistant message asking for confirmation is in history
        if (!msgs.some(m => m.tool_calls && m.tool_calls[0].id === (confirmationRequest.toolCall as ChatCompletionMessageToolCall).id)) {
            msgs.push(confirmationRequest.message);
        }
        setMessages(msgs);
        setConfirmationRequest(null);

        try {
            const apiMessages = msgs.map(({ id: _id, ...m }) => m);

            // Prepare client config if custom settings are active
            const baseClientConfig = customConfig ? {
                apiKey: customConfig.apiKey,
                baseUrl: customConfig.baseUrl,
            } : {};
            const modelToUse = customConfig?.modelName || selectedModel;

            // Check if tools are disabled for this model (though confirm implies tool usage, double check)
            const settings = getModelSettings();
            const toolsDisabled = settings.disabledTools.includes(modelToUse);

            const clientConfig = {
                ...baseClientConfig,
                disableTools: toolsDisabled
            };

            const response = await chatWithAi(
                apiMessages as unknown as ChatCompletionMessageParam[],
                modelToUse,
                confirmationRequest.toolCall as ChatCompletionMessageToolCall,
                activeConversationId || undefined,
                clientConfig
            );

            if (response.status === "success") {
                // For this MVP, we might need to reload history or rely on the response
                if (activeConversationId) {
                    const updatedHistory = await getAiMessages(activeConversationId);
                    setMessages(updatedHistory as Message[]);
                } else {
                    const assistantMessage = response.message;
                    const msgWithId = {
                        ...assistantMessage,
                        id: (assistantMessage as { id?: string }).id || crypto.randomUUID()
                    };
                    setMessages(prev => [...prev, msgWithId as unknown as Message]);
                }

            } else if (response.status === "error") {
                toast.error(`Error: ${response.error}`);
            }
        } catch (error) {
            console.error("Tool confirmation error:", error);
            toast.error("Failed to execute tool");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelTool = () => {
        setConfirmationRequest(null);
        toast.info("Tool execution cancelled.");
    };

    // Auto-resize textarea
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex h-full bg-gray-50/50">
            {/* Sidebar */}
            <AiAgentSidebar
                activeId={activeConversationId}
                onSelect={(id) => {
                    handleSelectConversation(id);
                    setView('chat');
                }}
                onNewChat={() => {
                    handleNewChat();
                    setView('chat');
                }}
                userProfile={userProfile}
                onViewChange={setView}
            />

            {/* Main Content Area */}
            {view === 'models' ? (
                <div className="flex-1 overflow-hidden relative">
                    <AiConfiguration onBack={() => setView('chat')} />
                </div>
            ) : (
                <div className="flex-1 flex flex-col relative overflow-hidden bg-blue-50/30">

                    {/* Top Bar - Simplified */}


                    {/* Chat Content Area */}
                    <div className="flex-1 relative overflow-hidden">
                        {messages.length === 0 ? (
                            /* Empty State Hero - Perfectly Centered */
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-700">
                                <div className="max-w-md w-full flex flex-col items-center">
                                    <AiOrb />
                                    <h1 className="text-3xl font-semibold text-gray-900 mb-3 tracking-tight">Meet Bolt, your personal companion.</h1>
                                    <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">I&apos;m Bolt, your personal companion. I can help you analyze data, draft content, or manage your bookings.</p>
                                </div>
                            </div>
                        ) : (
                            /* Messages List */
                            <ScrollArea className="h-full px-4" ref={scrollAreaRef}>
                                <div className="max-w-4xl mx-auto py-8 space-y-8">
                                    <div className="space-y-6 pb-4">
                                        {messages.map((message) => {
                                            if (message.role === "tool" || (message.role === "assistant" && !message.content)) return null;
                                            return (
                                                <div
                                                    key={message.id}
                                                    className={cn(
                                                        "group flex flex-col w-full mb-6 relative px-4",
                                                        message.role === "user" ? "items-end" : "items-start"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "relative text-sm leading-relaxed",
                                                        message.role === "user"
                                                            ? "bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tr-sm px-5 py-3.5 shadow-sm max-w-[85%] md:max-w-[70%]"
                                                            : "text-gray-800 px-0 py-0 w-full"
                                                    )}>
                                                        {message.content && <MarkdownMessage content={message.content} />}
                                                    </div>

                                                    {/* Hover Actions */}
                                                    {message.role === "user" && (
                                                        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mr-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                                                                title="Copy"
                                                                onClick={() => {
                                                                    if (message.content) {
                                                                        navigator.clipboard.writeText(message.content);
                                                                        toast.success("Copied to clipboard");
                                                                    }
                                                                }}
                                                            >
                                                                <Copy className="w-3 h-3" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                                                                title="Regenerate Prompt"
                                                                onClick={() => handleSendMessage(undefined, message.content || "")}
                                                            >
                                                                <RefreshCw className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {isLoading && (
                                            <div className="flex flex-col items-start px-4 w-full">
                                                <div className="flex items-center gap-2 py-2">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                                    <span className="text-xs text-gray-400 font-medium">Bolt is thinking...</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="h-12" /> {/* Spacer */}
                                </div>
                            </ScrollArea>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-6 bg-white/50 backdrop-blur-sm border-t border-gray-100/50">
                        <div className="max-w-3xl mx-auto relative group">
                            <div className="absolute inset-0 bg-linear-to-r from-blue-100/50 to-cyan-100/50 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Local Config Indicator */}
                            {customConfig && (
                                <div className="absolute -top-6 left-2 flex items-center gap-1.5 px-2 py-0.5 bg-green-50 border border-green-100 rounded-full animate-in fade-in slide-in-from-bottom-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-green-700 uppercase tracking-tight">Local Config Running</span>
                                </div>
                            )}

                            <div className="relative bg-white rounded-2xl border border-gray-200 shadow-sm focus-within:shadow-md focus-within:border-blue-200 transition-all overflow-hidden flex flex-col">
                                <Textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={handleInput}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask me anything..."
                                    className="border-0 focus-visible:ring-0 resize-none min-h-[60px] max-h-[200px] py-4 px-4 text-base bg-transparent placeholder:text-gray-400"
                                />
                                <div className="px-3 pb-3 flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <ModelSelector
                                            models={availableModels}
                                            value={selectedModel}
                                            onValueChange={(val) => {
                                                setSelectedModel(val);
                                                // Clear custom config if we manually select a standard model
                                                if (customConfig) {
                                                    setCustomConfig(null);
                                                    localStorage.removeItem("ai_custom_config");
                                                }
                                            }}
                                            trigger={
                                                <div className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full flex items-center justify-center transition-colors">
                                                    <Sparkles className="w-4 h-4" />
                                                </div>
                                            }
                                        />
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full">
                                            <Paperclip className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full">
                                            <Globe className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-700 rounded-full">
                                            <Mic className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            onClick={() => handleSendMessage()}
                                            disabled={(!input.trim() && !isLoading) || isLoading}
                                            size="icon"
                                            className={cn(
                                                "h-8 w-8 rounded-full transition-all duration-300",
                                                input.trim()
                                                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md transform hover:scale-105"
                                                    : "bg-gray-100 text-gray-300"
                                            )}
                                        >
                                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                            </svg>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-2 text-center">
                                <p className="text-[10px] text-gray-400">AI can make mistakes. Please check important info.</p>
                            </div>
                        </div>
                    </div>

                    {/* Confirmation Modal */}
                    {confirmationRequest && (
                        <AiConfirmation
                            isOpen={!!confirmationRequest}
                            onCancel={handleCancelTool}
                            onConfirm={handleConfirmTool}
                            toolCall={confirmationRequest.toolCall}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
