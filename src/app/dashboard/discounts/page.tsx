import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDiscountsByOrganizer } from "@/lib/supabase-discounts";
import { DiscountsClient } from "@/components/dashboard/DiscountsClient";

export default async function DiscountsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const discounts = await getDiscountsByOrganizer(user.id);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <DiscountsClient discounts={discounts} />
        </div>
    );
}
