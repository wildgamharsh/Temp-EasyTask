import React, { useState, useMemo } from 'react';
import { Service, SelectionState, QuantityState } from '@/types/pricing';
import { evaluatePrice, isStepVisible } from '@/lib/pricing/pricing-engine';
import { StepSelector } from './StepSelector';
import { PriceBreakdown } from './PriceBreakdown';
import { RefreshCw, CheckCircle, Eye } from 'lucide-react';

interface Props {
    service: Service;
}

export const ConsumerPreview: React.FC<Props> = ({ service }) => {
    const [selections, setSelections] = useState<SelectionState>({});
    const [stepQuantities, setStepQuantities] = useState<QuantityState>({});
    const [quantity, setQuantity] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);



    const handleReset = React.useCallback(() => {
        const defaults: SelectionState = {};
        service.steps.forEach(step => {
            if (step.selectionType === 'fixed') {
                defaults[step.id] = step.options.map(o => o.id);
                return;
            }

            if (step.defaultOptionIds && step.defaultOptionIds.length > 0) {
                const validIds = step.defaultOptionIds.filter(id =>
                    step.options.some(o => o.id === id)
                );

                if (validIds.length > 0) {
                    if (step.selectionType === 'single' || step.selectionType === 'quantity') {
                        defaults[step.id] = [validIds[0]];
                    } else {
                        defaults[step.id] = validIds;
                    }
                }
            } else if (step.selectionType === 'quantity' && step.options.length > 0) {
                defaults[step.id] = [step.options[0].id];
            }
        });
        
        setSelections(defaults);
        setStepQuantities({});
        setQuantity(1);
        setIsSubmitted(false);
    }, [service.steps]);

    React.useEffect(() => {
        handleReset();
    }, [handleReset]);

    const pricingResult = useMemo(() => {
        return evaluatePrice(service, selections, quantity, stepQuantities);
    }, [service, selections, quantity, stepQuantities]);

    const handleSelect = (stepId: string, optionId: string) => {
        const step = service.steps.find(s => s.id === stepId);
        if (!step) return;

        if (step.selectionType === 'fixed') return;

        setSelections(prev => {
            const currentSelected = prev[stepId] || [];

            if (step.selectionType === 'single' || step.selectionType === 'quantity') {
                if (currentSelected.includes(optionId) && !step.required) {
                    return { ...prev, [stepId]: [] };
                }
                return { ...prev, [stepId]: [optionId] };
            } else {
                if (currentSelected.includes(optionId)) {
                    return { ...prev, [stepId]: currentSelected.filter(id => id !== optionId) };
                } else {
                    return { ...prev, [stepId]: [...currentSelected, optionId] };
                }
            }
        });
    };

    const handleQuantityChange = (stepId: string, value: number) => {
        setStepQuantities(prev => ({
            ...prev,
            [stepId]: value
        }));
    };

    const handleBookNow = () => {
        if (pricingResult.isValid) {
            setIsSubmitted(true);
        }
    };

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-green-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                    <div className="relative h-20 w-20 bg-linear-to-br from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xl">
                        <CheckCircle size={40} />
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Configuration Complete!</h2>
                <p className="text-slate-600 max-w-md mb-8 leading-relaxed">
                    The configuration has been successfully validated. In a real app, this would proceed to checkout.
                </p>
                <div className="bg-linear-to-br from-white to-blue-50 border-2 border-blue-200 rounded-2xl p-6 w-full max-w-sm mb-8 shadow-xl">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-semibold">Total Quote</span>
                        <span className="font-bold text-2xl bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            ${pricingResult.totalPrice.toLocaleString()}
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-blue-600 hover:text-blue-800 font-bold underline hover:no-underline transition-all"
                >
                    ← Edit Configuration
                </button>
            </div>
        );
    }

    return (
        <div className="bg-linear-to-br from-slate-50 via-blue-50/30 to-blue-50/30 min-h-full rounded-2xl border-2 border-white shadow-2xl overflow-hidden flex flex-col">
            {/* Premium Header */}
            <div className="bg-white/80 backdrop-blur-md border-b-2 border-blue-100 p-6 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-linear-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
                            <Eye size={20} className="text-white" />
                        </div>
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Preview Mode</span>
                            <p className="text-xs text-slate-500">Configure your perfect package</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start h-full max-w-7xl mx-auto">
                    {/* Left Side: Selections */}
                    <div className="space-y-6 lg:col-span-2">
                        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border-2 border-blue-100 shadow-lg">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">{service.name}</h2>
                            <p className="text-slate-600 text-base mb-6 leading-relaxed">{service.description || 'No description provided.'}</p>

                            {service.steps.length === 0 ? (
                                <p className="text-slate-400 text-center py-12 italic">Add steps in the builder to see them here.</p>
                            ) : (
                                service.steps.sort((a, b) => a.order - b.order).map(step => {
                                    if (!isStepVisible(service, step.id, selections)) return null;

                                    return (
                                        <StepSelector
                                            key={step.id}
                                            service={service}
                                            step={step}
                                            selections={selections}
                                            stepQuantities={stepQuantities}
                                            onSelect={handleSelect}
                                            onQuantityChange={handleQuantityChange}
                                        />
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right Side: Quote */}
                    <div className="lg:col-span-1 sticky top-24 space-y-4">
                        <PriceBreakdown result={pricingResult} quantity={quantity} />
                        <button
                            onClick={handleBookNow}
                            disabled={!pricingResult.isValid}
                            className={`w-full py-4 px-6 rounded-2xl font-bold shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${pricingResult.isValid
                                ? 'bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white hover:scale-[1.02] hover:shadow-2xl'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                            style={pricingResult.isValid ? { boxShadow: '0 10px 30px rgba(0, 102, 255, 0.3)' } : undefined}
                        >
                            <CheckCircle size={20} />
                            Complete Configuration
                        </button>
                        <button
                            onClick={handleReset}
                            className="w-full py-3 text-sm text-slate-500 hover:text-blue-600 flex items-center justify-center gap-2 font-semibold transition-colors hover:bg-blue-50 rounded-xl"
                        >
                            <RefreshCw size={16} /> Reset to Defaults
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
