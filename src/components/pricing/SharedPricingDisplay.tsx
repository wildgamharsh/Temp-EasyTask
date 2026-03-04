import React from "react";
import { Check } from "lucide-react";
import { ConfigStep, SelectionState } from "@/types/pricing";

interface SharedPricingDisplayProps {
    steps: ConfigStep[];
    selections: SelectionState;
    stepQuantities?: Record<string, number>;
    onSelectionChange?: (stepId: string, optionId: string, type: 'single' | 'multi' | 'quantity' | 'fixed', quantity?: number) => void;
    readonly?: boolean;
    showPricing?: boolean;
    isQuoteMode?: boolean;
    containerClassName?: string;
}

export function SharedPricingDisplay({
    steps,
    selections,
    stepQuantities = {},
    onSelectionChange,
    readonly = false,
    showPricing = true,
    isQuoteMode = false,
    containerClassName = ""
}: SharedPricingDisplayProps) {
    const handleSelectionChange = (stepId: string, optionId: string, type: 'single' | 'multi' | 'quantity' | 'fixed', quantity?: number) => {
        if (readonly || !onSelectionChange) return;
        onSelectionChange(stepId, optionId, type, quantity);
    };

    const isSelected = (stepId: string, optionId: string) => {
        return (selections[stepId] || []).includes(optionId);
    };

    return (
        <div className={containerClassName}>
            {steps.sort((a, b) => a.order - b.order).map(step => {
                const style = step.displayStyle || 'card-standard';

                let gridCols = "grid-cols-1 md:grid-cols-2";
                if (style === 'card-image') gridCols = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
                if (style === 'card-color' || style === 'card-color-pill') gridCols = "flex flex-wrap gap-3";
                if (style === 'card-compact') gridCols = "grid-cols-2 md:grid-cols-3";

                const showCardBorder = !style.includes('color');

                return (
                    <div key={step.id} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex items-baseline justify-between">
                            <div>
                                <label className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    {step.name}
                                    {step.required && <span className="text-red-500 text-xs">*</span>}
                                </label>
                                {step.description && <p className="text-sm text-slate-500 mt-1">{step.description}</p>}
                            </div>
                        </div>

                        {style.startsWith('card-') ? (
                            <div className={style.includes('color') ? "flex flex-wrap gap-3" : `grid ${gridCols} gap-4`}>
                                {step.options.map(option => {
                                    const active = isSelected(step.id, option.id);

                                    if (style === 'card-image') return (
                                        <div
                                            key={option.id}
                                            onClick={() => handleSelectionChange(step.id, option.id, step.selectionType)}
                                            className={`
                                                group relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-300 select-none
                                                ${readonly ? 'pointer-events-none' : ''}
                                                ${active ? 'border-primary ring-2 ring-primary/20 transform scale-[1.02]' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'}
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
                                                {active && (
                                                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[1px]">
                                                        <div className="bg-white rounded-full p-1.5 shadow-sm">
                                                            <Check className="w-5 h-5 text-primary" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3 bg-white">
                                                <div className="font-semibold text-sm text-slate-900 mb-0.5">{option.label}</div>
                                                {!isQuoteMode && showPricing && (
                                                    <div className="text-xs font-bold text-primary">
                                                        {option.baseDelta > 0 ? `+$${option.baseDelta}` : 'Included'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );

                                    if (style === 'card-color') return (
                                        <div
                                            key={option.id}
                                            onClick={() => handleSelectionChange(step.id, option.id, step.selectionType)}
                                            className={`
                                                relative w-12 h-12 rounded-full cursor-pointer transition-transform hover:scale-110 shadow-sm select-none
                                                ${readonly ? 'pointer-events-none' : ''}
                                                ${active ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'ring-1 ring-slate-200'}
                                            `}
                                            style={{ backgroundColor: option.colorHex || '#eee' }}
                                            title={`${option.label} ${!isQuoteMode && showPricing && option.baseDelta > 0 ? `(+$${option.baseDelta})` : ''}`}
                                        >
                                            {active && <Check className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow-md" />}
                                        </div>
                                    );

                                    if (style === 'card-color-pill') return (
                                        <div
                                            key={option.id}
                                            onClick={() => handleSelectionChange(step.id, option.id, step.selectionType)}
                                            className={`
                                                flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-all select-none
                                                ${readonly ? 'pointer-events-none' : ''}
                                                ${active ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 hover:border-slate-300 text-slate-700'}
                                            `}
                                        >
                                            <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: option.colorHex || '#eee' }} />
                                            <span className="text-sm font-medium">{option.label}</span>
                                        </div>
                                    );

                                    return (
                                        <div
                                            key={option.id}
                                            onClick={() => {
                                                if (readonly || step.selectionType === 'quantity') return;
                                                handleSelectionChange(step.id, option.id, step.selectionType);
                                            }}
                                            className={`
                                                relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between select-none
                                                ${readonly ? 'pointer-events-none' : ''}
                                                ${active ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}
                                                ${style === 'card-compact' ? 'min-h-[80px]' : 'min-h-[120px]'}
                                            `}
                                        >
                                            <div>
                                                <div className="flex justify-between items-start mb-2 gap-2">
                                                    <span className="font-bold text-slate-900 text-sm leading-tight">{option.label}</span>
                                                    {active && step.selectionType !== 'quantity' && <div className="bg-primary text-white rounded-full p-0.5"><Check className="w-3 h-3" /></div>}
                                                </div>
                                                {style !== 'card-compact' && option.description && (
                                                    <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{option.description}</p>
                                                )}
                                            </div>

                                            <div className="mt-auto flex items-center justify-between">
                                                {!isQuoteMode && showPricing && (
                                                    <span className="font-bold text-primary text-sm">
                                                        {option.baseDelta > 0 ? `+$${option.baseDelta}` : (option.baseDelta < 0 ? `-$${Math.abs(option.baseDelta)}` : 'Free')}
                                                    </span>
                                                )}

                                                {step.selectionType === 'quantity' && (
                                                    <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1" onClick={e => e.stopPropagation()}>
                                                        <button
                                                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 border border-transparent hover:border-slate-200 disabled:opacity-50"
                                                            onClick={() => handleSelectionChange(step.id, option.id, 'quantity', Math.max(0, (stepQuantities[step.id] || 0) - 1))}
                                                            disabled={readonly}
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-4 text-center text-sm font-semibold">{stepQuantities[step.id] || 0}</span>
                                                        <button
                                                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 border border-transparent hover:border-slate-200 disabled:opacity-50"
                                                            onClick={() => handleSelectionChange(step.id, option.id, 'quantity', (stepQuantities[step.id] || 0) + 1)}
                                                            disabled={readonly}
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
                        ) : null}

                        {style === 'list-toggle' && (
                            <div className="space-y-2">
                                {step.options.map(option => {
                                    const active = isSelected(step.id, option.id);
                                    return (
                                        <div
                                            key={option.id}
                                            onClick={() => handleSelectionChange(step.id, option.id, step.selectionType)}
                                            className={`
                                                flex items-center justify-between p-3.5 rounded-xl border border-l-4 cursor-pointer transition-all hover:shadow-sm select-none
                                                ${readonly ? 'pointer-events-none' : ''}
                                                ${active ? 'border-primary bg-primary/5 border-l-primary' : 'border-slate-200 border-l-transparent hover:border-slate-300 bg-white'}
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${active ? 'bg-primary border-primary text-white' : 'border-slate-300 text-transparent'}`}>
                                                    <Check className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`font-semibold text-sm ${active ? 'text-primary' : 'text-slate-900'}`}>{option.label}</span>
                                                    {option.description && (
                                                        <span className="text-xs text-slate-500">{option.description}</span>
                                                    )}
                                                </div>
                                            </div>
                                            {!isQuoteMode && showPricing && (
                                                <div className="font-bold text-slate-900 text-sm">
                                                    {option.baseDelta > 0 ? `+$${option.baseDelta}` : 'Free'}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
