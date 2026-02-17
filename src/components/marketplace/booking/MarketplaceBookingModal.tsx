"use client";

import { useState, useEffect, useCallback } from "react";
import { LegacyService as Service, Booking, PricingConfiguration } from "@/lib/database.types";
import { getPricingConfiguration } from "@/lib/pricing/data";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { Discount, PromoCode } from "@/lib/discount-engine";
import { validatePromoCode as validatePromoCodeAPI } from "@/lib/supabase-data";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Step components
import { BookingStep1 } from "./steps/BookingStep1";
import { BookingStep2 } from "./steps/BookingStep2";
import { BookingStep3 } from "./steps/BookingStep3";
import { BookingStep4 } from "./steps/BookingStep4";

interface BookingModalProps {
    service: Service;
    pricingConfig?: PricingConfiguration | null;
    initialSelections?: any;
    initialStepQuantities?: any;
    initialGlobalQuantity?: number;
    subdomain?: string;
    isQuoteMode?: boolean;
    triggerLabel?: string;
}

export function MarketplaceBookingModal({ service, pricingConfig: initialConfig, initialSelections, initialStepQuantities, initialGlobalQuantity, subdomain, isQuoteMode = false, triggerLabel = "Book Now" }: BookingModalProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    // ... (lines 33-228 unchanged, handled by context or we skip them in replacement if possible, but replace_file_content works on contiguous blocks)
    // Actually, I can just replace the Interface and the Handler separate? 
    // No, replace_file_content works on a single block. 
    // I will use multi_replace for safety.

    // Changing strategy to multi_replace to avoid replacing the big middle chunk.
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [bookingData, setBookingData] = useState<Partial<Booking>>({
        service_id: service.id,
        service_name: service.title,
        organizer_id: service.organizerId,
    });

    const [pricingConfig, setPricingConfig] = useState<PricingConfiguration | null>(initialConfig || null);
    const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
    const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
    const [discountAmount, setDiscountAmount] = useState<number>(0);
    const [livePreview, setLivePreview] = useState<{
        subtotal: number;
        total: number;
    }>({ subtotal: 0, total: 0 });

    useEffect(() => {
        const loadData = async () => {
            // Fetch Pricing Config if not provided
            if (!initialConfig) {
                const config = await getPricingConfiguration(service.id);
                setPricingConfig(config);
            }
        };
        if (isOpen) {
            loadData();
        }
    }, [service.id, isOpen, initialConfig]);

    // Fetch pricing from server when selections change or prompt code applies
    // Fetch pricing from server when selections change or prompt code applies
    const refreshPricing = async (
        tempData: Partial<Booking> = bookingData,
        promoCode?: string
    ) => {
        // If we have a pricing config, we rely on the DynamicBookingForm for pricing
        if (pricingConfig) return;

        try {
            // Prepare items for API
            // Prepare items for API
            // For Configurable Services, we pass the selection state directly
            const items = [{
                service_id: service.id,
                quantity: tempData.guest_count || 1,
                // Legacy fields removed/minimized
                selection_state: tempData.selection_state,
                step_quantities: tempData.step_quantities
            }];

            const response = await fetch('/api/checkout/calculate-price', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items,
                    promoCode: promoCode || null, // Pass explicit promo code if provided
                    userId: null // Optional, user might not be logged in yet
                })
            });

            const result = await response.json();

            if (result.success && result.data) {
                const priceData = result.data;
                const breakdownItem = priceData.breakdown && priceData.breakdown.length > 0 ? priceData.breakdown[0] : null;

                if (!breakdownItem) {
                    console.error("No breakdown returned for service");
                    return;
                }

                // Map API response to BookingData
                setBookingData(prev => ({
                    ...prev,
                    ...tempData,
                    total_price: priceData.final_total,
                    subtotal: breakdownItem.subtotal,
                    discount_amount: priceData.discount_amount,
                    original_price: priceData.base_total,

                    // --- SNAPSHOTS ---
                    configuration_snapshot: pricingConfig || undefined,
                    selection_state: tempData.selection_state,
                    step_quantities: tempData.step_quantities,

                    pricing_breakdown: {
                        pricing_model: 'fixed',
                        base_amount: 0,
                        guest_count: 1,
                        subtotal: breakdownItem.subtotal,
                        total: priceData.final_total,
                        total_amount: priceData.final_total,
                    },
                    promo_code_id: priceData.discount_applied?.type === 'promo_code' ? priceData.discount_applied.id : null,
                    discount_id: priceData.discount_applied?.type === 'discount' ? priceData.discount_applied.id : null
                }));

                setDiscountAmount(priceData.discount_amount);

                // Update local discount states for UI badges
                if (priceData.discount_applied) {
                    if (priceData.discount_applied.type === 'promo_code') {
                        setAppliedPromo({ code: priceData.discount_applied.name, id: priceData.discount_applied.id } as unknown as PromoCode);
                        setAppliedDiscount(null);
                    } else {
                        setAppliedDiscount({ name: priceData.discount_applied.name, id: priceData.discount_applied.id } as unknown as Discount);
                        setAppliedPromo(null);
                    }
                } else {
                    setAppliedPromo(null);
                    setAppliedDiscount(null);
                }
            }
        } catch (error) {
            console.error("Failed to calculate price:", error);
        }
    };

    // Initial pricing fetch
    useEffect(() => {
        refreshPricing();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step]); // Refresh when stepping? Or better when dependencies change?

    // We can also trigger on specific dependency changes if step doesn't cover it
    // But handleNext calls setBookingData usually.
    // Let's rely on handleNext triggering an update or specific events.


    const handleNext = async (data: Partial<Booking>) => {
        const updatedData = {
            ...bookingData,
            ...data
        };

        // Update local state immediately
        setBookingData(updatedData);

        // Refresh pricing from API if needed (will skip if pricingConfig exists)
        await refreshPricing(updatedData, appliedPromo?.code);

        if (step < 4) setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    };

    const handleBack = () => {
        if (step > 1) setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    };

    const close = () => {
        setIsOpen(false);
    };

    const goToStep = (targetStep: 1 | 2 | 3 | 4) => {
        setStep(targetStep);
    };

    // Promo code handlers
    const handleApplyPromo = async (code: string): Promise<{ valid: boolean; error?: string }> => {
        // We use the calculate-price API to validate and apply
        // But for UI feedback, first validate availability?
        // Actually, just calling refreshPricing with promoCode creates the flow.
        // But refreshPricing is void.
        // We might want to wrap it or call API directly here to return status.

        try {
            // Quick validation API call first to give user error feedback
            const result = await validatePromoCodeAPI(code, service.organizerId);
            if (!result.valid) {
                return { valid: false, error: result.error || 'Invalid promo code' };
            }

            // If valid, apply to pricing
            await refreshPricing(bookingData, code);
            return { valid: true };

        } catch (e) {
            console.error(e); // Log error to use 'e'
            return { valid: false, error: "Validation failed" };
        }
    };

    const handleRemovePromo = async () => {
        setAppliedPromo(null);
        await refreshPricing(bookingData, undefined); // Refresh without promo
    };

    const handleLiveUpdate = useCallback((data: { subtotal: number; total: number }) => {
        setLivePreview(data);
    }, []);

    const stepLabels = {
        1: "Customize",
        2: "Date & Time",
        3: "Review",
        4: "Payment"
    };

    const handleBookClick = async () => {
        if (subdomain) {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push(`/storefront/${subdomain}/signup`);
                return;
            }
        }

        setIsOpen(true);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button
                onClick={handleBookClick}
                className="w-full py-6 text-xl font-bold rounded-xl shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
                {triggerLabel}
            </Button>
            <DialogContent className="w-full max-w-[calc(100vw-2rem)] md:max-w-6xl lg:max-w-7xl h-[90vh] max-h-[90vh] overflow-hidden p-0 gap-0 bg-white border-none shadow-2xl rounded-2xl flex flex-col md:flex-row">
                {/* Enhanced Desktop Sidebar with Dark Theme */}
                <aside className="hidden md:flex flex-col w-80 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700 p-6 gap-6 relative overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />

                    {/* Header */}
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <div className="text-xs uppercase tracking-wider text-primary-400 font-semibold mb-1">Booking</div>
                            <div className="text-lg font-bold text-white leading-tight">
                                {service.title.length > 30 ? service.title.substring(0, 30) + '...' : service.title}
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/60 hover:text-white border border-white/20 rounded-full w-9 h-9 flex items-center justify-center text-xs transition hover:bg-white/10"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Enhanced Steps */}
                    <div className="relative z-10 space-y-4">
                        <div className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                            Progress
                        </div>
                        <div className="relative space-y-1">
                            {/* Progress line */}
                            <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-white/10" />

                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="relative">
                                    <button
                                        onClick={() => goToStep(i as 1 | 2 | 3 | 4)}
                                        className="flex items-center gap-3 text-left group w-full py-2"
                                    >
                                        <div
                                            className={cn(
                                                "relative z-10 w-9 h-9 flex items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-300",
                                                step === i
                                                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/50 scale-110"
                                                    : step > i
                                                        ? "bg-emerald-500 border-emerald-500 text-white"
                                                        : "border-white/20 bg-white/5 text-white/40"
                                            )}
                                        >
                                            {step > i ? <Check className="w-4 h-4" /> : i}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs text-white/40 uppercase tracking-wider">
                                                {stepLabels[i as keyof typeof stepLabels]}
                                            </div>
                                            <div className={cn(
                                                "text-sm font-medium transition-colors",
                                                step >= i ? "text-white" : "text-white/30"
                                            )}>
                                                {i === 1 && "Configure service"}
                                                {i === 2 && "Schedule event"}
                                                {i === 3 && "Review details"}
                                                {i === 4 && "Complete booking"}
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Premium Pricing Card */}
                    <div className="relative z-10 mt-auto space-y-3">
                        <div className="flex items-center justify-between text-xs text-white/60">
                            <span>Live Preview</span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                {step === 1 && livePreview.total > 0 ? "Updating" : "Ready"}
                            </span>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 space-y-3 shadow-xl">
                            {/* Breakdown */}
                            {!isQuoteMode && (
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-white/80 transition-all duration-300">
                                        <span>Subtotal</span>
                                        <span className="font-semibold">
                                            ${(step === 1 && livePreview.subtotal > 0 ? livePreview.subtotal : bookingData.subtotal || 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {!isQuoteMode && <div className="h-px bg-white/20" />}

                            {/* Total with emphasis */}
                            <div className="flex items-baseline justify-between">
                                <span className="text-sm text-white/60">{isQuoteMode ? "Status" : "Total"}</span>
                                <div className="text-right">
                                    {isQuoteMode ? (
                                        <div className="text-xl font-bold text-white transition-all duration-300">
                                            Quote Request
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-3xl font-black text-white transition-all duration-300">
                                                ${(step === 1 && livePreview.total > 0 ? livePreview.total : bookingData.total_price || 0).toFixed(2)}
                                            </div>
                                            <div className="text-xs text-white/40 uppercase tracking-wider">CAD</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col max-h-[90vh]">
                    {/* Mobile Header */}
                    <div className="md:hidden flex items-center justify-between px-4 pt-4 pb-2 border-b border-slate-200 bg-white">
                        <div>
                            <div className="text-xs uppercase tracking-wider text-primary font-semibold mb-0.5">Booking</div>
                            <DialogTitle className="text-sm font-semibold text-slate-900">
                                {service.title.substring(0, 25)}...
                            </DialogTitle>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-slate-400 hover:text-slate-600 border border-slate-200 rounded-full w-8 h-8 flex items-center justify-center text-xs transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Mobile Step Indicator */}
                    <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <span className="font-semibold">Step {step} · {stepLabels[step]}</span>
                            <span className="text-slate-400">of 4</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "h-1 w-8 rounded-full transition-colors",
                                        step >= i ? "bg-primary" : "bg-slate-200"
                                    )}
                                ></div>
                            ))}
                        </div>
                    </div>

                    {/* Content Area - Scrollable */}
                    <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-4 md:pb-6 pt-3 md:pt-6 custom-scrollbar">
                        {step === 1 && <BookingStep1
                            service={service}
                            pricingConfig={pricingConfig}
                            bookingData={bookingData}
                            onNext={handleNext}
                            onLiveUpdate={handleLiveUpdate}
                            initialSelections={initialSelections}
                            initialStepQuantities={initialStepQuantities}
                            initialGlobalQuantity={initialGlobalQuantity}
                            isQuoteMode={isQuoteMode}
                        />}
                        {step === 2 && <BookingStep2 service={service} bookingData={bookingData} onNext={handleNext} onBack={handleBack} />}
                        {step === 3 && (
                            <BookingStep3
                                service={service}
                                bookingData={bookingData}
                                onNext={handleNext}
                                onBack={handleBack}
                                appliedDiscount={appliedDiscount}
                                appliedPromo={appliedPromo}
                                discountAmount={discountAmount}
                                onApplyPromo={handleApplyPromo}
                                onRemovePromo={handleRemovePromo}
                                isQuoteMode={isQuoteMode}
                            />
                        )}
                        {step === 4 && <BookingStep4 service={service} pricingConfig={pricingConfig} bookingData={bookingData} onClose={close} isQuoteMode={isQuoteMode} />}
                    </div>
                </div>
            </DialogContent>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.05);
                    border-radius: 10px;
                    margin: 8px 0;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 100%);
                    border-radius: 10px;
                    border: 2px solid transparent;
                    background-clip: padding-box;
                    transition: all 0.2s ease;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 80%);
                    border-width: 1px;
                    box-shadow: 0 0 8px hsla(var(--primary), 0.3);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:active {
                    background: hsl(var(--primary));
                }
                
                /* Firefox scrollbar */
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: hsl(var(--primary)) rgba(0, 0, 0, 0.05);
                }
                
                /* Smooth scrolling */
                .custom-scrollbar {
                    scroll-behavior: smooth;
                }
            `}</style>
        </Dialog>
    );
}
