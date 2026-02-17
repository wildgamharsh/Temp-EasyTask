"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PromoCode } from "@/lib/database.types";
import { toast } from "sonner";
import { useFormPersistence } from "@/hooks/use-form-persistence";

// ============================================================================
// LOCAL HELPER
// ============================================================================

function generateRandomCode(length: number = 8): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// ============================================================================
// SCHEMA
// ============================================================================

const formSchema = z.object({
    code: z.string().min(3, "Code must be at least 3 characters").regex(/^[A-Za-z0-9_-]+$/, "Only letters, numbers, hyphens and underscores allowed"),
    description: z.string().optional(),
    discount_type: z.enum(["percentage", "flat_amount", "percentage_capped", "free_service"]),
    discount_value: z.coerce.number().min(0, "Value must be positive"),
    max_discount_amount: z.coerce.number().optional(),
    scope: z.enum(["global", "service_specific", "category_specific"]),
    applicable_service_ids: z.array(z.string()).optional(),
    applicable_category_ids: z.array(z.string()).optional(),
    min_cart_value: z.coerce.number().optional(),
    first_time_customer_only: z.boolean().default(false),
    valid_from: z.string().optional(),
    valid_until: z.string().optional(),
    max_total_uses: z.coerce.number().optional(),
    max_uses_per_user: z.coerce.number().optional(),
    is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

// ============================================================================
// COMPONENT
// ============================================================================

interface PromoCodeFormProps {
    initialData?: PromoCode;
    onSuccess?: () => void;
    persistenceKey?: string;
}

export function PromoCodeForm({ initialData, onSuccess, persistenceKey }: PromoCodeFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Default values
    const defaultValues: FormValues = useMemo(() => ({
        code: initialData?.code || "",
        description: initialData?.description || "",
        discount_type: initialData?.discount_type || "percentage",
        discount_value: initialData?.discount_value || 0,
        max_discount_amount: initialData?.max_discount_amount || undefined,
        scope: initialData?.scope || "global",
        applicable_service_ids: initialData?.applicable_service_ids || [],
        applicable_category_ids: initialData?.applicable_category_ids || [],
        min_cart_value: initialData?.min_cart_value || undefined,
        first_time_customer_only: initialData?.first_time_customer_only || false,
        valid_from: initialData?.valid_from ? new Date(initialData.valid_from).toISOString().slice(0, 16) : "",
        valid_until: initialData?.valid_until ? new Date(initialData.valid_until).toISOString().slice(0, 16) : "",
        max_total_uses: initialData?.max_total_uses || undefined,
        max_uses_per_user: initialData?.max_uses_per_user || undefined,
        is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
    }), [initialData]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues,
    });

    // Persistence Logic
    const { clearStorage } = useFormPersistence({
        key: persistenceKey || "promocode_form_draft",
        form,
        defaultValues,
        isEnabled: !!persistenceKey && !initialData, // Only persist if creating new and key provided
    });

    const discountType = form.watch("discount_type");

    function handleGenerateCode() {
        const newCode = generateRandomCode();
        form.setValue("code", newCode);
    }

    async function onSubmit(values: FormValues) {
        setIsSubmitting(true);
        try {
            // Prepare payload
            const payload = {
                ...values,
                code: values.code.toUpperCase(),
                valid_from: values.valid_from && values.valid_from !== "" ? new Date(values.valid_from).toISOString() : null,
                valid_until: values.valid_until && values.valid_until !== "" ? new Date(values.valid_until).toISOString() : null,
            };

            const url = initialData
                ? `/api/organizer/promo-codes/${initialData.id}`
                : "/api/organizer/promo-codes";

            const method = initialData ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            toast.success(initialData ? "Promo code updated" : "Promo code created");
            clearStorage(); // Clear draft on success
            router.refresh();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Failed to save promo code");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-blue-900 border-b border-blue-100 pb-2">Promo Code</h3>
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Code</FormLabel>
                                    <div className="flex gap-2">
                                        <FormControl>
                                            <Input
                                                placeholder="SUMMER2024"
                                                className="uppercase font-mono text-lg tracking-wider focus-visible:ring-blue-500"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                            />
                                        </FormControl>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={handleGenerateCode}
                                            title="Generate Random Code"
                                            className="hover:bg-blue-50 hover:text-blue-600 border-blue-200"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <FormDescription>Codes are case-insensitive</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Private discount for VIPs" {...field} value={field.value ?? ""} className="focus-visible:ring-blue-500" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Configuration - Reused Logic */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-blue-900 border-b border-blue-100 pb-2">Discount Value</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="discount_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="focus:ring-blue-500 text-left">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="percentage">Percentage</SelectItem>
                                                <SelectItem value="flat_amount">Flat Amount ($)</SelectItem>
                                                <SelectItem value="percentage_capped">Percentage with Cap</SelectItem>
                                                <SelectItem value="free_service">Free Service</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="discount_value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Value</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} value={field.value ?? ""} className="focus-visible:ring-blue-500" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {discountType === "percentage_capped" && (
                            <FormField
                                control={form.control}
                                name="max_discount_amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Maximum Discount Amount ($)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} value={field.value ?? ""} className="focus-visible:ring-blue-500" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="scope"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Scope</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="focus:ring-blue-500">
                                                <SelectValue placeholder="Select scope" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="global">Global (All Services)</SelectItem>
                                            <SelectItem value="service_specific">Specific Services</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Constraints */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-blue-900 border-b border-blue-100 pb-2">Constraints</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="min_cart_value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Min Cart Value ($)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} value={field.value ?? ""} className="focus-visible:ring-blue-500" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="max_total_uses"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Max Total Uses</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Unlimited" {...field} value={field.value ?? ""} className="focus-visible:ring-blue-500" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="max_uses_per_user"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Uses Per User</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Unlimited" {...field} value={field.value ?? ""} className="focus-visible:ring-blue-500" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="first_time_customer_only"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-gray-50/50">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base text-gray-900">First-time Customer Only</FormLabel>
                                        <FormDescription>
                                            Only valid for new customers
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="data-[state=checked]:bg-blue-600"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="is_active"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-gray-50/50">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base text-gray-900">Active</FormLabel>
                                        <FormDescription>
                                            Enable or disable this promo code
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="data-[state=checked]:bg-blue-600"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Time Window */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-blue-900 border-b border-blue-100 pb-2">Valid Dates</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="valid_from"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valid From</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} value={field.value ?? ""} className="focus-visible:ring-blue-500" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="valid_until"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valid Until</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} value={field.value ?? ""} className="focus-visible:ring-blue-500" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-100 gap-3">
                    <Button type="button" variant="outline" onClick={() => onSuccess && onSuccess()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 min-w-[120px]">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? "Update Promo Code" : "Create Promo Code"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
