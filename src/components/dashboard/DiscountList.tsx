"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, MoreHorizontal, Trash, Power, PowerOff } from "lucide-react";
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
import { Discount } from "@/lib/database.types";
import { toast } from "sonner";

interface DiscountListProps {
    discounts: Discount[];
    onEdit: (discount: Discount) => void;
}

export function DiscountList({ discounts, onEdit }: DiscountListProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this discount?")) return;

        setIsDeleting(id);
        try {
            const response = await fetch(`/api/organizer/discounts/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete discount");

            toast.success("Discount deleted");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete discount");
        } finally {
            setIsDeleting(null);
        }
    };

    const handleToggle = async (discount: Discount) => {
        try {
            const response = await fetch(`/api/organizer/discounts/${discount.id}/toggle`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !discount.is_active }),
            });

            if (!response.ok) throw new Error("Failed to toggle discount");

            toast.success(`Discount ${discount.is_active ? "deactivated" : "activated"}`);
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to toggle discount");
        }
    };

    if (discounts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center border rounded-lg bg-gray-50 dark:bg-zinc-900 border-dashed">
                <p className="text-muted-foreground">No discounts found</p>
                <p className="text-sm text-gray-500">Create your first discount to get started</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm text-left">
                    <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Name</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Type</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Value</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Usage</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {discounts.map((discount) => (
                            <tr key={discount.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <td className="p-4 align-middle font-medium">
                                    <div className="flex flex-col">
                                        <span>{discount.name}</span>
                                        {discount.internal_code && (
                                            <span className="text-xs text-muted-foreground">{discount.internal_code}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 align-middle capitalize">{discount.discount_type.replace("_", " ")}</td>
                                <td className="p-4 align-middle">
                                    {discount.discount_type === "percentage" || discount.discount_type === "percentage_capped" ? `${discount.discount_value}%` : `$${discount.discount_value}`}
                                    {discount.discount_type === "percentage_capped" && (
                                        <span className="text-xs text-muted-foreground block">Max ${discount.max_discount_amount}</span>
                                    )}
                                </td>
                                <td className="p-4 align-middle">
                                    {discount.current_total_uses} / {discount.max_total_uses || "∞"}
                                </td>
                                <td className="p-4 align-middle">
                                    <Badge variant={discount.is_active ? "default" : "secondary"}>
                                        {discount.is_active ? "Active" : "Inactive"}
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
                                            <DropdownMenuItem onClick={() => onEdit(discount)}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleToggle(discount)}>
                                                {discount.is_active ? (
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
                                            <DropdownMenuItem onClick={() => handleDelete(discount.id)} className="text-red-600">
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
