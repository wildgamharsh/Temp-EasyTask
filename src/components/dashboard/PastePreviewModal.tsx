"use client";

import React from "react";
import { Check, X, AlertCircle } from "lucide-react";
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
import { cn } from "@/lib/utils";

export interface PastePreviewItem {
    value: string;
    isDuplicate: boolean;
}

interface PastePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: PastePreviewItem[];
    onConfirm: (items: string[]) => void;
    title?: string;
    type?: "features" | "items" | "addons";
}

export function PastePreviewModal({
    isOpen,
    onClose,
    items,
    onConfirm,
    title = "Paste Preview",
    type = "items",
}: PastePreviewModalProps) {
    const [selectedItems, setSelectedItems] = React.useState<Set<number>>(
        new Set(items.map((_, i) => i).filter((i) => !items[i].isDuplicate))
    );

    const newItems = items.filter((item) => !item.isDuplicate);
    const duplicates = items.filter((item) => item.isDuplicate);

    const toggleItem = (index: number) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedItems(newSelected);
    };

    const handleConfirm = () => {
        const itemsToAdd = Array.from(selectedItems)
            .map((i) => items[i].value)
            .filter((v) => v);
        onConfirm(itemsToAdd);
        onClose();
    };

    const handleSelectAll = () => {
        setSelectedItems(new Set(items.map((_, i) => i)));
    };

    const handleDeselectAll = () => {
        setSelectedItems(new Set());
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                            <Check className="h-5 w-5 text-blue-600" />
                        </div>
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        {items.length} {type} detected from your paste.{" "}
                        {duplicates.length > 0 && (
                            <span className="text-amber-600">
                                {duplicates.length} duplicate{duplicates.length > 1 ? "s" : ""} found.
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Summary Stats */}
                    <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex-1">
                            <div className="text-sm font-medium text-blue-900">
                                {newItems.length} new {type}
                            </div>
                            <div className="text-xs text-blue-700">
                                {selectedItems.size} selected to add
                            </div>
                        </div>
                        {duplicates.length > 0 && (
                            <div className="flex items-center gap-2 text-amber-600">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    {duplicates.length} duplicate{duplicates.length > 1 ? "s" : ""}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Item List */}
                    <ScrollArea className="h-[300px] rounded-lg border">
                        <div className="p-4 space-y-2">
                            {items.map((item, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => !item.isDuplicate && toggleItem(index)}
                                    disabled={item.isDuplicate}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all",
                                        item.isDuplicate &&
                                        "opacity-50 cursor-not-allowed bg-gray-50",
                                        !item.isDuplicate &&
                                        selectedItems.has(index) &&
                                        "border-blue-500 bg-blue-50",
                                        !item.isDuplicate &&
                                        !selectedItems.has(index) &&
                                        "border-gray-200 hover:border-blue-300 bg-white"
                                    )}
                                >
                                    {/* Checkbox */}
                                    <div
                                        className={cn(
                                            "flex h-5 w-5 items-center justify-center rounded border-2 shrink-0",
                                            item.isDuplicate &&
                                            "border-gray-300 bg-gray-100",
                                            !item.isDuplicate &&
                                            selectedItems.has(index) &&
                                            "border-blue-600 bg-blue-600",
                                            !item.isDuplicate &&
                                            !selectedItems.has(index) &&
                                            "border-gray-300"
                                        )}
                                    >
                                        {!item.isDuplicate && selectedItems.has(index) && (
                                            <Check className="h-3 w-3 text-white" />
                                        )}
                                        {item.isDuplicate && (
                                            <X className="h-3 w-3 text-gray-400" />
                                        )}
                                    </div>

                                    {/* Item Text */}
                                    <span
                                        className={cn(
                                            "flex-1 text-sm",
                                            item.isDuplicate
                                                ? "text-gray-400 line-through"
                                                : "text-gray-900"
                                        )}
                                    >
                                        {item.value}
                                    </span>

                                    {/* Badge */}
                                    {item.isDuplicate && (
                                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                                            Duplicate
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Quick Actions */}
                    {newItems.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Select All
                            </button>
                            <span className="text-gray-300">•</span>
                            <button
                                type="button"
                                onClick={handleDeselectAll}
                                className="text-gray-600 hover:text-gray-700 font-medium"
                            >
                                Deselect All
                            </button>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={selectedItems.size === 0}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Add {selectedItems.size} {type}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
