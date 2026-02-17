"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Check, Minus, Plus, Package, DollarSign, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ServicePricingConfig, ServicePackage, ServiceAddon } from '@/lib/database.types';
import { formatCAD, calculateTax } from '@/lib/canadian-tax';
import { cn } from '@/lib/utils';
import { useBooking } from '@/contexts/BookingContext';
import { getServicePackages, getServiceAddons } from '@/lib/supabase-pricing';

interface Step1Props {
    serviceId: string;
    serviceName: string;
    pricingConfig: ServicePricingConfig;
    organizerId: string;
}

export function Step1CustomizeService({
    serviceId,
    serviceName,
    pricingConfig,
    organizerId,
}: Step1Props) {
    const { state, setPricingSelections, nextStep } = useBooking();
    const { pricing_model, province } = pricingConfig;

    // Local state for selections
    const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
        state.selectedPackageId || pricingConfig.packages?.find(p => p.is_popular)?.id || pricingConfig.packages?.[0]?.id || null
    );
    const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>(state.selectedAddonIds);
    const [guestCount, setGuestCount] = useState(state.guestCount || 50);
    const [packages, setPackages] = useState<ServicePackage[]>(pricingConfig.packages || []);
    const [addons, setAddons] = useState<ServiceAddon[]>([]);



    // Load packages and addons
    useEffect(() => {
        if (pricing_model === 'packages') {
            getServicePackages(serviceId).then(setPackages);
        }
        getServiceAddons(serviceId).then(setAddons);

    }, [serviceId, pricing_model]);

    // Get selected package
    const selectedPackage = packages.find(p => p.id === selectedPackageId);

    // Get available addons based on model
    const getAvailableAddons = useCallback((): ServiceAddon[] => {
        if (pricing_model === 'fixed') {
            return pricingConfig.fixed_addons || addons.filter(a => !a.package_id);
        }
        if (pricing_model === 'packages') {
            const packageAddons = addons.filter(a => a.package_id === selectedPackageId);
            const globalAddons = addons.filter(a => !a.package_id);
            return [...packageAddons, ...globalAddons];
        }
        if (pricing_model === 'per_person') {
            return pricingConfig.fixed_addons || addons.filter(a => !a.package_id);
        }
        return [];
    }, [pricing_model, pricingConfig, selectedPackageId, addons]);

    const availableAddons = getAvailableAddons().filter(a => a.is_active !== false);

    // Calculate price based on model
    const calculatePrice = useCallback(() => {
        let subtotal = 0;

        if (pricing_model === 'fixed') {
            subtotal = pricingConfig.base_price;
        } else if (pricing_model === 'packages' && selectedPackage) {
            subtotal = selectedPackage.price;
        } else if (pricing_model === 'per_person') {
            const basePrice = pricingConfig.per_person_base_price || pricingConfig.base_price;
            let pricePerPerson = basePrice;

            if (pricingConfig.volume_tiers && pricingConfig.volume_tiers.length > 0) {
                const sortedTiers = [...pricingConfig.volume_tiers].sort((a, b) => b.min_guests - a.min_guests);
                const applicableTier = sortedTiers.find(t => guestCount >= t.min_guests);
                if (applicableTier) {
                    pricePerPerson = applicableTier.price_per_person;
                }
            }

            subtotal = pricePerPerson * guestCount;

            if (pricingConfig.fixed_fees) {
                pricingConfig.fixed_fees.filter(f => f.is_active !== false).forEach(fee => {
                    subtotal += fee.price;
                });
            }
        }

        // Add selected addons
        selectedAddonIds.forEach(addonId => {
            const addon = availableAddons.find(a => a.id === addonId);
            if (addon) {
                subtotal += addon.price;
            }
        });

        // Calculate tax
        const taxInfo = province ? calculateTax(subtotal, province) : { taxAmount: 0, total: subtotal };

        return {
            subtotal,
            taxAmount: taxInfo.taxAmount,
            total: taxInfo.total
        };
    }, [pricing_model, pricingConfig, selectedPackage, guestCount, selectedAddonIds, availableAddons, province]);

    const { subtotal, taxAmount, total } = calculatePrice();

    // Toggle addon
    const toggleAddon = (addonId: string) => {
        setSelectedAddonIds(prev =>
            prev.includes(addonId)
                ? prev.filter(id => id !== addonId)
                : [...prev, addonId]
        );
    };

    // Handle continue
    const handleContinue = () => {
        setPricingSelections({
            pricingModel: pricing_model,
            selectedPackageId,
            selectedPackage: selectedPackage || null,
            selectedAddonIds,
            selectedAddons: availableAddons.filter(a => selectedAddonIds.includes(a.id)),
            guestCount,
            subtotal,
            taxAmount,
            total,
        });
        nextStep();
    };

    // Get applicable volume tier
    const getApplicableVolumeTier = () => {
        if (!pricingConfig.volume_tiers || pricingConfig.volume_tiers.length === 0) return null;
        const sortedTiers = [...pricingConfig.volume_tiers].sort((a, b) => b.min_guests - a.min_guests);
        return sortedTiers.find(t => guestCount >= t.min_guests);
    };

    const applicableTier = getApplicableVolumeTier();
    const basePerPerson = pricingConfig.per_person_base_price || pricingConfig.base_price;
    const savingsPercent = applicableTier
        ? Math.round(((basePerPerson - applicableTier.price_per_person) / basePerPerson) * 100)
        : 0;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Customize Your Service</h3>
                <p className="text-gray-600">Select your preferred options and add-ons</p>
            </div>

            <Card className="border-2 border-pink-100 bg-white">
                <CardContent className="pt-6 space-y-6">
                    {/* Fixed Price Model */}
                    {pricing_model === 'fixed' && (
                        <div className="p-4 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100/50 border border-pink-200">
                            <p className="text-sm text-gray-600 mb-1">Service Price</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-gray-900">
                                    {formatCAD(pricingConfig.base_price)}
                                </span>
                                <span className="text-gray-500">fixed</span>
                            </div>
                        </div>
                    )}

                    {/* Packages Model */}
                    {pricing_model === 'packages' && packages.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-gray-700">Select Package</p>
                            <div className="space-y-2">
                                {packages
                                    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                                    .map(pkg => (
                                        <button
                                            key={pkg.id}
                                            onClick={() => {
                                                setSelectedPackageId(pkg.id);
                                                setSelectedAddonIds([]);
                                            }}
                                            className={cn(
                                                "w-full p-4 rounded-xl border-2 text-left transition-all",
                                                selectedPackageId === pkg.id
                                                    ? "border-pink-500 bg-pink-50 ring-2 ring-pink-200"
                                                    : "border-gray-200 hover:border-pink-300"
                                            )}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-gray-900">{pkg.name}</span>
                                                        {pkg.is_popular && (
                                                            <Badge className="bg-pink-500 text-white text-xs px-2 py-0">
                                                                <Sparkles className="w-3 h-3 mr-1" />
                                                                Popular
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {pkg.description && (
                                                        <p className="text-sm text-gray-600 line-clamp-1">{pkg.description}</p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-lg font-bold text-gray-900">{formatCAD(pkg.price)}</span>
                                                </div>
                                            </div>
                                            {selectedPackageId === pkg.id && pkg.features && pkg.features.length > 0 && (
                                                <div className="mt-3 pt-3 border-t">
                                                    <ul className="space-y-1">
                                                        {pkg.features.slice(0, 4).map((feature, idx) => (
                                                            <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                                                <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                                                                <span>{feature}</span>
                                                            </li>
                                                        ))}
                                                        {pkg.features.length > 4 && (
                                                            <li className="text-xs text-gray-500 pl-5">
                                                                +{pkg.features.length - 4} more features
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                            </div>
                        </div>
                    )}



                    {/* Per Person Model */}
                    {pricing_model === 'per_person' && (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100/50 border border-pink-200">
                                <p className="text-sm text-gray-600 mb-2">Number of Guests</p>
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => setGuestCount(Math.max(1, guestCount - 10))}
                                        className="w-10 h-10 rounded-lg border-2 border-pink-300 flex items-center justify-center hover:border-pink-500 transition-colors"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <div className="text-center">
                                        <input
                                            type="number"
                                            value={guestCount}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value) || 1;
                                                setGuestCount(Math.min(500, Math.max(1, val)));
                                            }}
                                            className="w-20 text-center text-2xl font-bold border-0 bg-transparent focus:outline-none"
                                        />
                                        <p className="text-xs text-gray-500">guests</p>
                                    </div>
                                    <button
                                        onClick={() => setGuestCount(Math.min(500, guestCount + 10))}
                                        className="w-10 h-10 rounded-lg border-2 border-pink-300 flex items-center justify-center hover:border-pink-500 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                {applicableTier && savingsPercent > 0 && (
                                    <div className="mt-3 p-2 rounded-lg bg-green-50 border border-green-200">
                                        <p className="text-sm text-green-700 font-medium flex items-center gap-1">
                                            <DollarSign className="w-4 h-4" />
                                            Volume discount: {formatCAD(applicableTier.price_per_person)}/person (Save {savingsPercent}%)
                                        </p>
                                    </div>
                                )}
                            </div>

                            {pricingConfig.fixed_fees && pricingConfig.fixed_fees.filter(f => f.is_active !== false).length > 0 && (
                                <div className="text-sm text-gray-600">
                                    <p className="font-medium mb-1">Includes:</p>
                                    {pricingConfig.fixed_fees.filter(f => f.is_active !== false).map(fee => (
                                        <div key={fee.id} className="flex justify-between">
                                            <span>{fee.name}</span>
                                            <span>{formatCAD(fee.price)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Add-ons Section */}
                    {availableAddons.length > 0 && (
                        <div className="space-y-3">
                            <Separator />
                            <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                Optional Add-ons
                            </p>
                            <div className="space-y-2">
                                {availableAddons.map(addon => (
                                    <button
                                        key={addon.id}
                                        onClick={() => toggleAddon(addon.id)}
                                        className={cn(
                                            "w-full p-3 rounded-lg border-2 text-left transition-all flex items-center justify-between",
                                            selectedAddonIds.includes(addon.id)
                                                ? "border-pink-500 bg-pink-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                                                selectedAddonIds.includes(addon.id)
                                                    ? "bg-pink-500 border-pink-500"
                                                    : "border-gray-300"
                                            )}>
                                                {selectedAddonIds.includes(addon.id) && (
                                                    <Check className="w-3 h-3 text-white" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{addon.name}</p>
                                                {addon.description && (
                                                    <p className="text-xs text-gray-500 line-clamp-1">{addon.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <span className="font-semibold text-gray-900">+{formatCAD(addon.price)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Price Summary */}
                    <div className="space-y-2 pt-4 border-t">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span>{formatCAD(subtotal)}</span>
                        </div>
                        {province && taxAmount > 0 && (
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Tax ({province})</span>
                                <span>{formatCAD(taxAmount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold text-gray-900 pt-2">
                            <span>Total</span>
                            <span className="text-pink-600">{formatCAD(total)}</span>
                        </div>
                    </div>

                    {/* Continue Button */}
                    <Button
                        onClick={handleContinue}
                        className="w-full h-12 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all bg-pink-500 hover:bg-pink-600"
                    >
                        Continue to Event Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
