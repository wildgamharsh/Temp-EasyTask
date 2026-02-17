import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ServiceDetailClient from "@/app/services/[id]/ServiceDetailClient";
import { Service, PricingConfiguration } from "@/lib/database.types";

interface ServicePageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ServiceDetailPage(props: ServicePageProps) {
    const params = await props.params;
    const supabase = await createClient();

    // Fetch Service
    const { data: service, error: serviceError } = await supabase
        .from('services')
        .select(`
            *,
            organizer:organizers (
                id,
                name,
                business_name,
                created_at
            )
        `)
        .eq('id', params.id)
        .single();

    if (serviceError || !service) {
        console.error("Error fetching service:", serviceError);
        notFound();
    }

    // Fetch Pricing Config
    // Fetch Pricing Config
    let pricingConfig = null;

    if (service.pricing_configuration_id) {
        const { data, error } = await supabase
            .from('pricing_configurations')
            .select('*')
            .eq('id', service.pricing_configuration_id)
            .single();

        if (!error) {
            pricingConfig = data;
        } else {
            console.error("Error fetching pricing config:", error);
        }
    }

    // If no pricing config, we might still render the page but with limited functionality
    // or we could treat it as a basic service. 
    // For now, pass basic empty config if missing.

    return (
        <ServiceDetailClient
            service={service as any} // Cast because logic implies join might be complex or loose type 
            pricingConfig={pricingConfig as PricingConfiguration | null}
        />
    );
}
