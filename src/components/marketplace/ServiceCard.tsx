"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LegacyService as Service } from "@/lib/database.types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Check, Plus } from "lucide-react";
import { DiscountBadge } from "@/components/discount/DiscountBadge";
import { Discount, getBestDiscount, calculateDiscount } from "@/lib/discount-engine";
import { getServiceDiscounts } from "@/lib/supabase-data";

interface ServiceCardProps {
    service: Service;
    organizerName?: string;
    subdomain?: string;
    hideRating?: boolean;
    showPricing?: boolean;
}

export function ServiceCard({ service, organizerName, subdomain, hideRating, showPricing = true }: ServiceCardProps) {
    const [bestDiscount, setBestDiscount] = useState<Discount | null>(null);
    const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);

    // Fetch applicable discounts
    useEffect(() => {
        async function fetchDiscounts() {
            const discounts = await getServiceDiscounts(service.id, service.organizerId);
            const base = service.min_price || 0;
            if (discounts.length > 0 && base > 0) {
                const best = getBestDiscount(discounts, base, 1);
                if (best) {
                    setBestDiscount(best);
                    const calc = calculateDiscount(base, best, 1);
                    setDiscountedPrice(calc.finalPrice);
                }
            }
        }
        fetchDiscounts();
    }, [service.id, service.organizerId, service.min_price]);

    // Determine pricing display string
    const getPricingDisplay = () => {
        if (!showPricing) {
            return (
                <div className="flex flex-col">
                    <span className="text-lg font-bold text-primary">Quote Request</span>
                    <span className="text-xs text-muted-foreground">Price upon request</span>
                </div>
            )
        }

        const base = service.min_price || 0;
        const currentPrice = discountedPrice !== null ? discountedPrice : base;

        return (
            <div className="flex flex-col">
                {discountedPrice !== null && (
                    <span className="text-sm text-muted-foreground line-through">${base.toLocaleString()}</span>
                )}
                <span className="text-lg font-bold text-primary">Starting from ${currentPrice.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">Dynamic Pricing</span>
            </div>
        );
    };

    const modelBadge = {
        "fixed": "Fixed Price",
        "packages": "Packages",
        "per_person": "Per Person"
    }[service.pricing_model || "fixed"];

    // Always link to the marketplace service detail page to isolate from storefront
    // FIX: If subdomain is provided, link to the storefront service detail page to maintain context
    const detailsHref = subdomain
        ? `/storefront/${subdomain}/services/${service.id}`
        : `/services/${service.id}`;

    return (
        <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-slate-200 flex flex-col h-full bg-white p-0">
            {/* Image Header */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                {service.images && service.images.length > 0 ? (
                    <img
                        src={service.images[0]}
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-300">
                        <i className="fa-regular fa-image text-4xl"></i>
                    </div>
                )}
                {/* Discount Badge */}
                {bestDiscount && (
                    <div className="absolute top-3 left-3 z-10">
                        <DiscountBadge discount={bestDiscount} variant="compact" />
                    </div>
                )}
            </div>

            <CardContent className="p-4 pt-3 pb-2">
                {!hideRating && service.rating > 0 && (
                    <div className="flex items-center justify-end mb-1">
                        <div className="flex items-center text-amber-400 text-xs font-bold">
                            <Star className="w-3 h-3 fill-current mr-1" />
                            {service.rating.toFixed(1)} ({service.reviews})
                        </div>
                    </div>
                )}

                <h3 className="font-bold text-lg text-slate-900 mb-2 leading-tight group-hover:text-primary transition-colors">
                    <Link href={detailsHref} className="hover:underline focus:outline-none">
                        {service.title}
                    </Link>
                </h3>

                <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                    {service.description}
                </p>

            </CardContent>

            <CardFooter className="p-5 pt-0 border-t-0 flex items-center justify-between">
                <div>
                    {getPricingDisplay()}
                </div>
                <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 shadow-sm shadow-primary/20">
                    <Link href={detailsHref}>
                        {showPricing ? "Book Now" : "Get a Quote"}
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
