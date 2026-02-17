
import React, { useState, useEffect } from "react";
import { Service, Booking, PricingConfiguration } from "@/lib/database.types";
import { ConfigStep, SelectionState } from "@/types/pricing";
import { evaluatePrice, isStepVisible } from "@/lib/pricing/pricing-engine";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ArrowRight, Check, CheckCircle2 } from "lucide-react";

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
                {(config.steps as ConfigStep[]).map(step => {
                    // IMPLEMENTED VISIBILITY LOGIC
                    const isVisible = isStepVisible(richService as any, step.id, selections);
                    if (!isVisible) return null;

                    return (
                        <div key={step.id} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="flex items-baseline justify-between">
                                <div>
                                    <Label className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        {step.name}
                                        {step.required && <span className="text-red-500 text-xs">*</span>}
                                    </Label>
                                    {step.description && <p className="text-sm text-slate-500 mt-1">{step.description}</p>}
                                </div>
                            </div>

                            {/* Render based on Display Style */}
                            {(() => {
                                const style = step.displayStyle || 'card-standard';

                                // GRID LAYOUTS
                                if (style.startsWith('card-')) {
                                    let gridCols = "grid-cols-1 md:grid-cols-2";
                                    if (style === 'card-image') gridCols = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
                                    if (style === 'card-color' || style === 'card-color-pill') gridCols = "flex flex-wrap gap-3";
                                    if (style === 'card-compact') gridCols = "grid-cols-2 md:grid-cols-3";

                                    return (
                                        <div className={style.includes('color') ? "flex flex-wrap gap-3" : `grid ${gridCols} gap-4`}>
                                            {step.options.map(option => {
                                                const isSelected = (selections[step.id] || []).includes(option.id);

                                                // 1. IMAGE CARD
                                                if (style === 'card-image') return (
                                                    <div
                                                        key={option.id}
                                                        onClick={() => handleSelectionChange(step.id, option.id, step.selectionType)}
                                                        className={`
                                                            group relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-300
                                                            ${isSelected ? 'border-primary ring-2 ring-primary/20 transform scale-[1.02]' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'}
                                                        `}
                                                    >
                                                        <div className="aspect-video w-full bg-slate-100 relative">
                                                            {option.image ? (
                                                                <img src={option.image} alt={option.label} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                                                                    <span className="text-xs">No Image</span>
                                                                </div>
                                                            )}
                                                            {isSelected && (
                                                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[1px]">
                                                                    <div className="bg-white rounded-full p-1.5 shadow-sm">
                                                                        <Check className="w-5 h-5 text-primary" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="p-3 bg-white">
                                                            <div className="font-semibold text-sm text-slate-900 mb-0.5">{option.label}</div>
                                                            {!isQuoteMode && (
                                                                <div className="text-xs font-bold text-primary">
                                                                    {option.baseDelta > 0 ? `+$${option.baseDelta}` : 'Included'}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );

                                                // 2. COLOR CIRCLE
                                                if (style === 'card-color') return (
                                                    <div
                                                        key={option.id}
                                                        onClick={() => handleSelectionChange(step.id, option.id, step.selectionType)}
                                                        className={`
                                                            relative w-12 h-12 rounded-full cursor-pointer transition-transform hover:scale-110 shadow-sm
                                                            ${isSelected ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'ring-1 ring-slate-200'}
                                                        `}
                                                        style={{ backgroundColor: option.colorHex || '#eee' }}
                                                        title={`${option.label} ${!isQuoteMode && option.baseDelta > 0 ? `(+$${option.baseDelta})` : ''}`}
                                                    >
                                                        {isSelected && <Check className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow-md" />}
                                                    </div>
                                                );

                                                // 3. COLOR PILL
                                                if (style === 'card-color-pill') return (
                                                    <div
                                                        key={option.id}
                                                        onClick={() => handleSelectionChange(step.id, option.id, step.selectionType)}
                                                        className={`
                                                            flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-all
                                                            ${isSelected ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 hover:border-slate-300 text-slate-700'}
                                                        `}
                                                    >
                                                        <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: option.colorHex || '#eee' }} />
                                                        <span className="text-sm font-medium">{option.label}</span>
                                                    </div>
                                                );

                                                // 4. STANDARD & COMPACT CARDS
                                                return (
                                                    <div
                                                        key={option.id}
                                                        onClick={() => {
                                                            if (step.selectionType === 'quantity') return;
                                                            handleSelectionChange(step.id, option.id, step.selectionType);
                                                        }}
                                                        className={`
                                                            relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between
                                                            ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}
                                                            ${style === 'card-compact' ? 'min-h-[80px]' : 'min-h-[120px]'}
                                                        `}
                                                    >
                                                        <div>
                                                            <div className="flex justify-between items-start mb-2 gap-2">
                                                                <span className="font-bold text-slate-900 text-sm leading-tight">{option.label}</span>
                                                                {isSelected && step.selectionType !== 'quantity' && <div className="bg-primary text-white rounded-full p-0.5"><Check className="w-3 h-3" /></div>}
                                                            </div>
                                                            {style !== 'card-compact' && option.description && (
                                                                <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{option.description}</p>
                                                            )}
                                                        </div>

                                                        <div className="mt-auto flex items-center justify-between">
                                                            {!isQuoteMode && (
                                                                <span className="font-bold text-primary text-sm">
                                                                    {option.baseDelta > 0 ? `+$${option.baseDelta}` : (option.baseDelta < 0 ? `-$${Math.abs(option.baseDelta)}` : 'Free')}
                                                                </span>
                                                            )}

                                                            {/* Quantity Control Inside Card */}
                                                            {step.selectionType === 'quantity' && (
                                                                <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1" onClick={e => e.stopPropagation()}>
                                                                    <button
                                                                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 border border-transparent hover:border-slate-200"
                                                                        onClick={() => handleSelectionChange(step.id, option.id, 'quantity', Math.max(0, (stepQuantities[step.id] || 0) - 1))}
                                                                    >
                                                                        -
                                                                    </button>
                                                                    <span className="w-4 text-center text-sm font-semibold">{stepQuantities[step.id] || 0}</span>
                                                                    <button
                                                                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 border border-transparent hover:border-slate-200"
                                                                        onClick={() => handleSelectionChange(step.id, option.id, 'quantity', (stepQuantities[step.id] || 0) + 1)}
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                }

                                // LIST LAYOUTS
                                if (style === 'list-toggle') {
                                    return (
                                        <div className="space-y-2">
                                            {step.options.map(option => {
                                                const isSelected = (selections[step.id] || []).includes(option.id);
                                                return (
                                                    <div
                                                        key={option.id}
                                                        onClick={() => handleSelectionChange(step.id, option.id, step.selectionType)}
                                                        className={`
                                                            flex items-center justify-between p-3.5 rounded-xl border border-l-4 cursor-pointer transition-all hover:shadow-sm
                                                            ${isSelected ? 'border-primary bg-primary/5 border-l-primary' : 'border-slate-200 border-l-transparent hover:border-slate-300 bg-white'}
                                                        `}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary text-white' : 'border-slate-300 text-transparent'}`}>
                                                                <Check className="w-3.5 h-3.5" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className={`font-semibold text-sm ${isSelected ? 'text-primary' : 'text-slate-900'}`}>{option.label}</span>
                                                                {option.description && (
                                                                    <span className="text-xs text-slate-500">{option.description}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {!isQuoteMode && (
                                                            <div className="font-bold text-slate-900 text-sm">
                                                                {option.baseDelta > 0 ? `+$${option.baseDelta}` : 'Free'}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                }

                                // Default Fallback (Standard Card behavior)
                                return (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {step.options.map(option => (
                                            <div key={option.id}>Unknown Style - Use Standard Card</div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                    );
                })}
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
