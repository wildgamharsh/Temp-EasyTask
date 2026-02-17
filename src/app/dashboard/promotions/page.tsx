import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDiscountsByOrganizer, getPromoCodesByOrganizer } from "@/lib/supabase-discounts";
import { DiscountsClient } from "@/components/dashboard/DiscountsClient";
import { PromoCodesClient } from "@/components/dashboard/PromoCodesClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Percent, Ticket } from "lucide-react";

export default async function PromotionsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const [discounts, promoCodes] = await Promise.all([
        getDiscountsByOrganizer(user.id),
        getPromoCodesByOrganizer(user.id)
    ]);

    return (
        <div className="flex-1 space-y-6 p-1 pt-0">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Promotions</h2>
                    <p className="text-muted-foreground">
                        Manage your service discounts and promotional codes.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="discounts" className="space-y-4">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="discounts" className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Discounts
                    </TabsTrigger>
                    <TabsTrigger value="promo-codes" className="flex items-center gap-2">
                        <Ticket className="h-4 w-4" />
                        Promo Codes
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="discounts" className="space-y-4 border-none p-0 outline-none">
                    <Card>
                        <CardHeader>
                            <CardTitle>Automatic Discounts</CardTitle>
                            <CardDescription>
                                Set up discounts that apply automatically based on guest count or other criteria.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <DiscountsClient discounts={discounts} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="promo-codes" className="space-y-4 border-none p-0 outline-none">
                    <Card>
                        <CardHeader>
                            <CardTitle>Promo Codes</CardTitle>
                            <CardDescription>
                                Create custom codes for customers to apply at checkout.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <PromoCodesClient promoCodes={promoCodes} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
