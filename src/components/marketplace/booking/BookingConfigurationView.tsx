import { PricingConfiguration } from "@/lib/database.types";
import { ConfigStep, Option, PricingMode } from "@/types/pricing";
import { cn } from "@/lib/utils";
import { isStepVisible, getEffectiveOptionPrice } from "@/lib/pricing/pricing-engine";

interface BookingConfigurationViewProps {
    configuration: PricingConfiguration;
    selectionState: Record<string, string[]>;
    stepQuantities: Record<string, number>;
    currency?: string;
}

export function BookingConfigurationView({
    configuration,
    selectionState,
    stepQuantities,
    currency = "$"
}: BookingConfigurationViewProps) {

    // Sort steps by order
    const steps = [...(configuration.steps || [])].sort((a, b) => a.order - b.order);

    // Mock Service object for the engine
    const serviceContext = {
        ...configuration,
        name: "Configuration Context",
        description: "Generated from Snapshot",
        pricingMode: PricingMode.CONFIGURED,
        basePrice: 0,
        rules: configuration.rules || [],
        steps: configuration.steps || []
    };

    // Calculate subtotal
    let subtotal = 0;

    return (
        <div className="w-full text-sm text-slate-700 space-y-4">
            {/* Header Row */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <span>Item / Service</span>
                <span>Details</span>
                <span>Price</span>
            </div>

            <div className="space-y-4">
                {steps.map(step => {
                    // Check Logic
                    if (!isStepVisible(serviceContext, step.id, selectionState)) return null;

                    const quantity = stepQuantities[step.id] || 0;
                    const selectedOptionIds = selectionState[step.id] || [];
                    const selectedOptions = (step.options || []).filter(opt => selectedOptionIds.includes(opt.id));

                    if (selectedOptions.length === 0 && !step.required) return null;

                    return (
                        <div key={step.id} className="group">
                            {/* Step Name in a subtle header if multiple options, or just standard if single */}

                            {selectedOptions.length > 0 ? (
                                <div className="space-y-2">
                                    {selectedOptions.map((option: Option) => {
                                        const { price: optionPrice, isOverridden } = getEffectiveOptionPrice(serviceContext, option, selectionState);
                                        const stepTotal = optionPrice * (quantity || 1);
                                        subtotal += stepTotal;

                                        return (
                                            <div key={option.id} className="flex items-start justify-between py-1">
                                                <div className="flex-1 pr-4">
                                                    <div className="font-medium text-slate-900">
                                                        {step.name}
                                                        <span className="text-slate-400 font-normal mx-2">•</span>
                                                        <span className="text-slate-700">{option.label}</span>
                                                    </div>
                                                    {quantity > 1 && (
                                                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                                                            {quantity} units @ {currency}{optionPrice}
                                                        </div>
                                                    )}
                                                    {isOverridden && (
                                                        <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Special Price</span>
                                                    )}
                                                </div>
                                                <div className="font-mono font-medium text-slate-900 whitespace-nowrap">
                                                    {currency}{stepTotal.toLocaleString()}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                // Required but missing
                                <div className="flex items-center justify-between py-2 text-amber-600 bg-amber-50/50 px-2 -mx-2 rounded-md">
                                    <span className="font-medium">{step.name}</span>
                                    <span className="text-xs italic">Pending Selection</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Total Footer */}
            <div className="border-t border-slate-900/10 pt-4 mt-6 flex flex-col gap-2">
                <div className="flex justify-between items-center text-base font-bold text-slate-900">
                    <span>Total Estimated</span>
                    <span className="text-xl">{currency}{subtotal.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-slate-400 text-right">
                    Final aggregate based on configuration
                </p>
            </div>
        </div>
    );
}
