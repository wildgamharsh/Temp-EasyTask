
import React, { useState, useEffect } from "react";
import { Service, Booking, PricingConfiguration } from "@/lib/database.types";
import { ConfigStep, SelectionState } from "@/types/pricing";
import { evaluatePrice, isStepVisible } from "@/lib/pricing/pricing-engine";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ArrowRight, Check, CheckCircle2 } from "lucide-react";
import { SharedPricingDisplay } from "@/components/pricing/SharedPricingDisplay";

interface DynamicBookingFormProps {
    service: Service;
    config: PricingConfiguration;
    bookingData: Partial<Booking>;
    onNext: (data: Partial<Booking>) => void;
    onLiveUpdate?: (data: { subtotal: number; tax: number; total: number }) => void;
    initialSelections?: SelectionState;
    initialStepQuantities?: Record<string, number>;
    initialGlobalQuantity?: number;
    isQuoteMode?: boolean;
}

export function DynamicBookingForm({ service, config, bookingData, onNext, onLiveUpdate, initialSelections, initialStepQuantities, initialGlobalQuantity, isQuoteMode = false }: DynamicBookingFormProps) {
    const [selections, setSelections] = useState<SelectionState>(initialSelections || {});
    const [stepQuantities, setStepQuantities] = useState<Record<string, number>>(initialStepQuantities || {});
    const [globalQuantity, setGlobalQuantity] = useState<number>(initialGlobalQuantity || 1);

    // Engine Results
    const [priceResult, setPriceResult] = useState<any>(null); // Return type of evaluatePrice

    const richService = React.useMemo(() => ({
        id: service.id,
        name: service.title,
        description: service.description,
        pricingMode: (config as any).pricing_mode,
        basePrice: ((config as any).metadata as any)?.basePrice || (service as any).base_price || 0,
        steps: config.steps || [],
        rules: config.rules || []
    }), [service, config]);

    useEffect(() => {
        // Run Pricing Engine
        const result = evaluatePrice(richService as any, selections, globalQuantity, stepQuantities);
        setPriceResult(result);

        if (result.isValid) {
            onLiveUpdate?.({
                subtotal: result.totalPrice,
                tax: 0,
                total: result.totalPrice
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selections, stepQuantities, globalQuantity, service, config]); // Removing onLiveUpdate from dep to be safe, though parent memoized it

    const handleSelectionChange = (stepId: string, optionId: string, type: 'single' | 'multi' | 'quantity' | 'fixed', quantity?: number) => {
        setSelections(prev => {
            const stepSelections = prev[stepId] || [];
            if (type === 'single' || type === 'fixed') {
                return { ...prev, [stepId]: [optionId] };
            } else if (type === 'multi') {
                if (stepSelections.includes(optionId)) {
                    return { ...prev, [stepId]: stepSelections.filter(id => id !== optionId) };
                } else {
                    return { ...prev, [stepId]: [...stepSelections, optionId] };
                }
            } else if (type === 'quantity') {
                return { ...prev, [stepId]: [optionId] };
            }
            return prev;
        });

        if (type === 'quantity' && quantity !== undefined) {
            setStepQuantities(prev => ({ ...prev, [stepId]: quantity }));
        }
    };

    const handleNextStep = () => {
        if (!priceResult?.isValid) return;

        let total = priceResult.totalPrice;

        // CORRECTLY MAP BREAKDOWN FOR STORAGE/DISPLAY
        const breakdown = {
            pricing_model: 'configured',
            base_amount: 0, // Configured services start at 0 base price for calculation
            subtotal: priceResult.totalPrice,
            tax_amount: 0,
            total: total,
            total_amount: total, // Ensure compatibility
            addons: priceResult.breakdown
                .filter((i: any) => !(i.type === 'base' && i.finalPrice === 0))
                .map((i: any) => ({
                    name: i.label,
                    price: i.finalPrice
                })),
            fixed_fees: [],
        };

        onNext({
            service_id: service.id,
            service_name: service.title,
            organizer_id: service.organizer_id,
            subtotal: isQuoteMode ? 0 : priceResult.totalPrice,
            tax_amount: 0,
            total_price: isQuoteMode ? 0 : total,
            pricing_breakdown: breakdown as any,
            // Pass selection state to parent
            selection_state: selections,
            step_quantities: stepQuantities
        });
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-semibold text-slate-900">Customize Service</h3>
                <p className="text-sm text-slate-500">Select your options.</p>
            </div>

            <div className="space-y-8">
                <SharedPricingDisplay
                    steps={(config.steps as ConfigStep[]).filter(step => isStepVisible(richService as any, step.id, selections))}
                    selections={selections}
                    stepQuantities={stepQuantities}
                    onSelectionChange={handleSelectionChange}
                    readonly={false}
                    isQuoteMode={isQuoteMode}
                    showPricing={true}
                    containerClassName="space-y-8"
                />
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h4 className="font-bold mb-4 text-slate-900">Summary</h4>

                {/* Detailed Breakdown */}
                {priceResult?.breakdown && priceResult.breakdown.length > 0 && (
                    <div className="space-y-2 mb-4">
                        {priceResult.breakdown.map((item: any, idx: number) => {
                            if (item.finalPrice === 0 && item.type === 'base') return null;

                            return (
                                <div key={idx} className="flex justify-between text-sm text-slate-600">
                                    <span>{item.label}</span>
                                    {!isQuoteMode && <span className="font-medium text-slate-900">${item.finalPrice.toLocaleString()}</span>}
                                </div>
                            );
                        })}
                        <div className="h-px bg-slate-200 my-2" />
                    </div>
                )}

                <div className="flex justify-between text-lg font-bold text-slate-900">
                    <span>{isQuoteMode ? "Selection Complete" : "Total"}</span>
                    {!isQuoteMode && <span>${priceResult?.totalPrice?.toLocaleString()}</span>}
                </div>
                {priceResult?.errors?.length > 0 && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                        {priceResult.errors.join(', ')}
                    </div>
                )}
            </div>

            <Button
                onClick={handleNextStep}
                disabled={!priceResult?.isValid}
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl"
            >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
    );
}
