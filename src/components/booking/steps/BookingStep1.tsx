"use client";

import { useState, useEffect } from "react";
import { Service, Booking } from "@/lib/database.types";
import { LegacyService, LegacyBooking } from "@/lib/supabase-data";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface BookingStepProps {
    service: LegacyService;
    bookingData: Partial<LegacyBooking>;
    onNext: (data: Partial<LegacyBooking>) => void;
    onBack?: () => void;
    onClose?: () => void;
}

export function BookingStep1({ service, bookingData, onNext }: BookingStepProps) {
    // Legacy support casting
    const s = service as any;
    const b = bookingData as any;

    // Local state for selections
    const [selectedPackageId, setSelectedPackageId] = useState<string>(b.selected_package_id || "");
    const [selectedAddons, setSelectedAddons] = useState<string[]>(b.selected_addon_ids || []);
    const [guestCount, setGuestCount] = useState<number>(b.guest_count || s.minGuests || 1);

    // Derived Costs
    const [subtotal, setSubtotal] = useState(0);

    useEffect(() => {
        calculateTotal();
    }, [selectedPackageId, selectedAddons, guestCount]);

    const calculateTotal = () => {
        let total = 0;

        if (s.pricing_model === "fixed") {
            total += s.base_price;
        } else if (s.pricing_model === "packages") {
            const pkg = s.packages?.find((p: any) => p.id === selectedPackageId);
            if (pkg) total += pkg.price;
        } else if (s.pricing_model === "per_person") {
            // Basic per person calc
            const ppPrice = s.base_price; // Assuming base_price holds pp info for now
            total += ppPrice * guestCount;
        }

        // Add-ons
        // Flatten all addons (global + package specific if any)
        const allAddons = [...(s.addons || [])];
        // Note: Package specific addons usually come with the package, here assuming simple list

        selectedAddons.forEach(id => {
            const addon = allAddons.find((a: any) => a.id === id);
            if (addon) total += addon.price;
        });

        setSubtotal(total);
    };

    const handleNextStep = () => {
        onNext({
            selected_package_id: selectedPackageId,
            selected_addon_ids: selectedAddons,
            guest_count: guestCount,
            total_price: subtotal, // This is tentative, final calc happens at review
            // pricing breakdown should be constructed here ideally
        } as any);
    };

    const isValid = () => {
        if (service.pricing_model === "packages" && !selectedPackageId) return false;
        if (service.pricing_model === "per_person" && guestCount < (service.minGuests || 1)) return false;
        return true;
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">Customize Your Service</h3>
                <p className="text-sm text-slate-500">Select options to customize your booking.</p>
            </div>

            {/* Packages Selection */}
            {s.pricing_model === "packages" && s.packages && (
                <div className="space-y-4">
                    <Label className="text-base">Select a Package</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {s.packages.map((pkg: any) => (
                            <div key={pkg.id}>
                                <input
                                    type="radio"
                                    name="package"
                                    id={pkg.id}
                                    value={pkg.id}
                                    checked={selectedPackageId === pkg.id}
                                    onChange={(e) => setSelectedPackageId(e.target.value)}
                                    className="peer sr-only"
                                />
                                <Label
                                    htmlFor={pkg.id}
                                    className="flex flex-col h-full p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-brand-200 peer-checked:border-brand-600 peer-checked:bg-brand-50"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-slate-900">{pkg.name}</span>
                                        <span className="font-bold text-brand-600">${pkg.price}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-4 flex-1">{pkg.description}</p>
                                    <ul className="text-xs space-y-1">
                                        {pkg.features.slice(0, 3).map((f: string, i: number) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <i className="fa-solid fa-check text-green-500 text-[10px]"></i>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            )}


            {/* Guest Count (Per Person) */}
            {s.pricing_model === "per_person" && (
                <div className="space-y-4">
                    <Label className="text-base">Guest Count</Label>
                    <div className="flex items-center gap-4 max-w-xs">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setGuestCount(Math.max((s.minGuests || 1), guestCount - 1))}
                            disabled={guestCount <= (s.minGuests || 1)}
                        >
                            -
                        </Button>
                        <Input
                            type="number"
                            value={guestCount}
                            onChange={(e) => setGuestCount(parseInt(e.target.value) || 0)}
                            className="text-center font-bold"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setGuestCount(guestCount + 1)}
                            disabled={!!s.maxGuests && guestCount >= s.maxGuests}
                        >
                            +
                        </Button>
                    </div>
                    <p className="text-xs text-slate-500">
                        ${s.basePrice} per person. Min: {s.minGuests || 1}
                    </p>
                </div>
            )}

            {/* Add-ons */}
            {s.addons && s.addons.length > 0 && (
                <div className="space-y-4">
                    <Label className="text-base">Add-ons</Label>
                    <div className="space-y-3">
                        {s.addons.map((addon: any) => (
                            <div key={addon.id} className="flex items-start space-x-3 p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                                <Checkbox
                                    id={addon.id}
                                    checked={selectedAddons.includes(addon.id)}
                                    onCheckedChange={(checked) => {
                                        if (checked) setSelectedAddons([...selectedAddons, addon.id]);
                                        else setSelectedAddons(selectedAddons.filter(id => id !== addon.id));
                                    }}
                                />
                                <div className="grid gap-1.5 leading-none flex-1">
                                    <label
                                        htmlFor={addon.id}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {addon.name}
                                    </label>
                                    <p className="text-xs text-muted-foreground">
                                        {addon.description}
                                    </p>
                                </div>
                                <div className="font-semibold text-sm">
                                    +${addon.price}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Separator className="my-6" />

            <div className="flex items-center justify-between">
                <div className="text-left">
                    <p className="text-xs text-slate-500">Estimated Total</p>
                    <p className="text-xl font-bold text-brand-900">${subtotal.toLocaleString()}</p>
                </div>
                <Button onClick={handleNextStep} disabled={!isValid()} className="px-8 bg-brand-600 hover:bg-brand-700">
                    Continue <i className="fa-solid fa-arrow-right ml-2"></i>
                </Button>
            </div>
        </div>
    );
}
