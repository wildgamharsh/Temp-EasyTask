
import { useState, useEffect } from "react";
import { LegacyService as Service, Booking, ServicePackage, ServiceAddon, PricingConfiguration } from "@/lib/database.types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Info, Users, Package, Check, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingBreakdown } from "../PricingBreakdown";
import { cn } from "@/lib/utils";
import { DynamicBookingForm } from "./DynamicBookingForm";

interface BookingStepProps {
    service: any;
    pricingConfig?: PricingConfiguration | null;
    bookingData: Partial<Booking>;
    onNext: (data: Partial<Booking>) => void;
    onBack?: () => void;
    onClose?: () => void;
    onLiveUpdate?: (data: { subtotal: number; tax: number; total: number }) => void;
    initialSelections?: any;
    initialStepQuantities?: any;
    initialGlobalQuantity?: number;
    isQuoteMode?: boolean;
}

export function BookingStep1({ service, pricingConfig, bookingData, onNext, onLiveUpdate, initialSelections, initialStepQuantities, initialGlobalQuantity, isQuoteMode }: BookingStepProps) {
    // If we have a new Pricing Configuration, use the Dynamic Form
    if (pricingConfig) {
        return (
            <DynamicBookingForm
                service={service}
                config={pricingConfig}
                bookingData={bookingData}
                onNext={onNext}
                onLiveUpdate={onLiveUpdate}
                initialSelections={initialSelections}
                initialStepQuantities={initialStepQuantities}
                initialGlobalQuantity={initialGlobalQuantity}
                isQuoteMode={isQuoteMode}
            />
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Info className="w-6 h-6 text-amber-600" />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-slate-900">Pricing Configuration Missing</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-xs">
                    This service does not have a valid pricing configuration attached. Please contact the organizer.
                </p>
            </div>
        </div>
    );
}
