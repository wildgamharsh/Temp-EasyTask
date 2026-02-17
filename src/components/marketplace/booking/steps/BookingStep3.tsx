"use client";

import { Booking, Service, TaxRate } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PricingBreakdown } from "../PricingBreakdown";
import { PromoCodeInput } from "@/components/discount/PromoCodeInput";
import { Discount, PromoCode } from "@/lib/discount-engine";

interface BookingStepProps {
    service: any;
    bookingData: Partial<Booking>;
    onNext: (data: Partial<Booking>) => void;
    onBack: () => void;
    appliedDiscount?: Discount | null;
    appliedPromo?: PromoCode | null;
    discountAmount?: number;
    onApplyPromo?: (code: string) => Promise<{ valid: boolean; error?: string }>;
    onRemovePromo?: () => void;
    isQuoteMode?: boolean;
}

export function BookingStep3({
    service,
    bookingData,
    onNext,
    onBack,
    appliedDiscount,
    appliedPromo,
    discountAmount = 0,
    onApplyPromo,
    onRemovePromo,
    isQuoteMode
}: BookingStepProps) {

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold text-slate-900 pt-2">{isQuoteMode ? "Review Quote Request" : "Review Your Booking"}</h3>
                <p className="text-sm text-slate-500 mt-1">
                    {isQuoteMode ? "Please review the details before sending your request." : "Please review all details before proceeding to payment."}
                </p>
            </div>

            {/* Booking Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Selected</span>
                    <span className="font-bold text-slate-900 leading-tight">{service.title}</span>
                </div>
                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Schedule</span>
                    <span className="font-bold text-slate-900 leading-tight">
                        {bookingData.event_date ? new Date(bookingData.event_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                        }) : "-"} @ {bookingData.start_time ? (
                            <>
                                {new Date(`2000-01-01T${bookingData.start_time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - {new Date(`2000-01-01T${bookingData.end_time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </>
                        ) : "-"}
                    </span>
                </div>
            </div>

            {/* Order Summary Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm ring-1 ring-slate-100">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Order Summary</h4>
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                </div>

                {bookingData.pricing_breakdown ? (
                    <PricingBreakdown
                        pricingModel={(bookingData.pricing_breakdown?.pricing_model || service.pricing_model) as any}
                        guestCount={bookingData.guest_count}
                        provinceName={service.province}
                        breakdown={bookingData.pricing_breakdown}
                        discountAmount={discountAmount}
                        appliedDiscount={appliedDiscount || appliedPromo ? {
                            type: appliedPromo ? 'promo_code' : 'discount',
                            name: appliedPromo?.name || appliedDiscount?.name || '',
                            discount_type: (appliedPromo?.discount_type || appliedDiscount?.discount_type || 'flat_amount') as any,
                            discount_value: appliedPromo?.discount_value || appliedDiscount?.discount_value || 0
                        } : undefined}
                        isQuoteMode={isQuoteMode}
                    />
                ) : (
                    <div className="p-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-center">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Pricing data not available</p>
                    </div>
                )}
            </div>

            {/* Promo Code Section */}
            {
                onApplyPromo && onRemovePromo && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6">
                        <PromoCodeInput
                            onApply={onApplyPromo}
                            onRemove={onRemovePromo}
                            appliedPromo={appliedPromo}
                        />
                        {(appliedDiscount || appliedPromo) && (
                            <div className="mt-4 p-3 bg-white rounded-xl border border-amber-200">
                                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Discount Applied!</p>
                                <p className="text-sm text-slate-700">
                                    {appliedPromo ? appliedPromo.name : appliedDiscount?.name} - Save ${discountAmount.toFixed(2)}
                                </p>
                            </div>
                        )}
                    </div>
                )
            }

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <Button variant="ghost" onClick={onBack} className="gap-2 text-slate-500 hover:text-slate-900 rounded-xl h-12">
                    <ArrowLeft className="w-4 h-4" />
                    Modify Details
                </Button>
                <Button onClick={() => onNext({})} className="bg-primary hover:bg-primary/90 flex-1 h-12 shadow-xl shadow-primary/20 rounded-xl text-primary-foreground font-bold active:scale-[0.98] transition-all">
                    Continue to Booking
                </Button>
            </div>
        </div >
    );
}
