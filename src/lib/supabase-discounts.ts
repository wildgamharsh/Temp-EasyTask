import { createAdminClient } from "@/lib/supabase/admin";
import {
    Discount,
    PromoCode,
    DiscountUsageLog,
} from "./database.types";

// ============================================================================
// DISCOUNT OPERATIONS
// ============================================================================

/**
 * Get all discounts for an organizer
 */
export async function getDiscountsByOrganizer(
    organizerId: string
): Promise<Discount[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("discounts")
        .select("*")
        .eq("organizer_id", organizerId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching discounts:", JSON.stringify(error, null, 2));
        return [];
    }

    return data || [];
}

/**
 * Get active discounts for an organizer (for pricing calculation)
 */
export async function getActiveDiscounts(
    organizerId: string
): Promise<Discount[]> {
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("discounts")
        .select("*")
        .eq("organizer_id", organizerId)
        .eq("is_active", true)
        .or(`valid_from.is.null,valid_from.lte.${now}`)
        .or(`valid_until.is.null,valid_until.gte.${now}`)
        .order("priority", { ascending: true })
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error fetching active discounts:", error);
        return [];
    }

    return data || [];
}

/**
 * Get ALL active discounts across the platform (for marketplace)
 */
export async function getAllActiveDiscounts(): Promise<Discount[]> {
    const supabase = createAdminClient();
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

/**
 * Get a single discount by ID
 */
export async function getDiscount(id: string): Promise<Discount | null> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("discounts")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        console.error("Error fetching discount:", error);
        return null;
    }

    return data;
}

/**
 * Create a new discount
 */
export async function createDiscount(
    discount: Omit<Discount, "id" | "created_at" | "updated_at" | "current_total_uses">
): Promise<Discount | null> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("discounts")
        .insert({
            organizer_id: discount.organizer_id,
            name: discount.name,
            description: discount.description,
            internal_code: discount.internal_code,
            is_active: discount.is_active,
            discount_type: discount.discount_type,
            discount_value: discount.discount_value,
            max_discount_amount: discount.max_discount_amount,
            scope: discount.scope,
            applicable_service_ids: discount.applicable_service_ids,
            applicable_category_ids: discount.applicable_category_ids,
            min_cart_value: discount.min_cart_value,
            first_time_customer_only: discount.first_time_customer_only,
            valid_from: discount.valid_from,
            valid_until: discount.valid_until,
            max_total_uses: discount.max_total_uses,
            max_uses_per_user: discount.max_uses_per_user,
            priority: discount.priority,
            created_by: discount.created_by,
        })
        .select()
        .single();

    if (error || !data) {
        console.error("Error creating discount:", error);
        return null;
    }

    return data;
}

/**
 * Update an existing discount
 */
export async function updateDiscount(
    id: string,
    updates: Partial<Omit<Discount, "id" | "organizer_id" | "created_at" | "updated_at">>
): Promise<Discount | null> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("discounts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error || !data) {
        console.error("Error updating discount:", error);
        return null;
    }

    return data;
}

/**
 * Delete a discount
 */
export async function deleteDiscount(id: string): Promise<boolean> {
    const supabase = createAdminClient();
    const { error } = await supabase.from("discounts").delete().eq("id", id);

    if (error) {
        console.error("Error deleting discount:", error);
        return false;
    }

    return true;
}

/**
 * Toggle discount active status
 */
export async function toggleDiscount(id: string, isActive: boolean): Promise<Discount | null> {
    return updateDiscount(id, { is_active: isActive });
}

// ============================================================================
// PROMO CODE OPERATIONS
// ============================================================================

/**
 * Get all promo codes for an organizer
 */
export async function getPromoCodesByOrganizer(
    organizerId: string
): Promise<PromoCode[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("organizer_id", organizerId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching promo codes:", JSON.stringify(error, null, 2));
        return [];
    }

    return data || [];
}

/**
 * Get a single promo code by ID
 */
export async function getPromoCode(id: string): Promise<PromoCode | null> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        console.error("Error fetching promo code:", error);
        return null;
    }

    return data;
}

/**
 * Validate and retrieve a promo code by code string
 */
export async function validatePromoCode(
    organizerId: string,
    code: string
): Promise<PromoCode | null> {
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("organizer_id", organizerId)
        .ilike("code", code) // Case-insensitive match
        .eq("is_active", true)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        console.error("Error validating promo code:", error);
        return null;
    }

    // Check time validity
    if (data.valid_from && new Date(data.valid_from) > new Date(now)) {
        return null; // Not yet valid
    }
    if (data.valid_until && new Date(data.valid_until) < new Date(now)) {
        return null; // Expired
    }

    // Check usage limits
    if (data.max_total_uses && data.current_total_uses >= data.max_total_uses) {
        return null; // Usage limit reached
    }

    return data;
}

/**
 * Create a new promo code
 */
export async function createPromoCode(
    promoCode: Omit<PromoCode, "id" | "created_at" | "updated_at" | "current_total_uses">
): Promise<PromoCode | null> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("promo_codes")
        .insert({
            organizer_id: promoCode.organizer_id,
            code: promoCode.code.toUpperCase(), // Store in uppercase
            description: promoCode.description,
            is_active: promoCode.is_active,
            discount_type: promoCode.discount_type,
            discount_value: promoCode.discount_value,
            max_discount_amount: promoCode.max_discount_amount,
            scope: promoCode.scope,
            applicable_service_ids: promoCode.applicable_service_ids,
            applicable_category_ids: promoCode.applicable_category_ids,
            min_cart_value: promoCode.min_cart_value,
            first_time_customer_only: promoCode.first_time_customer_only,
            valid_from: promoCode.valid_from,
            valid_until: promoCode.valid_until,
            max_total_uses: promoCode.max_total_uses,
            max_uses_per_user: promoCode.max_uses_per_user,
            created_by: promoCode.created_by,
        })
        .select()
        .single();

    if (error || !data) {
        console.error("Error creating promo code:", error);
        return null;
    }

    return data;
}

/**
 * Update an existing promo code
 */
export async function updatePromoCode(
    id: string,
    updates: Partial<Omit<PromoCode, "id" | "organizer_id" | "created_at" | "updated_at">>
): Promise<PromoCode | null> {
    const supabase = createAdminClient();

    // Ensure code is uppercase if being updated
    if (updates.code) {
        updates.code = updates.code.toUpperCase();
    }

    const { data, error } = await supabase
        .from("promo_codes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error || !data) {
        console.error("Error updating promo code:", error);
        return null;
    }

    return data;
}

/**
 * Delete a promo code
 */
export async function deletePromoCode(id: string): Promise<boolean> {
    const supabase = createAdminClient();
    const { error } = await supabase.from("promo_codes").delete().eq("id", id);

    if (error) {
        console.error("Error deleting promo code:", error);
        return false;
    }

    return true;
}

/**
 * Toggle promo code active status
 */
export async function togglePromoCode(id: string, isActive: boolean): Promise<PromoCode | null> {
    return updatePromoCode(id, { is_active: isActive });
}

// ============================================================================
// USAGE TRACKING
// ============================================================================

/**
 * Get discount usage statistics
 */
export async function getDiscountUsageStats(discountId: string): Promise<{
    total_uses: number;
    total_revenue: number;
    total_discount_given: number;
    recent_uses: DiscountUsageLog[];
}> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("discount_usage_log")
        .select("*")
        .eq("discount_id", discountId)
        .order("applied_at", { ascending: false });

    if (error || !data) {
        console.error("Error fetching discount usage stats:", error);
        return {
            total_uses: 0,
            total_revenue: 0,
            total_discount_given: 0,
            recent_uses: [],
        };
    }

    return {
        total_uses: data.length,
        total_revenue: data.reduce((sum, log) => sum + log.final_amount, 0),
        total_discount_given: data.reduce((sum, log) => sum + log.applied_discount_amount, 0),
        recent_uses: data.slice(0, 10),
    };
}

/**
 * Get promo code usage statistics
 */
export async function getPromoCodeUsageStats(promoCodeId: string): Promise<{
    total_uses: number;
    total_revenue: number;
    total_discount_given: number;
    recent_uses: DiscountUsageLog[];
}> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("discount_usage_log")
        .select("*")
        .eq("promo_code_id", promoCodeId)
        .order("applied_at", { ascending: false });

    if (error || !data) {
        console.error("Error fetching promo code usage stats:", error);
        return {
            total_uses: 0,
            total_revenue: 0,
            total_discount_given: 0,
            recent_uses: [],
        };
    }

    return {
        total_uses: data.length,
        total_revenue: data.reduce((sum, log) => sum + log.final_amount, 0),
        total_discount_given: data.reduce((sum, log) => sum + log.applied_discount_amount, 0),
        recent_uses: data.slice(0, 10),
    };
}

/**
 * Get user's usage count for a specific discount
 */
export async function getUserDiscountUsageCount(
    userId: string,
    discountId: string
): Promise<number> {
    const supabase = createAdminClient();
    const { count, error } = await supabase
        .from("discount_usage_log")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("discount_id", discountId);

    if (error) {
        console.error("Error fetching user discount usage:", error);
        return 0;
    }

    return count || 0;
}

/**
 * Get user's usage count for a specific promo code
 */
export async function getUserPromoCodeUsageCount(
    userId: string,
    promoCodeId: string
): Promise<number> {
    const supabase = createAdminClient();
    const { count, error } = await supabase
        .from("discount_usage_log")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("promo_code_id", promoCodeId);

    if (error) {
        console.error("Error fetching user promo code usage:", error);
        return 0;
    }

    return count || 0;
}

/**
 * Create a discount usage log entry
 */
export async function createDiscountUsageLog(
    log: Omit<DiscountUsageLog, "id" | "applied_at">
): Promise<DiscountUsageLog | null> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("discount_usage_log")
        .insert(log)
        .select()
        .single();

    if (error || !data) {
        console.error("Error creating discount usage log:", error);
        return null;
    }

    return data;
}

/**
 * Check if user is first-time customer for a tenant
 */
export async function isFirstTimeCustomer(
    userId: string,
    organizerId: string
): Promise<boolean> {
    const supabase = createAdminClient();
    const { count, error } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("customer_id", userId)
        .eq("organizer_id", organizerId)
        .in("status", ["confirmed", "completed"]);

    if (error) {
        console.error("Error checking first-time customer:", error);
        return false;
    }

    return (count || 0) === 0;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a random promo code
 */
export function generatePromoCode(length: number = 8): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * Check if a promo code is unique for an organizer
 */
export async function isPromoCodeUnique(
    organizerId: string,
    code: string,
    excludeId?: string
): Promise<boolean> {
    const supabase = createAdminClient();
    let query = supabase
        .from("promo_codes")
        .select("id")
        .eq("organizer_id", organizerId)
        .ilike("code", code);

    if (excludeId) {
        query = query.neq("id", excludeId);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error checking promo code uniqueness:", error);
        return false;
    }

    return !data || data.length === 0;
}
