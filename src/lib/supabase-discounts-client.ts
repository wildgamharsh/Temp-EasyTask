import { createClient } from "@/lib/supabase/client";
import { Discount, PromoCode } from "./database.types";

/**
 * Client-safe function to get active discounts for an organizer
 * This can be called from client components
 */
export async function getActiveDiscountsClient(
    organizerId: string
): Promise<Discount[]> {
    const supabase = createClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("discounts")
        .select("*")
        .eq("organizer_id", organizerId)
        .eq("is_active", true)
        .or(`valid_from.is.null,valid_from.lte.${now}`)
        .or(`valid_until.is.null,valid_until.gte.${now}`)
        .order("priority", { ascending: true });

    if (error) {
        console.error("Error fetching active discounts:", error);
        return [];
    }

    return data || [];
}

/**
 * Client-safe function to validate a promo code
 * This can be called from client components
 */
export async function validatePromoCodeClient(
    organizerId: string,
    code: string
): Promise<PromoCode | null> {
    const supabase = createClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("organizer_id", organizerId)
        .ilike("code", code)
        .eq("is_active", true)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            console.log("Promo code not found:", code);
            return null;
        }
        console.error("Error validating promo code:", error);
        return null;
    }

    // Check time validity
    if (data.valid_from && new Date(data.valid_from) > new Date(now)) {
        console.log("Promo code not yet valid:", code);
        return null;
    }
    if (data.valid_until && new Date(data.valid_until) < new Date(now)) {
        console.log("Promo code expired:", code);
        return null;
    }

    // Check usage limits
    if (data.max_total_uses && data.current_total_uses >= data.max_total_uses) {
        console.log("Promo code usage limit reached:", code);
        return null;
    }

    return data;
}

/**
 * Client-safe function to get all active discounts (for marketplace)
 */
export async function getAllActiveDiscountsClient(): Promise<Discount[]> {
    const supabase = createClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("discounts")
        .select("*")
        .eq("is_active", true)
        .or(`valid_from.is.null,valid_from.lte.${now}`)
        .or(`valid_until.is.null,valid_until.gte.${now}`)
        .order("priority", { ascending: true });

    if (error) {
        console.error("Error fetching all active discounts:", error);
        return [];
    }

    return data || [];
}
