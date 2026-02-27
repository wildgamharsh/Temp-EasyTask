import React, { useState, useMemo } from 'react';
import { Service, SelectionState, QuantityState } from '@/types/pricing';
import { evaluatePrice, isStepVisible } from '@/lib/pricing/pricing-engine';
import { StepSelector } from './StepSelector';
import { Receipt, Info, CheckCircle } from 'lucide-react';

interface Props {
    service: Service;
}

export const ConsumerPreview: React.FC<Props> = ({ service }) => {
    const [selections, setSelections] = useState<SelectionState>({});
    const [stepQuantities, setStepQuantities] = useState<QuantityState>({});
    const [quantity, setQuantity] = useState(1);

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

    return (
        <div className="flex h-full w-full bg-slate-50">
            <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-10 lg:p-12 scroll-smooth">
                <div className="max-w-3xl mx-auto space-y-12 pb-20">
                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">{service.name}</h1>
                        <p className="text-slate-500 text-lg">{service.description || 'Configure your service options below.'}</p>
                    </div>

                    {service.steps.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                            <p className="text-slate-400">Add steps in the builder to see them here.</p>
                        </div>
                    ) : (
                        <>
                            {service.steps.sort((a, b) => a.order - b.order).map((step, index) => {
                                if (!isStepVisible(service, step.id, selections)) return null;

                                return (
                                    <StepSelector
                                        key={step.id}
                                        service={service}
                                        step={step}
                                        stepNumber={index + 1}
                                        selections={selections}
                                        stepQuantities={stepQuantities}
                                        onSelect={handleSelect}
                                        onQuantityChange={handleQuantityChange}
                                    />
                                );
                            })}
                        </>
                    )}
                </div>
            </div>

            <aside className="w-[340px] shrink-0 h-full border-l border-slate-200 bg-white">
                <div className="h-full flex flex-col">
                    <div className="p-5 border-b border-slate-100 bg-slate-50">
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Receipt className="text-blue-600" size={18} />
                            Quote Summary
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Real-time estimation</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Service</span>
                            <div className="font-bold text-slate-900 text-sm">{service.name}</div>
                        </div>
                        <div className="h-px bg-slate-100 w-full"></div>
                        <div className="space-y-3">
                            {pricingResult.breakdown.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-start group">
                                    <div className="flex gap-2">
                                        <CheckCircle size={14} className="text-slate-400 mt-0.5" />
                                        <div>
                                            <div className="text-slate-700 font-medium text-sm">{item.label}</div>
                                        </div>
                                    </div>
                                    <div className="text-slate-900 font-bold text-sm">${item.finalPrice.toLocaleString()}</div>
                                </div>
                            ))}
                            {pricingResult.breakdown.length === 0 && (
                                <p className="text-sm text-slate-400 italic">No selections yet</p>
                            )}
                        </div>
                        <div className="h-px bg-slate-100 w-full"></div>
                        {!pricingResult.isValid && (
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
                                <Info size={18} className="text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-blue-800 text-sm font-bold">Review Selections</p>
                                    <p className="text-blue-600 text-xs mt-0.5">Complete all required options to see the final price.</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="mt-auto p-5 bg-slate-50 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-500">Subtotal</span>
                            <span className="text-sm font-medium text-slate-700">${pricingResult.unitPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-500">Quantity</span>
                            <span className="text-sm font-medium text-slate-700">× {quantity}</span>
                        </div>
                        <div className="flex items-end justify-between pt-3 border-t border-slate-200">
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Est.</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-900 tracking-tight">${pricingResult.totalPrice.toLocaleString()}</div>
                        </div>
                        <button
                            disabled={!pricingResult.isValid}
                            className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>Generate Proposal</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>
        </div>
    );
};
