
import { createClient } from "@/lib/supabase/server";
// import { AppliedDiscount } from "@/lib/database.types"; // Removed for now
import { evaluatePrice } from "@/lib/pricing/pricing-engine";
import {
    ConfigStep,
    Service as PricingService,
    PricingMode,
    SelectionState,
    QuantityState,
    Rule
} from "@/types/pricing";

interface CartItemInput {
    service_id: string;
    quantity: number;
    selection_state?: SelectionState;
    stepQuantities?: QuantityState;
    pricing_model?: string;
}

interface ServiceRow {
    id: string;
    organizer_id: string;
    title: string;
    description: string;
    pricing_configuration_id: string;
}

// ... imports ...

export async function calculateCartTotals(items: CartItemInput[], promoCode?: string) {
    const supabase = await createClient();

    // 1. Fetch Services
    const serviceIds = items.map((i) => i.service_id);

    const { data: services, error } = await supabase
        .from('services')
        .select('id, organizer_id, title, description, pricing_configuration_id')
        .in('id', serviceIds);

    if (error || !services) {
        console.error("[pricing] Error fetching services:", error);
        return { success: false, message: "Failed to fetch services" };
    }

    // 2. Fetch Pricing Configs
    const configIds = services.map(s => s.pricing_configuration_id).filter(Boolean) as string[];
    let configs: any[] = [];
    if (configIds.length > 0) {
        const { data: configData } = await supabase
            .from('pricing_configurations')
            .select('*')
            .in('id', configIds);
        configs = configData || [];
    }

    // 3. Calculate Totals
    let base_total = 0;
    let final_total = 0;
    const discount_amount = 0;
    const discount_applied: any = null; // Discounts disabled
    const breakdown = [];

    for (const item of items) {
        const serviceRow = services.find((s) => s.id === item.service_id);
        if (!serviceRow) continue;

        // Resolve Config
        const config = configs.find(c => c.id === serviceRow.pricing_configuration_id);

        let configSteps: ConfigStep[] = [];
        let configRules: Rule[] = [];
        // Always usage configured mode now
        let pricingMode = PricingMode.CONFIGURED;

        if (config) {
            configSteps = config.steps as unknown as ConfigStep[];
            configRules = config.rules as unknown as Rule[];
        } else {
            console.warn(`[pricing] No configuration found for service ${serviceRow.id}`);
        }

        // Construct a Service object compatible with the Pricing Engine
        const engineService: PricingService = {
            id: serviceRow.id,
            name: serviceRow.title,
            description: serviceRow.description || "",
            basePrice: 0,
            pricingMode: pricingMode,
            steps: configSteps,
            rules: configRules
        };

        // Run Engine
        let itemTotal = 0;
        let itemBreakdownData = null;

        const result = evaluatePrice(
            engineService,
            item.selection_state || {},
            item.quantity || 1,
            item.stepQuantities || {}
        );
        itemTotal = result.totalPrice;
        itemBreakdownData = result.breakdown;

        breakdown.push({
            service_id: serviceRow.id,
            base_price: itemTotal, // It's dynamic
            subtotal: itemTotal,
            tax_amount: 0,
            // breakdown: itemBreakdownData 
        });

        base_total += itemTotal;
    }

    final_total = base_total;

    return {
        success: true,
        data: {
            base_total,
            final_total,
            discount_amount,
            discount_applied,
            breakdown
        }
    };
}
