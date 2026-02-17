import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ServicePricingConfig, TaxRate, Service, serviceToLegacy } from "@/lib/database.types";
import { formatCAD, calculateTaxFromRates } from "@/lib/canadian-tax";
import { ServiceCard } from "@/components/marketplace/ServiceCard";
import { Info } from "lucide-react";

interface PricingPreviewProps {
    config: ServicePricingConfig;
    serviceName: string;
    guestCount: number;
    taxRates: TaxRate[];
    onGuestCountChange: (count: number) => void;
    images?: string[];
    description?: string;
    features?: string[];
}

export function PricingPreview({
    config,
    serviceName,
    guestCount,
    taxRates,
    onGuestCountChange,
    images = [],
    description = "",
    features = [],
}: PricingPreviewProps) {
    // Calculate preview totals based on pricing model
    const calculatePreview = () => {
        let subtotal = 0;
        let breakdown: { label: string; amount: number }[] = [];

        switch (config.pricing_model) {
            case "fixed":
                subtotal = config.base_price || 0;
                breakdown.push({ label: "Base Price", amount: config.base_price || 0 });
                break;

            case "packages":
                if (config.packages && config.packages.length > 0) {
                    // Show first package as example
                    const pkg = config.packages[0];
                    subtotal = pkg.price;
                    breakdown.push({ label: pkg.name || "Package", amount: pkg.price });
                }
                break;

            case "per_person":
                const basePrice = config.per_person_base_price ?? config.base_price ?? 0;
                let pricePerPerson = basePrice;
                let appliedTierName = "";

                // Check volume tiers
                if (config.has_volume_discounts && config.volume_tiers && config.volume_tiers.length > 0) {
                    const sortedTiers = [...config.volume_tiers].sort(
                        (a, b) => b.min_guests - a.min_guests
                    );
                    for (const tier of sortedTiers) {
                        if (guestCount >= tier.min_guests) {
                            pricePerPerson = tier.price_per_person;
                            appliedTierName = `${tier.min_guests}+ guests rate`;
                            break;
                        }
                    }
                }

                const guestTotal = pricePerPerson * guestCount;
                breakdown.push({
                    label: `${guestCount} guests × ${formatCAD(pricePerPerson)}`,
                    amount: guestTotal,
                });

                if (appliedTierName) {
                    breakdown.push({ label: `(${appliedTierName})`, amount: 0 });
                }

                // Add fixed fees
                let feesTotal = 0;
                if (config.fixed_fees && config.fixed_fees.length > 0) {
                    for (const fee of config.fixed_fees) {
                        feesTotal += fee.price;
                        breakdown.push({ label: fee.name || "Fee", amount: fee.price });
                    }
                }

                subtotal = guestTotal + feesTotal;
                break;
        }

        // Calculate tax if province is set
        let taxAmount = 0;
        let total = subtotal;
        let taxRate = 0;
        let taxName = "";

        if (config.province) {
            const relevantRate = taxRates.find(r => r.name === config.province || r.province === config.province);
            if (relevantRate) {
                const taxResult = calculateTaxFromRates(subtotal, relevantRate);
                taxAmount = taxResult.total;
                total = subtotal + taxAmount;
                taxRate = taxResult.rate;
                taxName = relevantRate.name;
            }
        }

        return { subtotal, taxAmount, total, taxRate, taxName, breakdown };
    };

    const preview = calculatePreview();

    // Map to Service object for ServiceCard
    const previewService: Service = {
        id: "preview-id",
        organizer_id: "preview-org",
        title: serviceName || "Your Service Title",
        description: description || "Service description will appear here...",
        base_price: config.base_price || 0,
        pricing_type: config.pricing_model === "per_person" ? "per_person" : "fixed",
        pricing_model: config.pricing_model || "fixed",
        images: images.length > 0 ? images : [],
        features: features,
        rating: 4.8,
        reviews: 12,
        is_active: true,
        created_at: new Date().toISOString(),
        province: config.province,
        min_guests: 1,
        max_guests: config.max_guests,
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    Marketplace Preview
                </Label>
                <div className="pointer-events-none scale-[0.9] origin-top">
                    <ServiceCard service={serviceToLegacy(previewService)} organizerName="You (Preview)" />
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                    This is how your service will appear in the marketplace.
                </p>
            </div>

            <Card className="overflow-hidden border-primary/20 bg-primary/5">
                <CardHeader className="py-4 px-6 border-b bg-white/50">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center justify-between">
                        Price Breakdown
                        <span className="text-[10px] font-normal text-muted-foreground lowercase">organizer view</span>
                    </CardTitle>
                </CardHeader>

                <div className="p-6">
                    {/* Empty State - No Province */}
                    {!config.province ? (
                        <div className="text-center py-8">
                            <div className="bg-amber-100 dark:bg-amber-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-500">
                                <svg
                                    className="h-8 w-8"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                            <p className="font-medium">Select a Province</p>
                            <p className="text-muted-foreground text-sm mt-1">
                                To see tax calculations.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Fixed Price Preview */}
                            {config.pricing_model === "fixed" && (
                                <div>
                                    <div className="text-center mb-6">
                                        <div className="text-4xl font-bold">
                                            {formatCAD(preview.total)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Estimated Total
                                        </div>
                                    </div>

                                    <div className="space-y-2 border-t pt-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Base Price</span>
                                            <span className="font-medium">
                                                {formatCAD(config.base_price)}
                                            </span>
                                        </div>
                                        {config.fixed_addons?.map((addon) => (
                                            <div
                                                key={addon.id}
                                                className="flex justify-between text-sm"
                                            >
                                                <span className="text-muted-foreground">
                                                    + {addon.name}
                                                </span>
                                                <span className="font-medium">
                                                    {formatCAD(addon.price)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Tax Breakdown */}
                                    <div className="mt-6 bg-muted/50 p-4 rounded-lg text-sm space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">
                                                Subtotal (Tax Excl.)
                                            </span>
                                            <span className="font-semibold">
                                                {formatCAD(preview.subtotal)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-primary">
                                            <span>
                                                Tax ({(preview.taxRate * 100).toFixed(2)}%)
                                            </span>
                                            <span className="font-semibold">
                                                + {formatCAD(preview.taxAmount)}
                                            </span>
                                        </div>
                                        <div className="border-t pt-2 flex justify-between items-center text-lg">
                                            <span className="font-bold">Total</span>
                                            <span className="font-bold">
                                                {formatCAD(preview.total)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Packages Preview */}
                            {config.pricing_model === "packages" && (
                                <div>
                                    {!config.packages || config.packages.length === 0 ? (
                                        <div className="text-center py-4 text-muted-foreground text-sm">
                                            Add packages to see preview.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {config.packages.map((pkg) => {
                                                const relevantRate = taxRates.find(r => r.name === config.province || r.province === config.province);
                                                const pkgTax = relevantRate
                                                    ? calculateTaxFromRates(pkg.price, relevantRate)
                                                    : { total: pkg.price };
                                                return (
                                                    <div
                                                        key={pkg.id}
                                                        className="border rounded-lg overflow-hidden bg-white"
                                                    >
                                                        <div className="bg-muted/30 p-3 border-b flex justify-between items-center">
                                                            <span className="font-bold flex items-center gap-2">
                                                                {pkg.name || "Unnamed Package"}
                                                                {pkg.is_popular && (
                                                                    <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded">
                                                                        Popular
                                                                    </span>
                                                                )}
                                                            </span>
                                                            <span className="text-primary font-bold">
                                                                {formatCAD(pkgTax.total)}
                                                            </span>
                                                        </div>
                                                        <div className="p-3 text-xs space-y-1 text-muted-foreground">
                                                            {pkg.description && (
                                                                <p>{pkg.description}</p>
                                                            )}
                                                            {pkg.features.length > 0 && (
                                                                <ul className="list-disc list-inside space-y-1">
                                                                    {pkg.features
                                                                        .filter((f) => f.trim())
                                                                        .map((feat, i) => (
                                                                            <li key={i}>{feat}</li>
                                                                        ))}
                                                                </ul>
                                                            )}
                                                            {pkg.addons && pkg.addons.length > 0 && (
                                                                <div className="mt-2 pt-2 border-t">
                                                                    <span className="font-semibold">
                                                                        Add-ons available
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Per Person Preview */}
                            {config.pricing_model === "per_person" && (
                                <div>
                                    <div className="text-center mb-6">
                                        <div className="text-sm text-muted-foreground">
                                            Starting at
                                        </div>
                                        <div className="text-3xl font-bold">
                                            {formatCAD(config.per_person_base_price ?? config.base_price ?? 0)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            per person
                                        </div>
                                    </div>

                                    {/* Guest Count Input */}
                                    <div className="mb-4">
                                        <Label className="text-xs text-muted-foreground mb-1 block">
                                            Preview with guests:
                                        </Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={guestCount}
                                            onChange={(e) =>
                                                onGuestCountChange(parseInt(e.target.value) || 1)
                                            }
                                            className="w-24 h-8"
                                        />
                                    </div>

                                    {/* Fixed Fees */}
                                    {config.fixed_fees && config.fixed_fees.length > 0 && (
                                        <div className="mb-4 p-3 bg-white rounded border">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">
                                                Fixed Fees Included
                                            </p>
                                            {config.fixed_fees.map((fee) => (
                                                <div
                                                    key={fee.id}
                                                    className="flex justify-between text-[10px] mb-1"
                                                >
                                                    <span>{fee.name}</span>
                                                    <span>{formatCAD(fee.price)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Volume Discount Table */}
                                    {config.has_volume_discounts &&
                                        config.volume_tiers &&
                                        config.volume_tiers.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">
                                                    Volume Pricing
                                                </h4>
                                                <table className="w-full text-xs">
                                                    <thead className="bg-muted/50">
                                                        <tr>
                                                            <th className="p-2 text-left rounded-l">
                                                                Guests
                                                            </th>
                                                            <th className="p-2 text-right rounded-r">
                                                                Price/Person
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y">
                                                        <tr>
                                                            <td className="p-2">
                                                                1 -{" "}
                                                                {(config.volume_tiers[0]?.min_guests || 1) - 1}
                                                            </td>
                                                            <td className="p-2 text-right font-medium">
                                                                {formatCAD(
                                                                    config.per_person_base_price ??
                                                                    config.base_price ??
                                                                    0
                                                                )}
                                                            </td>
                                                        </tr>
                                                        {config.volume_tiers
                                                            .sort((a, b) => a.min_guests - b.min_guests)
                                                            .map((tier, idx) => (
                                                                <tr key={tier.id}>
                                                                    <td className="p-2">
                                                                        {tier.min_guests}
                                                                        {idx <
                                                                            config.volume_tiers!.length - 1
                                                                            ? ` - ${config.volume_tiers![
                                                                                idx + 1
                                                                            ].min_guests - 1
                                                                            }`
                                                                            : "+"}
                                                                    </td>
                                                                    <td className="p-2 text-right font-medium text-primary">
                                                                        {formatCAD(tier.price_per_person)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                    {/* Tax Note */}
                                    <div className="mt-4 text-xs text-center text-muted-foreground italic">
                                        * Final price subject to {config.province} taxes (
                                        {preview.taxName})
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
}

export default PricingPreview;
