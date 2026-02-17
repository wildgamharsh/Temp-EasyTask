"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, MoreHorizontal, Trash, Power, PowerOff, Copy, Check } from "lucide-react";
import { format } from "date-fns";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PromoCode } from "@/lib/database.types";
import { toast } from "sonner";

interface PromoCodeListProps {
    promoCodes: PromoCode[];
    onEdit: (promoCode: PromoCode) => void;
}

export function PromoCodeList({ promoCodes, onEdit }: PromoCodeListProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this promo code?")) return;

        setIsDeleting(id);
        try {
            const response = await fetch(`/api/organizer/promo-codes/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete promo code");

            toast.success("Promo code deleted");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete promo code");
        } finally {
            setIsDeleting(null);
        }
    };

    const handleToggle = async (promoCode: PromoCode) => {
        try {
            const response = await fetch(`/api/organizer/promo-codes/${promoCode.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_active: !promoCode.is_active }),
            });

            if (!response.ok) throw new Error("Failed to toggle promo code");

            toast.success(`Promo code ${promoCode.is_active ? "deactivated" : "activated"}`);
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to toggle promo code");
        }
    };

    const copyToClipboard = (id: string, code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        toast.success("Code copied to clipboard");
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (promoCodes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center border rounded-lg bg-gray-50 dark:bg-zinc-900 border-dashed">
                <p className="text-muted-foreground">No promo codes found</p>
                <p className="text-sm text-gray-500">Create your first promo code to get started</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm text-left">
                    <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Code</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Type</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Value</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Usage</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {promoCodes.map((promo) => (
                            <tr key={promo.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <td className="p-4 align-middle font-medium">
                                    <div className="flex items-center gap-2">
                                        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{promo.code}</code>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => copyToClipboard(promo.id, promo.code)}
                                        >
                                            {copiedId === promo.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                        </Button>
                                    </div>
                                    {promo.description && (
                                        <span className="text-xs text-muted-foreground mt-1 block">{promo.description}</span>
                                    )}
                                </td>
                                <td className="p-4 align-middle capitalize">{promo.discount_type.replace("_", " ")}</td>
                                <td className="p-4 align-middle">
                                    {promo.discount_type === "percentage" || promo.discount_type === "percentage_capped" ? `${promo.discount_value}%` : `$${promo.discount_value}`}
                                    {promo.discount_type === "percentage_capped" && (
                                        <span className="text-xs text-muted-foreground block">Max ${promo.max_discount_amount}</span>
                                    )}
                                </td>
                                <td className="p-4 align-middle">
                                    {promo.current_total_uses} / {promo.max_total_uses || "∞"}
                                </td>
                                <td className="p-4 align-middle">
                                    <Badge variant={promo.is_active ? "default" : "secondary"}>
                                        {promo.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </td>
                                <td className="p-4 align-middle text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => onEdit(promo)}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleToggle(promo)}>
                                                {promo.is_active ? (
                                                    <>
                                                        <PowerOff className="mr-2 h-4 w-4" /> Deactivate
                                                    </>
                                                ) : (
                                                    <>
                                                        <Power className="mr-2 h-4 w-4" /> Activate
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleDelete(promo.id)} className="text-red-600">
                                                <Trash className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
