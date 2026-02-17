"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ServicePricingModel, ServicePackage, ServiceAddon } from '@/lib/database.types';

// Booking state interface
export interface BookingState {
    // Step 1: Pricing selections
    pricingModel: ServicePricingModel;
    selectedPackageId: string | null;
    selectedPackage: ServicePackage | null;
    selectedAddonIds: string[];
    selectedAddons: ServiceAddon[];
    guestCount: number;
    subtotal: number;
    taxAmount: number;
    total: number;



    // Step 2: Event details
    eventDate: Date | null;
    eventTime: string | null;

    // Step 3: Promo code
    promoCode: string | null;
    promoCodeId: string | null;
    discountAmount: number;
    finalTotal: number;

    // Step 4: Notes
    notes: string;

    // Meta
    currentStep: 1 | 2 | 3 | 4;
    draftId: string | null;
    isLoading: boolean;
}

// Initial state
const initialState: BookingState = {
    pricingModel: 'fixed',
    selectedPackageId: null,
    selectedPackage: null,
    selectedAddonIds: [],
    selectedAddons: [],
    guestCount: 50,
    subtotal: 0,
    taxAmount: 0,
    total: 0,
    eventDate: null,
    eventTime: null,
    promoCode: null,
    promoCodeId: null,
    discountAmount: 0,
    finalTotal: 0,
    notes: '',
    currentStep: 1,
    draftId: null,
    isLoading: false,
};

// Context actions interface
interface BookingContextValue {
    state: BookingState;

    // Step navigation
    goToStep: (step: 1 | 2 | 3 | 4) => void;
    nextStep: () => void;
    previousStep: () => void;

    // Step 1 actions
    setPricingSelections: (data: {
        pricingModel: ServicePricingModel;
        selectedPackageId?: string | null;
        selectedPackage?: ServicePackage | null;
        selectedAddonIds?: string[];
        selectedAddons?: ServiceAddon[];
        guestCount?: number;
        subtotal: number;
        taxAmount: number;
        total: number;
    }) => void;

    // Step 2 actions
    setEventDetails: (date: Date | null, time: string | null) => void;

    // Step 3 actions
    setPromoCode: (code: string | null, codeId: string | null, discount: number) => void;

    // Step 4 actions
    setNotes: (notes: string) => void;

    // Draft management
    saveDraft: () => Promise<void>;
    loadDraft: (draftId: string) => Promise<void>;
    clearDraft: () => void;

    // Reset
    resetBooking: () => void;
}

const BookingContext = createContext<BookingContextValue | undefined>(undefined);

// Provider props
interface BookingProviderProps {
    children: ReactNode;
    serviceId: string;
    organizerId: string;
    initialPricingModel: ServicePricingModel;
    onDraftSave?: (draftId: string) => void;
}

export function BookingProvider({
    children,
    serviceId,
    organizerId,
    initialPricingModel,
    onDraftSave,
}: BookingProviderProps) {
    const [state, setState] = useState<BookingState>({
        ...initialState,
        pricingModel: initialPricingModel,
    });

    // Step navigation
    const goToStep = useCallback((step: 1 | 2 | 3 | 4) => {
        setState(prev => ({ ...prev, currentStep: step }));
    }, []);

    const nextStep = useCallback(() => {
        setState(prev => ({
            ...prev,
            currentStep: Math.min(4, prev.currentStep + 1) as 1 | 2 | 3 | 4,
        }));
    }, []);

    const previousStep = useCallback(() => {
        setState(prev => ({
            ...prev,
            currentStep: Math.max(1, prev.currentStep - 1) as 1 | 2 | 3 | 4,
        }));
    }, []);

    // Step 1: Pricing selections
    const setPricingSelections = useCallback((data: {
        pricingModel: ServicePricingModel;
        selectedPackageId?: string | null;
        selectedPackage?: ServicePackage | null;
        selectedAddonIds?: string[];
        selectedAddons?: ServiceAddon[];
        guestCount?: number;
        subtotal: number;
        taxAmount: number;
        total: number;

    }) => {
        setState(prev => ({
            ...prev,
            pricingModel: data.pricingModel,
            selectedPackageId: data.selectedPackageId ?? prev.selectedPackageId,
            selectedPackage: data.selectedPackage ?? prev.selectedPackage,
            selectedAddonIds: data.selectedAddonIds ?? prev.selectedAddonIds,
            selectedAddons: data.selectedAddons ?? prev.selectedAddons,
            guestCount: data.guestCount ?? prev.guestCount,
            subtotal: data.subtotal,
            taxAmount: data.taxAmount,
            total: data.total,

            finalTotal: data.total - prev.discountAmount,
        }));
    }, []);

    // Step 2: Event details
    const setEventDetails = useCallback((date: Date | null, time: string | null) => {
        setState(prev => ({
            ...prev,
            eventDate: date,
            eventTime: time,
        }));
    }, []);

    // Step 3: Promo code
    const setPromoCode = useCallback((code: string | null, codeId: string | null, discount: number) => {
        setState(prev => ({
            ...prev,
            promoCode: code,
            promoCodeId: codeId,
            discountAmount: discount,
            finalTotal: prev.total - discount,
        }));
    }, []);

    // Step 4: Notes
    const setNotes = useCallback((notes: string) => {
        setState(prev => ({ ...prev, notes }));
    }, []);

    // Save draft to API
    const saveDraft = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true }));

        try {
            const response = await fetch('/api/bookings/draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceId,
                    organizerId,
                    pricingModel: state.pricingModel,
                    selectedPackageId: state.selectedPackageId,
                    selectedAddonIds: state.selectedAddonIds,
                    guestCount: state.guestCount,
                    subtotal: state.subtotal,
                    taxAmount: state.taxAmount,
                    totalAmount: state.total,
                    eventDate: state.eventDate?.toISOString().split('T')[0],
                    eventTime: state.eventTime,
                    promoCodeId: state.promoCodeId,
                    discountAmount: state.discountAmount,
                    notes: state.notes,
                    currentStep: state.currentStep,
                }),
            });

            const data = await response.json();
            if (data.draft) {
                setState(prev => ({ ...prev, draftId: data.draft.id }));
                onDraftSave?.(data.draft.id);
            }
        } catch (error) {
            console.error('Failed to save draft:', error);
        } finally {
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }, [serviceId, organizerId, state, onDraftSave]);

    // Load draft from API
    const loadDraft = useCallback(async (draftId: string) => {
        setState(prev => ({ ...prev, isLoading: true }));

        try {
            const response = await fetch(`/api/bookings/draft?serviceId=${serviceId}`);
            const data = await response.json();

            if (data.draft) {
                const draft = data.draft;
                setState(prev => ({
                    ...prev,
                    draftId: draft.id,
                    pricingModel: draft.pricing_model,
                    selectedPackageId: draft.selected_package_id,
                    selectedAddonIds: draft.selected_addon_ids || [],
                    guestCount: draft.guest_count || 50,
                    subtotal: draft.subtotal || 0,
                    taxAmount: draft.tax_amount || 0,
                    total: draft.total_amount || 0,
                    eventDate: draft.event_date ? new Date(draft.event_date) : null,
                    eventTime: draft.event_time,
                    promoCodeId: draft.promo_code_id,
                    discountAmount: draft.discount_amount || 0,
                    finalTotal: (draft.total_amount || 0) - (draft.discount_amount || 0),
                    notes: draft.notes || '',
                    currentStep: draft.current_step || 1,
                }));
            }
        } catch (error) {
            console.error('Failed to load draft:', error);
        } finally {
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }, [serviceId]);

    // Clear draft
    const clearDraft = useCallback(() => {
        if (state.draftId) {
            fetch(`/api/bookings/draft?draftId=${state.draftId}`, {
                method: 'DELETE',
            }).catch(console.error);
        }
        setState({ ...initialState, pricingModel: initialPricingModel });
    }, [state.draftId, initialPricingModel]);

    // Reset booking
    const resetBooking = useCallback(() => {
        setState({ ...initialState, pricingModel: initialPricingModel });
    }, [initialPricingModel]);

    const value: BookingContextValue = {
        state,
        goToStep,
        nextStep,
        previousStep,
        setPricingSelections,
        setEventDetails,
        setPromoCode,
        setNotes,
        saveDraft,
        loadDraft,
        clearDraft,
        resetBooking,
    };

    return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

// Hook to use booking context
export function useBooking() {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error('useBooking must be used within BookingProvider');
    }
    return context;
}
