
import { createClient } from "@/lib/supabase/client";
import { PricingConfiguration, Service } from "@/lib/database.types";
import { ConfigStep, Rule } from "@/types/pricing";
import { calculatePriceRange } from "./pricing-engine";

export async function savePricingConfiguration(
    serviceId: string,
    steps: ConfigStep[],
    rules: Rule[]
): Promise<PricingConfiguration | null> {
    const supabase = createClient();

    // 1. Calculate Price Range locally
    const { minPrice, maxPrice } = calculatePriceRange(0, steps, rules);

    // 2. Determine if we should Update or Create
    // Check service's pointer and get owner
    const { data: serviceData } = await supabase
        .from("services")
        .select("pricing_configuration_id, organizer_id")
        .eq("id", serviceId)
        .single();

    if (!serviceData) throw new Error("Service not found");

    const ownerId = serviceData.organizer_id;
    let configId = serviceData.pricing_configuration_id;
    let savedConfig: PricingConfiguration | null = null;
    let error: any = null;

    if (configId) {
        // Update existing
        const result = await supabase
            .from("pricing_configurations")
            .update({
                steps,
                rules,
                updated_at: new Date().toISOString()
            })
            .eq("id", configId)
            .select()
            .single();

        savedConfig = result.data as unknown as PricingConfiguration;
        error = result.error;
    } else {
        // Create new (Detached config, no reference back to service)
        // Must include organizer_id for RLS ownership
        const result = await supabase
            .from("pricing_configurations")
            .insert({
                organizer_id: ownerId,
                steps,
                rules
            })
            .select()
            .single();

        savedConfig = result.data as unknown as PricingConfiguration;
        error = result.error;
        if (savedConfig) configId = savedConfig.id;
    }

    if (error || !savedConfig) {
        console.error("Error saving pricing config:", JSON.stringify(error, null, 2));
        return null; // Return null on error
    }

    // 3. Link Config to Service (Pointer only)
    const { error: linkError } = await supabase
        .from("services")
        .update({
            pricing_configuration_id: configId
        })
        .eq("id", serviceId);

    if (linkError) {
        console.error("Error linking config to service:", JSON.stringify(linkError, null, 2));
    }

    return savedConfig;
}

export async function getPricingConfiguration(serviceId: string): Promise<PricingConfiguration | null> {
    const supabase = createClient();

    // Fetch service first to get the pointer
    const { data: service, error: serviceError } = await supabase
        .from("services")
        .select("pricing_configuration_id")
        .eq("id", serviceId)
        .single();

    if (serviceError || !service?.pricing_configuration_id) return null;

    const { data, error } = await supabase
        .from("pricing_configurations")
        .select("*")
        .eq("id", service.pricing_configuration_id)
        .single();

    if (error) {
        console.error("Error fetching pricing configuration:", error);
        return null;
    }

    return data as PricingConfiguration;
}

export async function deletePricingConfiguration(serviceId: string): Promise<boolean> {
    const supabase = createClient();

    // Get config ID first
    const { data: service } = await supabase.from("services").select("pricing_configuration_id").eq("id", serviceId).single();
    if (!service?.pricing_configuration_id) return true; // Already gone

    // Unlink first
    await supabase.from("services").update({ pricing_configuration_id: null }).eq("id", serviceId);

    // Then delete (orphaned row)
    const { error } = await supabase
        .from("pricing_configurations")
        .delete()
        .eq("id", service.pricing_configuration_id);

    return !error;
}

export async function getPricingConfigurationsForServices(serviceIds: string[]): Promise<PricingConfiguration[]> {
    if (!serviceIds || serviceIds.length === 0) return [];

    const supabase = createClient();

    // We need to fetch services first to get their config IDs?
    // Or we can join? Supabase join syntax:
    // Actually, services have pricing_configuration_id.
    // If we have serviceIds, we can fetch the services to get the config IDs.

    const { data: services } = await supabase
        .from('services')
        .select('pricing_configuration_id')
        .in('id', serviceIds);

    if (!services) return [];

    const configIds = services
        .map(s => s.pricing_configuration_id)
        .filter(id => id !== null) as string[];

    if (configIds.length === 0) return [];

    const { data: configs, error } = await supabase
        .from('pricing_configurations')
        .select('*')
        .in('id', configIds);

    if (error) {
        console.error("Error fetching bulk pricing configurations:", error);
        return [];
    }

    return configs as PricingConfiguration[];
}

