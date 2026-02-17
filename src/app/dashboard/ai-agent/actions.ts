"use server";

import { createClient } from "@/lib/supabase/server";
import { Database } from "@/lib/database.types";
import { SupabaseClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { revalidatePath } from "next/cache";
import { ChatCompletionMessageParam, ChatCompletionMessageToolCall } from "openai/resources/index.mjs";

// Define helper for strict typing in this file
async function getSupabase() {
    return (await createClient()) as unknown as SupabaseClient<Database>;
}

// Define the tools
const TOOLS = [
    {
        type: "function",
        function: {
            name: "get_bookings",
            description: "Get a list of bookings for the user. Can be filtered by status.",
            parameters: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        enum: ["pending", "confirmed", "rejected", "completed", "cancelled"],
                        description: "Filter bookings by status"
                    },
                    limit: {
                        type: "number",
                        description: "Limit the number of results (default 10)",
                        default: 10
                    }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_blocked_dates",
            description: "Get a list of blocked dates from the calendar.",
            parameters: {
                type: "object",
                properties: {
                    limit: {
                        type: "number",
                        description: "Limit the number of results (default 10)",
                        default: 10
                    }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_bookings_filtered",
            description: "Get bookings with optional filters (date, status, limit, sort). Use this when user asks for specific bookings like 'latest bookings', 'bookings on date X', 'pending bookings', etc.",
            parameters: {
                type: "object",
                properties: {
                    date: {
                        type: "string",
                        description: "Filter by specific date (YYYY-MM-DD)"
                    },
                    status: {
                        type: "string",
                        description: "Filter by status: pending, confirmed, rejected, completed, cancelled"
                    },
                    limit: {
                        type: "number",
                        description: "Maximum number of results to return (default 10)",
                        default: 10
                    },
                    sort_by: {
                        type: "string",
                        description: "Sort order: 'latest' (newest first) or 'oldest' (oldest first)",
                        default: "latest"
                    }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_booking_details",
            description: "Get complete details of a specific booking by ID. Use this when user wants to see full information about a particular booking.",
            parameters: {
                type: "object",
                properties: {
                    booking_id: {
                        type: "string",
                        description: "The ID of the booking to retrieve"
                    }
                },
                required: ["booking_id"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_messages",
            description: "Get recent messages from conversations.",
            parameters: {
                type: "object",
                properties: {
                    unread_only: {
                        type: "boolean",
                        description: "If true, only fetch unread messages"
                    },
                    limit: {
                        type: "number",
                        description: "Limit the number of results (default 10)",
                        default: 10
                    }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_storefront_settings",
            description: "Get the current storefront settings/configuration.",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    },
    {
        type: "function",
        function: {
            name: "block_date",
            description: "Block a specific date in the calendar to prevent bookings.",
            parameters: {
                type: "object",
                properties: {
                    date: {
                        type: "string",
                        description: "The date to block (YYYY-MM-DD)"
                    },
                    reason: {
                        type: "string",
                        description: "Reason for blocking the date"
                    }
                },
                required: ["date"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "block_dates_bulk",
            description: "Block multiple specific dates in the calendar. Use this for single dates OR ranges (expand ranges to a list of dates).",
            parameters: {
                type: "object",
                properties: {
                    dates: {
                        type: "array",
                        items: { type: "string" },
                        description: "Array of dates to block (YYYY-MM-DD format)"
                    },
                    reason: {
                        type: "string",
                        description: "Reason for blocking the dates"
                    }
                },
                required: ["dates"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "send_message",
            description: "Send a message to a customer in a specific conversation.",
            parameters: {
                type: "object",
                properties: {
                    conversation_id: {
                        type: "string",
                        description: "The ID of the conversation to send the message to"
                    },
                    content: {
                        type: "string",
                        description: "The message content to send"
                    }
                },
                required: ["conversation_id", "content"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "unblock_dates_bulk",
            description: "Unblock multiple specific dates at once. Use this when user wants to unblock several dates.",
            parameters: {
                type: "object",
                properties: {
                    dates: {
                        type: "array",
                        items: { type: "string" },
                        description: "Array of dates to unblock (YYYY-MM-DD format)"
                    }
                },
                required: ["dates"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "unblock_all_dates",
            description: "Unblock ALL currently blocked dates. Use with extreme caution - requires user confirmation.",
            parameters: {
                type: "object",
                properties: {
                    confirm: {
                        type: "boolean",
                        description: "Confirmation flag (must be true)",
                        default: true
                    }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "update_storefront_settings",
            description: "Update the storefront settings (e.g., change theme colors, business info).",
            parameters: {
                type: "object",
                properties: {
                    setting_key: {
                        type: "string",
                        description: "The key of the setting to update (e.g., 'business_name', 'theme_colors', 'hero_title')"
                    },
                    value: {
                        type: "string", // Simpling to string/json for now
                        description: "The new value for the setting. If complex object, pass as JSON string."
                    }
                },
                required: ["setting_key", "value"]
            }
        }
    }
];

// Helper to determine if a tool is "safe" (read-only)
const isSafeTool = (name: string) => {
    return [
        "get_bookings",
        "get_bookings_filtered",
        "get_booking_details",
        "get_blocked_dates",
        "get_messages",
        "get_storefront_settings"
    ].includes(name);
};

export async function getAiConversations() {
    try {
        const supabase = await getSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const { data, error } = await supabase
            .from("ai_conversations")
            .select("*")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Error fetching AI conversations:", error);
        return [];
    }
}

export async function getAiMessages(conversationId: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const { data, error } = await supabase
            .from("ai_messages")
            .select("*")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true });

        if (error) throw error;
        return data.map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            tool_calls: m.tool_calls,
            tool_call_id: m.tool_call_id
        })) as ChatCompletionMessageParam[];
    } catch (error) {
        console.error("Error fetching AI messages:", error);
        return [];
    }
}

export async function createAiConversation(title: string = "New Chat") {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const { data, error } = await supabase
            .from("ai_conversations")
            .insert({
                user_id: user.id,
                title: title
            })
            .select()
            .single();

        if (error) {
            console.error("Supabase create conversation error:", error);
            throw error;
        }
        return data;
    } catch (error) {
        console.error("Error creating AI conversation:", error);
        return null; // Logic in frontend handles null
    }
}

export async function deleteAiConversation(id: string) {
    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from("ai_conversations")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Error deleting AI conversation:", error);
        return { success: false, error };
    }
}

// ============= AI MODELS MANAGEMENT =============
// Models are now managed via hardcoded defaults and client-side overrides.


async function saveAiMessage(conversationId: string, message: ChatCompletionMessageParam, model?: string) {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("ai_messages")
            .insert({
                conversation_id: conversationId,
                role: message.role,
                content: 'content' in message ? message.content : null,
                model: model || null,
                tool_calls: 'tool_calls' in message ? message.tool_calls : null,
                tool_call_id: 'tool_call_id' in message ? message.tool_call_id : null
            })
            .select()
            .single();

        if (error) throw error;

        // Update updated_at on conversation
        await supabase
            .from("ai_conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", conversationId);

        return data;

    } catch (error) {
        console.error("Error saving AI message:", error);
        return null;
    }
}

export async function generateAiTitle(conversationId: string, firstUserMessage: string) {
    try {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) return;

        const openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: apiKey,
        });

        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-exp:free",
            messages: [
                {
                    role: "system",
                    content: "Generate a very short, concise title (max 5 words) for a chat conversation based on the first message provided by the user. Do not use quotes or punctuation."
                },
                {
                    role: "user",
                    content: firstUserMessage
                }
            ],
            max_tokens: 20
        });

        const title = completion.choices[0].message.content?.trim() || "New Chat";

        const supabase = await createClient();
        await supabase
            .from("ai_conversations")
            .update({ title })
            .eq("id", conversationId);

        return title;
    } catch (error) {
        console.error("Error generating AI title:", error);
        return "New Chat";
    }
}

export async function chatWithAi(
    messages: ChatCompletionMessageParam[],
    model: string,
    confirmedToolCall?: ChatCompletionMessageToolCall,
    conversationId?: string,
    clientConfig?: { apiKey?: string; baseUrl?: string; disableTools?: boolean }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Unauthorized");
        }

        // 0. Persist User Message Immediately (if it's a new user message)
        if (conversationId && messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.role === "user") {
                // We don't await this to block everything, but we should await to ensure ID is generated if we need it?
                // Actually we do need it if we want to return it.
                // But for responsiveness, maybe we await it.
                await saveAiMessage(conversationId, lastMsg, model);

                // If it's the first message, generate a title
                if (messages.length === 1 || (messages.length === 2 && messages[0].role === "system")) {
                    // Fire and forget title generation
                    generateAiTitle(conversationId, lastMsg.content as string);
                }
            }
        }

        const baseUrl = clientConfig?.baseUrl && clientConfig.baseUrl.trim() !== "" ? clientConfig.baseUrl : "https://openrouter.ai/api/v1";

        let apiKey = clientConfig?.apiKey && clientConfig.apiKey.trim() !== "" ? clientConfig.apiKey : process.env.OPENROUTER_API_KEY;

        // Relax text check for Local/Ollama
        if (!apiKey && (baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1"))) {
            apiKey = "ollama";
        }

        if (!apiKey) throw new Error("API Key is not set");

        const openai = new OpenAI({
            baseURL: baseUrl,
            apiKey: apiKey,
        });

        // 1. If we have a confirmed tool call, execute it first
        const currentMessages = [...messages];
        if (confirmedToolCall && 'function' in confirmedToolCall) {
            console.log("Executing confirmed tool:", confirmedToolCall.function.name);
            const toolResult = await executeTool(confirmedToolCall, user.id, supabase);

            // Check if the last message is already the assistant message with this tool call
            const lastMsg = currentMessages[currentMessages.length - 1];
            // Safe check for assistant tool call
            const alreadyHasAssistantToolCall = lastMsg?.role === 'assistant' &&
                Array.isArray(lastMsg.tool_calls) &&
                lastMsg.tool_calls.some(tc => tc.id === confirmedToolCall.id);

            // Only append the assistant message if it's missing (e.g. if client didn't save it properly)
            if (!alreadyHasAssistantToolCall) {
                const assistantMsg: ChatCompletionMessageParam = {
                    role: "assistant",
                    content: null,
                    tool_calls: [confirmedToolCall]
                };
                currentMessages.push(assistantMsg);
                // Save assistant message with the model context (though it's a tool-use message)
                if (conversationId) await saveAiMessage(conversationId, assistantMsg, model);
            }

            // Append the tool result
            const toolMsg: ChatCompletionMessageParam = {
                role: "tool",
                tool_call_id: confirmedToolCall.id,
                content: JSON.stringify(toolResult)
            };
            currentMessages.push(toolMsg);
            if (conversationId) await saveAiMessage(conversationId, toolMsg, model);
        }
        // User message saving was moved to top of function (Step 0)

        // 2. Call OpenAI

        const SYSTEM_PROMPT = `You are Bolt, a helpful AI assistant for the EasyTask platform.
Your goal is to help organizers manage their business, bookings, and storefronts.

CAPABILITIES:
- You can block/unblock dates on the calendar.
- For date blocking ranges (e.g., "Jan 20 to Jan 25"), ALWAYS convert the range into a list of specific dates (YYYY-MM-DD) and use the 'block_dates_bulk' tool. 
- You can perform multiple actions in one turn if needed. For example, if asked to "block Jan 20-25 but unblock Jan 22", you should call 'block_dates_bulk' for the whole range first (or the specific list excluding Jan 22) and/or 'unblock_date' as needed. Ideally, just calculate the final list of dates to block and call 'block_dates_bulk' once with the correct list.
- If you need to perform multiple distinct actions (e.g., block a date AND send a message), you can issue multiple tool calls in a single response.

RULES:
- Be concise and professional.
- When blocking dates, provide a brief reason if known.
- If a user asks to block a range, expand it yourself. Do not ask the user to list the dates.
`;

        // 2. Call OpenAI
        console.log("Calling AI with model:", model);

        const toolsOption = (clientConfig?.disableTools) ? undefined : TOOLS;
        const toolChoiceOption = (clientConfig?.disableTools) ? undefined : "auto";

        // Inject System Prompt
        const messagesWithSystem = [
            { role: "system", content: SYSTEM_PROMPT },
            ...currentMessages.filter(m => m.role !== "system") // Filter out existing system messages if any to avoid duplication/override
        ];

        const completion = await openai.chat.completions.create({
            model: model,
            messages: messagesWithSystem as ChatCompletionMessageParam[],
            // @ts-expect-error - OpenAI types might complain about strict match
            tools: toolsOption,
            tool_choice: toolChoiceOption,
        });

        const choice = completion.choices[0];
        const message = choice.message;

        // 3. Handle Tool Calls
        if (message.tool_calls && message.tool_calls.length > 0) {

            // Iterate through ALL tool calls
            const toolCalls = message.tool_calls;
            const toolResults: ChatCompletionMessageToolCall[] = [];
            const resultsContent: ChatCompletionMessageParam[] = [];

            let requiresConfirmation = false;
            let pendingConfirmationCall: ChatCompletionMessageToolCall | undefined;

            // First pass: Check implementation safety and collect unconfirmed unsafe calls
            for (const toolCall of toolCalls) {
                if (!('function' in toolCall)) continue;
                const toolName = toolCall.function.name;

                if (!isSafeTool(toolName)) {
                    requiresConfirmation = true;
                    pendingConfirmationCall = toolCall;
                    // Stop at the first unsafe tool call to get confirmation
                    break;
                }
            }

            if (requiresConfirmation && pendingConfirmationCall) {
                // Return immediately for confirmation of the UNSAFE tool call
                // We pause execution here. The user will confirm, and we'll re-run with "confirmedToolCall"
                // NOTE: If there were safe tool calls BEFORE this one, we technically skip them for now
                // and they will be re-generated or re-evaluated next time.
                // Simpler for now: just confirm the first unsafe one.

                if ('function' in pendingConfirmationCall) {
                    console.log("Requesting confirmation for:", pendingConfirmationCall.function.name);
                } else {
                    console.log("Requesting confirmation for unknown tool");
                }

                let confirmMsg = message;
                if (conversationId) {
                    const saved = await saveAiMessage(conversationId, message, model);
                    if (saved) {
                        confirmMsg = {
                            ...message,
                            // @ts-expect-error - Injecting ID
                            id: saved.id
                        };
                    }
                }

                return {
                    status: "needs_confirmation",
                    toolCall: pendingConfirmationCall,
                    message: confirmMsg
                };
            }

            // If we are here, ALL tool calls are safe (or we support auto-running them).
            // Save the assistant's "thinking" message (containing the tool calls) ONCE
            if (conversationId) {
                await saveAiMessage(conversationId, message, model);
            }

            // Execute all tools sequentially
            const nextMessages = [...currentMessages, message];

            for (const toolCall of toolCalls) {
                if (!('function' in toolCall)) continue;

                console.log("Auto-executing tool:", toolCall.function.name);
                const result = await executeTool(toolCall, user.id, supabase);

                const toolMsg: ChatCompletionMessageParam = {
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(result)
                };

                // Save each tool result
                if (conversationId) await saveAiMessage(conversationId, toolMsg, model);
                nextMessages.push(toolMsg);
            }

            // Recursive call with updated history
            return chatWithAi(nextMessages, model, undefined, conversationId, clientConfig);
        }

        // 4. Normal Response
        let finalMessage = message;
        if (conversationId) {
            const savedMsg = await saveAiMessage(conversationId, message, model);
            if (savedMsg) {
                finalMessage = {
                    ...message,
                    // @ts-expect-error - Injecting ID
                    id: savedMsg.id
                };
            }
        }

        return {
            status: "success",
            message: finalMessage
        };

    } catch (error) {
        console.error("AI Action Error:", error);
        return {
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error occurred"
        };
    }
}

async function executeTool(toolCall: ChatCompletionMessageToolCall, userId: string, supabase: SupabaseClient<any>) {
    // Type guard to ensure we have a function tool call
    if (!('function' in toolCall)) {
        return { error: "Unsupported tool call type" };
    }

    const name = toolCall.function.name;
    const args = JSON.parse(toolCall.function.arguments || "{}");

    try {
        switch (name) {
            case "get_bookings": {
                let query = supabase.from("bookings").select("*").eq("organizer_id", userId);
                if (args.status) query = query.eq("status", args.status);
                if (args.limit) query = query.limit(args.limit);
                query = query.order("created_at", { ascending: false });

                const { data: bookings } = await query;
                return bookings || [];
            }

            case "get_bookings_filtered": {
                let query = supabase.from("bookings").select("*").eq("organizer_id", userId);

                // Apply filters
                if (args.date) query = query.eq("event_date", args.date);
                if (args.status) query = query.eq("status", args.status);

                // Apply sorting
                const ascending = args.sort_by === "oldest";
                query = query.order("created_at", { ascending });

                // Apply limit
                if (args.limit) query = query.limit(args.limit);

                const { data: bookings } = await query;
                return bookings || [];
            }

            case "get_booking_details": {
                const { data: booking, error } = await supabase
                    .from("bookings")
                    .select("*")
                    .eq("id", args.booking_id)
                    .eq("organizer_id", userId)
                    .single();

                if (error) return { error: "Booking not found" };
                return booking;
            }

            case "get_blocked_dates": {
                const { data: blocked } = await supabase
                    .from("blocked_dates")
                    .select("*")
                    .eq("organizer_id", userId)
                    .limit(args.limit || 10);
                return blocked || [];
            }

            case "get_messages": {
                // Hack: Just return a summary of unread counts per conversation for now to be efficient
                const { data: conversations } = await supabase
                    .from("conversations")
                    .select("*, messages(count)")
                    .or(`customer_id.eq.${userId},organizer_id.eq.${userId}`)
                    .limit(args.limit || 5);

                return conversations || [];
            }

            case "get_storefront_settings": {
                const { data: settings } = await supabase
                    .from("storefront_settings")
                    .select("*")
                    .eq("organizer_id", userId)
                    .single();
                return settings || { error: "No settings found" };
            }

            case "block_date": {
                const { data: blockData, error: blockError } = await supabase
                    .from("blocked_dates")
                    .insert({
                        organizer_id: userId,
                        blocked_date: args.date as string,
                        reason: (args.reason as string) || "Blocked by AI"
                    })
                    .select()
                    .single();

                if (blockError) throw new Error(blockError.message);
                revalidatePath("/dashboard/calendar");
                return { success: true, data: blockData };
            }

            case "block_dates_bulk": {
                if (!args.dates || !Array.isArray(args.dates) || args.dates.length === 0) {
                    return { error: "No dates provided" };
                }

                const datesToBlock = args.dates.map((d: string) => ({
                    organizer_id: userId,
                    blocked_date: d,
                    reason: (args.reason as string) || "Blocked by AI (Bulk)"
                }));

                const { error: bulkBlockError } = await supabase
                    .from("blocked_dates")
                    .insert(datesToBlock);

                if (bulkBlockError) throw new Error(bulkBlockError.message);

                revalidatePath("/dashboard/calendar");
                return {
                    success: true,
                    message: `Successfully blocked ${args.dates.length} date(s): ${args.dates.join(", ")}`
                };
            }

            case "unblock_date": {
                const { error: unblockError } = await supabase
                    .from("blocked_dates")
                    .delete()
                    .eq("organizer_id", userId)
                    .eq("blocked_date", args.date);

                if (unblockError) throw new Error(unblockError.message);

                revalidatePath("/dashboard/calendar");
                revalidatePath("/dashboard/calendar");
                return { success: true, message: `Date ${args.date} unblocked successfully.` };
            }

            case "unblock_dates_bulk": {
                if (!args.dates || !Array.isArray(args.dates) || args.dates.length === 0) {
                    return { error: "No dates provided" };
                }

                const { error: bulkUnblockError } = await supabase
                    .from("blocked_dates")
                    .delete()
                    .eq("organizer_id", userId)
                    .in("blocked_date", args.dates);

                if (bulkUnblockError) throw new Error(bulkUnblockError.message);

                revalidatePath("/dashboard/calendar");
                return {
                    success: true,
                    message: `Successfully unblocked ${args.dates.length} date(s): ${args.dates.join(", ")}`
                };
            }

            case "unblock_all_dates": {
                // First, get count of blocked dates
                const { data: blockedDates, error: countError } = await supabase
                    .from("blocked_dates")
                    .select("blocked_date")
                    .eq("organizer_id", userId);

                if (countError) throw new Error(countError.message);

                if (!blockedDates || blockedDates.length === 0) {
                    return { success: true, message: "No blocked dates to unblock." };
                }

                const count = blockedDates.length;

                // Delete all blocked dates
                const { error: deleteAllError } = await supabase
                    .from("blocked_dates")
                    .delete()
                    .eq("organizer_id", userId);

                if (deleteAllError) throw new Error(deleteAllError.message);

                revalidatePath("/dashboard/calendar");
                return {
                    success: true,
                    message: `Successfully unblocked all ${count} date(s).`
                };
            }

            case "send_message": {
                const { data: msgData, error: msgError } = await supabase
                    .from("messages")
                    .insert({
                        conversation_id: args.conversation_id,
                        sender_id: userId,
                        content: args.content
                    })
                    .select()
                    .single();

                if (msgError) throw new Error(msgError.message);
                return { success: true, data: msgData };
            }

            case "update_storefront_settings": {
                // Parse value if it looks like JSON
                let value = args.value;
                try {
                    const parsed = JSON.parse(value);
                    if (typeof parsed === 'object') value = parsed;
                } catch { // invalid json, keep string
                    // It's a string
                }

                // Construct update object
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const updateObj: any = {};
                updateObj[args.setting_key] = value;
                updateObj.updated_at = new Date().toISOString();

                const { data: updateResult, error: updateError } = await supabase
                    .from("storefront_settings")
                    .update(updateObj)
                    .eq("organizer_id", userId)
                    .select()
                    .single();


                if (updateError) throw new Error(updateError.message);
                revalidatePath("/dashboard/storefront");
                return { success: true, data: updateResult };
            }

            default:
                return { error: "Unknown tool" };
        }
    } catch (error) {
        console.error("Tool execution error:", error);
        return { error: error instanceof Error ? error.message : "Unknown error during tool execution" };
    }
}

export async function generatePricingConfigAction(userPrompt: string, currentConfig?: any) {
    try {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) throw new Error("API Key not set");

        const openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: apiKey,
        });

        const PRICING_SCHEMA_DEF = `
export type ServicePricingModel = "fixed" | "packages" | "per_person";
export type DiscountType = "percentage" | "flat_amount" | "percentage_capped" | "free_service";
export type DiscountScope = "global" | "service_specific" | "category_specific";

export interface ServicePackage {
    id: string; // Generate UUID
    service_id: string; // Use placeholder if unknown
    name: string;
    description?: string;
    price: number;
    display_order: number;
    features: string[];
    is_popular: boolean;
    created_at: string;
    updated_at: string;
}

export interface ServiceAddon {
    id: string; // Generate UUID
    service_id: string;
    name: string;
    description?: string;
    price: number;
    is_active: boolean;
    created_at: string;
}

export interface VolumeDiscountTier {
    id: string; // Generate UUID
    service_id: string;
    min_guests: number;
    price_per_person: number;
    display_order: number;
    created_at: string;
}

export interface ServiceFixedFee {
    id: string; // Generate UUID
    service_id: string;
    name: string;
    price: number;
    is_active: boolean;
    created_at: string;
}

export interface ServicePricingConfig {
    pricing_model: ServicePricingModel;
    province?: string; // e.g., "Ontario"

    // Fixed model data
    base_price: number;
    fixed_addons?: ServiceAddon[];

    // Packages model data
    packages?: ServicePackage[];
    global_addons?: ServiceAddon[];

    // Per-person model data
    per_person_base_price?: number;
    max_guests?: number;
    has_volume_discounts?: boolean;
    volume_tiers?: VolumeDiscountTier[];
    fixed_fees?: ServiceFixedFee[];
}
`;

        const SYSTEM_PROMPT = `You are an expert pricing consultant for service businesses. 
Your goal is to generate a valid JSON object matching the 'ServicePricingConfig' TypeScript interface based on the user's request.

SCHEMA DEFINITION:
${PRICING_SCHEMA_DEF}

RULES:
1. Return ONLY valid JSON. No markdown formatting, no comments.
2. Generate UUIDs for all 'id' fields.
3. Use 'created_at' and 'updated_at' with current ISO timestamp.
4. Ensure logical consistency (e.g., if 'pricing_model' is 'packages', populate 'packages' array).
5. Be creative with package names and descriptions if not specified. If package names are given, create perfect description for them, if descp not given.
6. If the user request is vague, infer a reasonable structure.
`;

        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-exp:free",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: `Current Context: ${JSON.stringify(currentConfig || {})}\n\nUser Request: ${userPrompt}` }
            ],
            response_format: { type: "json_object" }
        });

        const result = completion.choices[0].message.content;
        if (!result) throw new Error("No response from AI");

        return { success: true, config: JSON.parse(result) };

    } catch (error) {
        console.error("Error generating pricing config:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}




interface ModelConfig {
    baseUrl?: string;
    modelName?: string;
    apiKey?: string; // Optional for local
}

export async function generateServiceConfigAction(userPrompt: string, currentService?: any, config?: ModelConfig) {
    try {
        // Default to OpenRouter if no config provided
        const finalBaseUrl = config?.baseUrl || "https://openrouter.ai/api/v1";
        const finalApiKey = config?.apiKey || process.env.OPENROUTER_API_KEY || "dummy-key"; // Ollama needs a key but ignores it usually
        const finalModel = config?.modelName || "nvidia/nemotron-3-nano-30b-a3b:free";

        const openai = new OpenAI({
            baseURL: finalBaseUrl,
            apiKey: finalApiKey,
            dangerouslyAllowBrowser: true, // Not needed in server action but good safety
        });

        const SERVICE_SCHEMA_DEF = `
export enum PricingMode {
  FIXED = 'fixed',
  CONFIGURED = 'configured', // Dynamic/Step-based
  RENTAL = 'rental'
}

export enum RuleType {
  ENABLE = 'enable', // Enable an option
  DISABLE = 'disable', // Disable an option
  PRICE_OVERRIDE = 'priceOverride', // Set exact price
  PRICE_MULTIPLIER = 'priceMultiplier', // Multiply total by factor
  STEP_SHOW = 'stepShow', // Show a hidden step
  STEP_HIDE = 'stepHide' // Hide a visible step
}

export type StepSelectionType = 'single' | 'multi' | 'quantity' | 'fixed';
export type StepDisplayStyle = 'card-standard' | 'card-compact' | 'card-icon' | 'list-toggle' | 'card-image' | 'card-color' | 'card-color-pill';

export interface Option {
  id: string; // UUID
  stepId: string; // UUID of parent step
  label: string;
  baseDelta: number; // Price added when selected
  description?: string;
  image?: string; // Optional image URL
  colorHex?: string; // Optional color hex code
}

export interface ConfigStep {
  id: string; // UUID
  serviceId: string; // UUID
  name: string;
  order: number;
  required: boolean;
  selectionType: StepSelectionType;
  displayStyle: StepDisplayStyle;
  options: Option[];
}

export interface RuleCondition {
  dependsOnStepId: string; // UUID
  selectedOptionId: string; // UUID
}

export interface RuleEffect {
  type: RuleType;
  targetOptionIds?: string[];
  targetStepIds?: string[];
  value?: number;
}

export interface Rule {
  id: string; // UUID
  serviceId: string;
  condition: RuleCondition;
  effects: RuleEffect[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  pricingMode: PricingMode;
  basePrice: number;
  steps: ConfigStep[]; // Array of questions/steps
  rules: Rule[]; // Array of logic rules
}
`;

        const SYSTEM_PROMPT = `You are an expert pricing framework architect.
Your goal is to generate a valid JSON object matching the 'Service' TypeScript interface (Dynamic Pricing Engine) based on the user's request.

SCHEMA:
${SERVICE_SCHEMA_DEF}

INSTRUCTIONS:
1. Return ONLY valid JSON.
2. Generate valid UUIDs for all IDs.
3. Carefully evaluate all the information provided by the user and always use that. If the user does not provide pricing then try to infer it.
4. Use the schema uploaded to read the current state and understand if the user wants to make some changes to the original configuration or wants you to generate a new one.
5. Use 'pricingMode': 'configured' for dynamic services.
6. Create logical steps with realistic prices.
7. If the user implies logic (e.g., "If over 100 guests, add 2nd shooter"), create a corresponding Rule.
8. If the user asks for "Wedding Planning", create steps like "Guest Count" (quantity), "Coverage Hours" (single), "Add-ons" (multi).
9. Use "card-image" for visual steps (e.g. Venues), "card-color" for palettes, and "card-standard" for features.

`;

        const completion = await openai.chat.completions.create({
            model: finalModel,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: `Current Service Context: ${JSON.stringify(currentService || {})}\n\nUser Request: ${userPrompt}` }
            ],
            response_format: { type: "json_object" }
        });

        const result = completion.choices[0].message.content;
        if (!result) throw new Error("No response from AI");

        return { success: true, config: JSON.parse(result) };

    } catch (error) {
        console.error("Error generating service config:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
