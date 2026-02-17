import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, Tag } from "lucide-react";
import { validatePromoCodeClient } from "@/lib/supabase-discounts-client";
import { PromoCode } from "@/lib/database.types";

interface PromoCodeInputProps {
    organizerId: string;
    onPromoCodeApplied: (promoCode: PromoCode | null) => void;
    appliedPromoCode: PromoCode | null;
}

export function PromoCodeInput({ organizerId, onPromoCodeApplied, appliedPromoCode }: PromoCodeInputProps) {
    const [code, setCode] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleApply = async () => {
        if (!code.trim()) {
            setError("Please enter a promo code");
            return;
        }

        setIsValidating(true);
        setError(null);

        try {
            const promoCode = await validatePromoCodeClient(organizerId, code.trim());

            if (promoCode) {
                onPromoCodeApplied(promoCode);
                setCode("");
                setError(null);
            } else {
                setError("Invalid or expired promo code");
                onPromoCodeApplied(null);
            }
        } catch (err) {
            console.error("Promo code validation error:", err);
            setError("Failed to validate promo code");
            onPromoCodeApplied(null);
        } finally {
            setIsValidating(false);
        }
    };

    const handleRemove = () => {
        onPromoCodeApplied(null);
        setCode("");
        setError(null);
    };

    if (appliedPromoCode) {
        return (
            <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    Promo Code Applied
                </Label>
                <div className="flex items-center gap-2 p-3 rounded-lg border-2 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                        {appliedPromoCode.code}
                    </Badge>
                    <span className="text-sm text-green-700 dark:text-green-300 flex-1">
                        {appliedPromoCode.description || "Discount applied"}
                    </span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemove}
                        className="h-8 w-8 p-0 text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <Label htmlFor="promoCode" className="text-base font-semibold flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Promo Code
                <span className="font-normal text-muted-foreground ml-2">(Optional)</span>
            </Label>
            <div className="flex gap-2">
                <div className="flex-1">
                    <Input
                        id="promoCode"
                        type="text"
                        placeholder="Enter promo code"
                        value={code}
                        onChange={(e) => {
                            setCode(e.target.value.toUpperCase());
                            setError(null);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleApply();
                            }
                        }}
                        className="uppercase"
                        disabled={isValidating}
                    />
                    {error && (
                        <p className="text-sm text-destructive mt-1">{error}</p>
                    )}
                </div>
                <Button
                    type="button"
                    onClick={handleApply}
                    disabled={isValidating || !code.trim()}
                    className="px-6"
                >
                    {isValidating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <Check className="h-4 w-4 mr-1" />
                            Apply
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
