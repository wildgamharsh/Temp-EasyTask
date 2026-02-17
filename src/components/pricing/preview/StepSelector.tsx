import React from 'react';
import { ConfigStep, Service, SelectionState, QuantityState } from '@/types/pricing';
import { getEffectiveOptionPrice, isOptionDisabled } from '@/lib/pricing/pricing-engine';
import { Check, Lock, Image as ImageIcon, Users } from 'lucide-react';

interface Props {
    service: Service;
    step: ConfigStep;
    selections: SelectionState;
    stepQuantities: QuantityState;
    onSelect: (stepId: string, optionId: string) => void;
    onQuantityChange: (stepId: string, value: number) => void;
}

export const StepSelector: React.FC<Props> = ({
    service,
    step,
    selections,
    stepQuantities,
    onSelect,
    onQuantityChange
}) => {
    const selectedIds = selections[step.id] || [];

    // --- RENDERERS ---

    const renderPrice = (price: number) => {
        if (price === 0) return <span className="text-xs font-semibold text-slate-400">Included</span>;
        return <span className="text-xs font-semibold text-slate-600">+${price.toLocaleString()}</span>;
    };

    // 1. FIXED TYPE RENDERER
    const renderFixedStep = () => (
        <div className="flex flex-col gap-3">
            {step.options.map(option => {
                const { price } = getEffectiveOptionPrice(service, option, selections);
                return (
                    <div key={option.id} className="flex items-center justify-between p-5 bg-linear-to-r from-slate-50 to-slate-100 border-2 border-slate-200 rounded-2xl opacity-90 cursor-default shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-300 p-2 rounded-xl text-slate-600 shadow-sm">
                                <Lock size={16} />
                            </div>
                            <div>
                                <div className="font-semibold text-slate-700 text-sm">{option.label}</div>
                                <div className="text-xs text-slate-500">Mandatory Charge</div>
                            </div>
                        </div>
                        <div className="font-mono font-medium text-slate-700">
                            ${price.toLocaleString()}
                        </div>
                    </div>
                )
            })}
        </div>
    );

    const renderToggleList = () => (
        <div className="flex flex-col gap-3">
            {step.options.map(option => {
                const isSelected = selectedIds.includes(option.id);
                const isDisabled = isOptionDisabled(service, option.id, selections);
                const { price, isOverridden } = getEffectiveOptionPrice(service, option, selections);

                return (
                    <div
                        key={option.id}
                        className={`flex items-center justify-between p-4 border rounded-xl transition-colors ${isDisabled ? 'bg-slate-50 opacity-60' : 'bg-white hover:border-blue-200'
                            } ${isSelected ? 'border-blue-500 bg-blue-50/20' : 'border-slate-200'}`}
                    >
                        <div className="flex-1 pr-4">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`font-medium ${isDisabled ? 'text-slate-400' : 'text-slate-900'}`}>
                                    {option.label}
                                </span>
                                {isOverridden && !isDisabled && (
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                        Adjusted
                                    </span>
                                )}
                                {isDisabled && <Lock size={14} className="text-slate-400" />}
                            </div>
                            {option.description && (
                                <p className="text-xs text-slate-500">
                                    {isDisabled ? 'Not available with current selection' : option.description}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <div className={`flex flex-col items-end ${isOverridden ? 'text-amber-600' : ''}`}>
                                {renderPrice(price)}
                            </div>

                            {/* Toggle Switch */}
                            <button
                                onClick={() => !isDisabled && onSelect(step.id, option.id)}
                                disabled={isDisabled}
                                className={`
                                w-11 h-6 rounded-full transition-colors duration-200 ease-in-out relative
                                ${isDisabled ? 'bg-slate-200 cursor-not-allowed' : isSelected ? 'bg-blue-600' : 'bg-slate-300 hover:bg-slate-400'}
                            `}
                            >
                                <span className={`
                                absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200
                                ${isSelected ? 'translate-x-5' : 'translate-x-0'}
                            `} />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const renderStandardCards = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {step.options.map(option => {
                const isSelected = selectedIds.includes(option.id);
                const isDisabled = isOptionDisabled(service, option.id, selections);
                const { price, isOverridden } = getEffectiveOptionPrice(service, option, selections);

                return (
                    <button
                        key={option.id}
                        onClick={() => !isDisabled && onSelect(step.id, option.id)}
                        disabled={isDisabled}
                        className={`
                  relative flex flex-col p-4 text-left border rounded-xl transition-all duration-200
                  ${isDisabled
                                ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                                : isSelected
                                    ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-sm'
                                    : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
                            }
                `}
                    >
                        <div className="flex justify-between w-full items-start mb-1">
                            <span className={`font-medium ${isDisabled ? 'text-slate-400' : 'text-slate-900'}`}>
                                {option.label}
                            </span>
                            {isSelected && <Check size={18} className="text-blue-600" />}
                            {isDisabled && <Lock size={16} className="text-slate-400" />}
                        </div>

                        <div className="text-sm text-slate-500 mb-4 min-h-[1.5em]">
                            {isDisabled ? 'Not available' : (option.description || '')}
                        </div>

                        <div className="mt-auto pt-3 border-t border-slate-100 w-full flex justify-between items-center">
                            <div className={`${isOverridden ? 'text-amber-600' : ''}`}>
                                {renderPrice(price)}
                            </div>
                            {isOverridden && !isDisabled && (
                                <span className="text-[10px] uppercase tracking-wider font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                    Updated
                                </span>
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );

    const renderCompactCards = () => (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {step.options.map(option => {
                const isSelected = selectedIds.includes(option.id);
                const isDisabled = isOptionDisabled(service, option.id, selections);
                const { price } = getEffectiveOptionPrice(service, option, selections);

                return (
                    <button
                        key={option.id}
                        onClick={() => !isDisabled && onSelect(step.id, option.id)}
                        disabled={isDisabled}
                        className={`
                  flex flex-col items-center justify-center p-3 text-center border rounded-lg transition-all
                  ${isDisabled
                                ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                                : isSelected
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md transform scale-[1.02]'
                                    : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                            }
                `}
                    >
                        <span className={`text-sm font-bold mb-1 leading-tight ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                            {option.label}
                        </span>
                        <span className={`text-xs ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                            {price > 0 ? `+$${price}` : 'Incl.'}
                        </span>
                    </button>
                );
            })}
        </div>
    );

    const renderColorCards = () => (
        <div className="flex flex-wrap gap-4">
            {step.options.map(option => {
                const isSelected = selectedIds.includes(option.id);
                const isDisabled = isOptionDisabled(service, option.id, selections);
                const { price } = getEffectiveOptionPrice(service, option, selections);
                const color = option.colorHex || '#e2e8f0';

                return (
                    <button
                        key={option.id}
                        onClick={() => !isDisabled && onSelect(step.id, option.id)}
                        disabled={isDisabled}
                        className={`
                        group relative w-32 h-36 border rounded-2xl flex flex-col items-center p-2 transition-all
                         ${isDisabled
                                ? 'opacity-50 cursor-not-allowed border-slate-100'
                                : isSelected
                                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                            }
                    `}
                    >
                        <div
                            className="w-16 h-16 rounded-full shadow-inner mb-3 border border-black/5"
                            style={{ backgroundColor: color }}
                        />

                        <span className="text-xs font-bold text-slate-800 text-center leading-tight mb-1">
                            {option.label}
                        </span>
                        <span className="text-[10px] text-slate-500">
                            {price > 0 ? `+$${price}` : 'Included'}
                        </span>

                        {isSelected && (
                            <div className="absolute top-2 right-2 bg-blue-600 text-white p-0.5 rounded-full">
                                <Check size={10} />
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );

    const renderColorPills = () => (
        <div className="flex flex-wrap gap-3">
            {step.options.map(option => {
                const isSelected = selectedIds.includes(option.id);
                const isDisabled = isOptionDisabled(service, option.id, selections);
                const { price } = getEffectiveOptionPrice(service, option, selections);
                const color = option.colorHex || '#e2e8f0';

                return (
                    <button
                        key={option.id}
                        onClick={() => !isDisabled && onSelect(step.id, option.id)}
                        disabled={isDisabled}
                        style={isSelected && !isDisabled ? { borderColor: color, backgroundColor: `${color}15` } : {}}
                        className={`
                        flex items-center gap-3 pl-1 pr-4 py-1 rounded-full border transition-all
                         ${isDisabled
                                ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50'
                                : isSelected
                                    ? 'border-2' // Border color set via inline style for dynamic hex
                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                            }
                    `}
                    >
                        <div
                            className="w-8 h-8 rounded-full shadow-sm border border-black/5"
                            style={{ backgroundColor: color }}
                        />

                        <div className="flex flex-col items-start">
                            <span className={`text-sm font-medium leading-tight ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                                {option.label}
                            </span>
                            {price > 0 && (
                                <span className="text-[10px] text-slate-500">
                                    +${price}
                                </span>
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );

    const renderIconCards = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {step.options.map(option => {
                const isSelected = selectedIds.includes(option.id);
                const isDisabled = isOptionDisabled(service, option.id, selections);
                const { price, isOverridden } = getEffectiveOptionPrice(service, option, selections);

                return (
                    <button
                        key={option.id}
                        onClick={() => !isDisabled && onSelect(step.id, option.id)}
                        disabled={isDisabled}
                        className={`
                        flex items-center gap-3 p-3 text-left border rounded-xl transition-all
                         ${isDisabled
                                ? 'opacity-60 cursor-not-allowed border-slate-100 bg-slate-50'
                                : isSelected
                                    ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-500'
                                    : 'border-slate-200 hover:border-blue-300 hover:bg-white hover:shadow-sm'
                            }
                    `}
                    >
                        <div className="w-12 h-12 shrink-0 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                            {option.image ? (
                                <img src={option.image} alt={option.label} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <ImageIcon size={20} />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-slate-900 truncate mb-0.5">
                                {option.label}
                            </div>
                            <div className={`text-xs ${isOverridden ? 'text-amber-600 font-medium' : 'text-slate-500'}`}>
                                {price === 0 ? 'Included' : `+$${price.toLocaleString()}`}
                            </div>
                        </div>

                        {isSelected && (
                            <div className="bg-blue-600 text-white p-1 rounded-full">
                                <Check size={12} />
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );

    const renderImageCards = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {step.options.map(option => {
                const isSelected = selectedIds.includes(option.id);
                const isDisabled = isOptionDisabled(service, option.id, selections);
                const { price, isOverridden } = getEffectiveOptionPrice(service, option, selections);

                return (
                    <button
                        key={option.id}
                        onClick={() => !isDisabled && onSelect(step.id, option.id)}
                        disabled={isDisabled}
                        className={`
                        group relative border rounded-xl overflow-hidden transition-all text-left flex flex-col
                        ${isDisabled
                                ? 'opacity-60 cursor-not-allowed border-slate-200'
                                : isSelected
                                    ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2'
                                    : 'border-slate-200 hover:border-blue-300 hover:shadow-lg'
                            }
                    `}
                    >
                        {/* Image Area */}
                        <div className="h-32 w-full bg-slate-100 relative overflow-hidden">
                            {option.image ? (
                                <img src={option.image} alt={option.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <ImageIcon size={32} />
                                </div>
                            )}

                            {/* Selection Overlay */}
                            {isSelected && (
                                <div className="absolute inset-0 bg-blue-900/10 flex items-center justify-center">
                                    <div className="bg-blue-600 text-white p-1.5 rounded-full shadow-sm">
                                        <Check size={20} />
                                    </div>
                                </div>
                            )}

                            {isDisabled && (
                                <div className="absolute inset-0 bg-slate-100/50 backdrop-blur-[1px] flex items-center justify-center">
                                    <Lock size={20} className="text-slate-500" />
                                </div>
                            )}
                        </div>

                        {/* Content Area */}
                        <div className="p-3 bg-white flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-slate-800 text-sm leading-tight">{option.label}</span>
                            </div>
                            <p className="text-xs text-slate-500 mb-2 line-clamp-2">{option.description}</p>

                            <div className="mt-auto pt-2 border-t border-slate-100 flex justify-between items-center">
                                <span className={`text-sm font-medium ${isOverridden ? 'text-amber-600' : 'text-slate-600'}`}>
                                    {price === 0 ? 'Included' : `+$${price.toLocaleString()}`}
                                </span>
                                {isOverridden && !isDisabled && (
                                    <span className="text-[10px] uppercase font-bold text-amber-600">Updated</span>
                                )}
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );

    // 2. QUANTITY TYPE RENDERER (Per Person / Custom Count)
    const renderQuantityStep = () => {
        const quantity = stepQuantities[step.id] || 0;

        const renderOptions = () => {
             switch (step.displayStyle) {
                 case 'card-image': return renderImageCards();
                 case 'card-compact': return renderCompactCards();
                 case 'card-standard': return renderStandardCards();
                 case 'card-icon': return renderIconCards();
                 case 'list-toggle': return renderToggleList();
                 default: return renderStandardCards(); 
             }
        };

        return (
            <div className="space-y-4">
                {/* Option Selector */}
                {renderOptions()}

                {/* Quantity Input Area */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-700">
                        <Users size={18} />
                        <span className="font-medium text-sm">Enter Quantity / Count</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            min="0"
                            value={quantity === 0 ? '' : quantity}
                            onChange={(e) => onQuantityChange(step.id, parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="w-24 text-right font-mono font-bold text-lg border-slate-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-400">units</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-linear-to-br from-blue-600 to-cyan-600 rounded-xl blur opacity-30" />
                        <span className={`relative flex items-center justify-center w-9 h-9 rounded-xl text-white text-sm font-bold shadow-lg ${step.selectionType === 'fixed' ? 'bg-linear-to-br from-slate-500 to-slate-600' : 'bg-linear-to-br from-blue-600 to-cyan-600'}`}>
                            {step.selectionType === 'fixed' ? <Lock size={14} /> : step.order}
                        </span>
                    </div>
                    {step.name}
                </h3>
            </div>

            {step.selectionType === 'fixed' ? (
                renderFixedStep()
            ) : step.selectionType === 'quantity' ? (
                renderQuantityStep()
            ) : (
                <>
                    {step.displayStyle === 'card-standard' && renderStandardCards()}
                    {step.displayStyle === 'card-compact' && renderCompactCards()}
                    {step.displayStyle === 'card-color' && renderColorCards()}
                    {step.displayStyle === 'card-color-pill' && renderColorPills()}
                    {step.displayStyle === 'card-image' && renderImageCards()}
                    {step.displayStyle === 'card-icon' && renderIconCards()}
                    {step.displayStyle === 'list-toggle' && renderToggleList()}
                </>
            )}
        </div>
    );
};
