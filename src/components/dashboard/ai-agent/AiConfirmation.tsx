"use client";

import { AlertTriangle, Check, X, Bot, ArrowRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface AiConfirmationProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toolCall: any;
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function AiConfirmation({ toolCall, isOpen, onConfirm, onCancel }: AiConfirmationProps) {
    if (!toolCall) return null;

    const toolName = toolCall.function.name;
    const argsStr = toolCall.function.arguments;

    let toolDisplayTitle = "Unknown Action";
    let isDangerous = false;

    if (toolName.includes("update_storefront") || toolName.includes("update_config")) {
        toolDisplayTitle = "Update Storefront Configuration";
        isDangerous = true;
    } else if (toolName.includes("block_date")) {
        toolDisplayTitle = "Block Date Availability";
    } else if (toolName.includes("unblock_date")) {
        toolDisplayTitle = "Unblock Date Availability";
    } else if (toolName.includes("booking")) {
        toolDisplayTitle = "Update Booking";
        isDangerous = true;
    } else {
        toolDisplayTitle = toolName.replace(/_/g, " ");
    }

    function renderArgs() {
        try {
            const parsed = JSON.parse(argsStr);
            const items = Object.entries(parsed).filter(([k]) => k !== 'organizer_id');
            
            if (items.length === 0) return <p className="text-sm text-gray-500 italic">No specific parameters.</p>;

            return (
                <div className="space-y-3">
                    {items.map(([key, value]) => {
                        let displayValue = String(value);
                        // Date formatting logic
                        if ((key.includes('date') || key.includes('created') || key.includes('updated')) && typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
                            try {
                                displayValue = format(parseISO(value), "EEEE, MMMM do yyyy");
                            } catch {
                                // Keep original if parse fails
                            }
                        }

                        return (
                        <div key={key} className="flex flex-col gap-1 border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">{key.replace(/_/g, ' ')}</span>
                            <div className="flex items-center gap-2">
                                <ArrowRight className="w-3 h-3 text-blue-500" />
                                <span className="font-medium text-gray-900 text-sm break-all">
                                    {typeof value === 'object' ? JSON.stringify(value) : displayValue}
                                </span>
                            </div>
                        </div>
                        );
                    })}
                </div>
            );
        } catch {
            return <p className="text-sm text-gray-500">Unable to parse parameters.</p>;
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent className="sm:max-w-[450px] gap-0 p-0 overflow-hidden bg-white border-0 shadow-lg ring-1 ring-gray-900/5">
                
                {/* Header */}
                <div className="bg-gray-50 p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                             <DialogTitle className="text-lg font-semibold text-gray-900">Confirm Action</DialogTitle>
                             <DialogDescription className="text-sm text-gray-500">
                                The AI needs your permission to proceed.
                            </DialogDescription>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="mb-4">
                        <Badge variant="outline" className="mb-3 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">
                            {toolDisplayTitle}
                        </Badge>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                             <ScrollArea className="max-h-[200px] pr-2">
                                {renderArgs()}
                            </ScrollArea>
                        </div>
                    </div>

                    {isDangerous && (
                        <div className="flex items-start gap-2 p-3 bg-amber-50 text-amber-800 rounded-lg text-xs leading-relaxed border border-amber-100">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <p>This action will modify your live settings. Please verify the values above.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <DialogFooter className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3 sm:gap-3">
                    <Button variant="outline" onClick={onCancel} className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                    </Button>
                    <Button onClick={onConfirm} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                        <Check className="w-4 h-4 mr-2" />
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
