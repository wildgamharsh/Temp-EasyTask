import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPromoCodesByOrganizer } from "@/lib/supabase-discounts";
import { PromoCodesClient } from "@/components/dashboard/PromoCodesClient";

export default async function PromoCodesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const promoCodes = await getPromoCodesByOrganizer(user.id);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PromoCodesClient promoCodes={promoCodes} />
        </div>
    );
}
