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
import { PromoCode } from "@/lib/database.types";
import { PromoCodeList } from "./PromoCodeList";
import { PromoCodeForm } from "./PromoCodeForm";

interface PromoCodesClientProps {
    promoCodes: PromoCode[];
}

export function PromoCodesClient({ promoCodes }: PromoCodesClientProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<PromoCode | undefined>(undefined);

    const handleCreate = () => {
        setEditingPromo(undefined);
        setIsOpen(true);
    };

    const handleEdit = (promo: PromoCode) => {
        setEditingPromo(promo);
        setIsOpen(true);
    };

    const handleSuccess = () => {
        setIsOpen(false);
        setEditingPromo(undefined);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-blue-950">Promo Codes</h2>
                    <p className="text-muted-foreground">
                        Manage exclusive promotional codes for your customers.
                    </p>
                </div>
                <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Create Promo Code
                </Button>
            </div>

            <PromoCodeList promoCodes={promoCodes} onEdit={handleEdit} />

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
                    <DialogHeader className="bg-blue-50/50 -mx-6 -mt-6 p-6 border-b border-blue-100 mb-6">
                        <DialogTitle className="text-xl text-blue-900">
                            {editingPromo ? "Edit Promo Code" : "Create New Promo Code"}
                        </DialogTitle>
                        <DialogDescription className="text-blue-600/80">
                            Configure the rules and constraints for your promo code.
                        </DialogDescription>
                    </DialogHeader>

                    <PromoCodeForm
                        initialData={editingPromo}
                        onSuccess={handleSuccess}
                        persistenceKey={editingPromo ? undefined : "draft_promocode_new"}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
