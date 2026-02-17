"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Discount } from "@/lib/database.types";
import { DiscountList } from "./DiscountList";
import { DiscountForm } from "./DiscountForm";

interface DiscountsClientProps {
    discounts: Discount[];
}

export function DiscountsClient({ discounts }: DiscountsClientProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<Discount | undefined>(undefined);

    const handleCreate = () => {
        setEditingDiscount(undefined);
        setIsOpen(true);
    };

    const handleEdit = (discount: Discount) => {
        setEditingDiscount(discount);
        setIsOpen(true);
    };

    const handleSuccess = () => {
        setIsOpen(false);
        setEditingDiscount(undefined);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-blue-950">Discounts & Offers</h2>
                    <p className="text-muted-foreground">
                        Manage your automatic discounts and special offers.
                    </p>
                </div>
                <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Create Discount
                </Button>
            </div>

            <DiscountList discounts={discounts} onEdit={handleEdit} />

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
                    <DialogHeader className="bg-blue-50/50 -mx-6 -mt-6 p-6 border-b border-blue-100 mb-6">
                        <DialogTitle className="text-xl text-blue-900">
                            {editingDiscount ? "Edit Discount" : "Create New Discount"}
                        </DialogTitle>
                        <DialogDescription className="text-blue-600/80">
                            Configure the rules and conditions for your discount.
                        </DialogDescription>
                    </DialogHeader>

                    <DiscountForm
                        initialData={editingDiscount}
                        onSuccess={handleSuccess}
                        persistenceKey={editingDiscount ? undefined : "draft_discount_new"}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
