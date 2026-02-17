"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Tag, X, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { PromoCode } from "@/lib/discount-engine";

interface PromoCodeInputProps {
    onApply: (code: string) => Promise<{ valid: boolean; error?: string }>;
    onRemove: () => void;
    appliedPromo?: PromoCode | null;
    isLoading?: boolean;
    className?: string;
}

export function PromoCodeInput({
    onApply,
    onRemove,
    appliedPromo,
    isLoading = false,
    className
}: PromoCodeInputProps) {
    const [code, setCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isApplying, setIsApplying] = useState(false);

    const handleApply = async () => {
        if (!code.trim()) {
            setError("Please enter a promo code");
            return;
        }

        setIsApplying(true);
        setError(null);

        try {
            const result = await onApply(code.trim().toUpperCase());
            if (!result.valid) {
                setError(result.error || "Invalid promo code");
            } else {
                setCode("");
                setError(null);
            }
        } catch (err) {
            setError("Failed to apply promo code");
        } finally {
            setIsApplying(false);
        }
    };

    const handleRemove = () => {
        setCode("");
        setError(null);
        onRemove();
    };

    if (appliedPromo) {
        return (
            <div className={cn("space-y-2", className)}>
                <label className="text-sm font-bold text-slate-700">Promo Code</label>
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-emerald-900">
                            {appliedPromo.code}
                        </p>
                        <p className="text-xs text-emerald-700">
                            {appliedPromo.name}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemove}
                        className="text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("space-y-2", className)}>
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Have a Promo Code?
            </label>
            <div className="flex gap-2">
                <div className="flex-1">
                    <Input
                        placeholder="Enter code"
                        value={code}
                        onChange={(e) => {
                            setCode(e.target.value.toUpperCase());
                            setError(null);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleApply();
                            }
                        }}
                        className={cn(
                            "uppercase font-mono font-bold",
                            error && "border-red-300 focus-visible:ring-red-400"
                        )}
                        disabled={isApplying || isLoading}
                    />
                    {error && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {error}
                        </p>
                    )}
                </div>
                <Button
                    onClick={handleApply}
                    disabled={isApplying || isLoading || !code.trim()}
                    className="px-6 font-bold"
                >
                    {isApplying ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Applying...
                        </>
                    ) : (
                        "Apply"
                    )}
                </Button>
            </div>
        </div>
    );
}
