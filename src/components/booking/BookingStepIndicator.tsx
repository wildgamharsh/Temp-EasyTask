"use client";

import React from 'react';
import { Check } from 'lucide-react';
import { useBooking } from '@/contexts/BookingContext';
import { cn } from '@/lib/utils';

const steps = [
    { number: 1, title: 'Customize', shortTitle: 'Service' },
    { number: 2, title: 'Plan', shortTitle: 'Event' },
    { number: 3, title: 'Review', shortTitle: 'Details' },
    { number: 4, title: 'Payment', shortTitle: 'Confirm' },
] as const;

export function BookingStepIndicator() {
    const { state, goToStep } = useBooking();
    const { currentStep } = state;

    const canNavigateToStep = (stepNumber: number): boolean => {
        // Can always go back to previous steps
        if (stepNumber < currentStep) return true;

        // Can't skip ahead
        if (stepNumber > currentStep) return false;

        return true;
    };

    return (
        <div className="w-full">
            {/* Desktop view */}
            <div className="hidden md:flex items-center justify-between">
                {steps.map((step, index) => {
                    const isActive = currentStep === step.number;
                    const isComplete = currentStep > step.number;
                    const canNavigate = canNavigateToStep(step.number);

                    return (
                        <React.Fragment key={step.number}>
                            {/* Step circle */}
                            <button
                                onClick={() => canNavigate && goToStep(step.number as 1 | 2 | 3 | 4)}
                                disabled={!canNavigate}
                                className={cn(
                                    "flex flex-col items-center gap-2 transition-all",
                                    canNavigate && "cursor-pointer hover:scale-105",
                                    !canNavigate && "cursor-not-allowed opacity-50"
                                )}
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all",
                                    isActive && "bg-pink-500 text-white shadow-lg shadow-pink-500/30 ring-4 ring-pink-100",
                                    isComplete && "bg-pink-500 text-white",
                                    !isActive && !isComplete && "bg-gray-200 text-gray-600"
                                )}>
                                    {isComplete ? (
                                        <Check className="w-6 h-6" />
                                    ) : (
                                        step.number
                                    )}
                                </div>
                                <div className="text-center">
                                    <p className={cn(
                                        "text-sm font-semibold",
                                        isActive && "text-pink-600",
                                        isComplete && "text-pink-500",
                                        !isActive && !isComplete && "text-gray-500"
                                    )}>
                                        {step.title}
                                    </p>
                                    <p className="text-xs text-gray-400">{step.shortTitle}</p>
                                </div>
                            </button>

                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div className={cn(
                                    "flex-1 h-1 mx-4 rounded-full transition-all",
                                    currentStep > step.number ? "bg-pink-500" : "bg-gray-200"
                                )} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Mobile view */}
            <div className="md:hidden">
                <div className="flex items-center justify-between mb-4">
                    {steps.map((step, index) => {
                        const isActive = currentStep === step.number;
                        const isComplete = currentStep > step.number;

                        return (
                            <React.Fragment key={step.number}>
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                                    isActive && "bg-pink-500 text-white shadow-lg shadow-pink-500/30",
                                    isComplete && "bg-pink-500 text-white",
                                    !isActive && !isComplete && "bg-gray-200 text-gray-600 text-sm"
                                )}>
                                    {isComplete ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        step.number
                                    )}
                                </div>

                                {index < steps.length - 1 && (
                                    <div className={cn(
                                        "flex-1 h-1 mx-2 rounded-full transition-all",
                                        currentStep > step.number ? "bg-pink-500" : "bg-gray-200"
                                    )} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Current step title */}
                <div className="text-center">
                    <p className="text-lg font-bold text-pink-600">
                        {steps[currentStep - 1].title}
                    </p>
                    <p className="text-sm text-gray-500">
                        Step {currentStep} of {steps.length}
                    </p>
                </div>
            </div>
        </div>
    );
}
