"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
    id: string;
    label: string;
    isComplete: boolean;
}

interface ProgressStepperProps {
    steps: Step[];
    currentStepId: string;
    onStepClick?: (stepId: string) => void;
}

export function ProgressStepper({
    steps,
    currentStepId,
    onStepClick,
}: ProgressStepperProps) {
    const currentIndex = steps.findIndex((s) => s.id === currentStepId);

    return (
        <div className="w-full py-6">
            {/* Desktop: Horizontal Stepper */}
            <div className="hidden md:flex items-center justify-between">
                {steps.map((step, index) => {
                    const isActive = step.id === currentStepId;
                    const isPast = index < currentIndex;
                    const isClickable = onStepClick && (isPast || step.isComplete);

                    return (
                        <React.Fragment key={step.id}>
                            {/* Step Circle */}
                            <button
                                type="button"
                                onClick={() => isClickable && onStepClick(step.id)}
                                disabled={!isClickable}
                                className={cn(
                                    "flex flex-col items-center gap-2 transition-all",
                                    isClickable ? "cursor-pointer" : "cursor-default"
                                )}
                            >
                                <div
                                    className={cn(
                                        "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                                        isActive &&
                                        "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110",
                                        step.isComplete &&
                                        !isActive &&
                                        "border-blue-600 bg-blue-600 text-white",
                                        !isActive &&
                                        !step.isComplete &&
                                        "border-gray-300 bg-white text-gray-400"
                                    )}
                                >
                                    {step.isComplete && !isActive ? (
                                        <Check className="h-5 w-5" />
                                    ) : (
                                        <span className="text-sm font-semibold">
                                            {index + 1}
                                        </span>
                                    )}
                                    {isActive && (
                                        <span className="absolute -inset-1 rounded-full bg-blue-600 opacity-20 animate-pulse" />
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        "text-xs font-medium transition-colors",
                                        isActive && "text-blue-600 font-semibold",
                                        step.isComplete &&
                                        !isActive &&
                                        "text-gray-700",
                                        !isActive &&
                                        !step.isComplete &&
                                        "text-gray-400"
                                    )}
                                >
                                    {step.label}
                                </span>
                            </button>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div
                                    className={cn(
                                        "flex-1 h-0.5 mx-2 transition-all",
                                        index < currentIndex
                                            ? "bg-blue-600"
                                            : "bg-gray-200"
                                    )}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Mobile: Vertical Compact Stepper */}
            <div className="md:hidden space-y-2">
                {steps.map((step, index) => {
                    const isActive = step.id === currentStepId;
                    const isPast = index < currentIndex;

                    return (
                        <div
                            key={step.id}
                            className={cn(
                                "flex items-center gap-3 p-2 rounded-lg transition-all",
                                isActive && "bg-blue-50"
                            )}
                        >
                            <div
                                className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-full border-2 shrink-0 transition-all",
                                    isActive &&
                                    "border-blue-600 bg-blue-600 text-white",
                                    step.isComplete &&
                                    !isActive &&
                                    "border-blue-600 bg-blue-600 text-white",
                                    !isActive &&
                                    !step.isComplete &&
                                    "border-gray-300 bg-white text-gray-400"
                                )}
                            >
                                {step.isComplete && !isActive ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <span className="text-xs font-semibold">
                                        {index + 1}
                                    </span>
                                )}
                            </div>
                            <span
                                className={cn(
                                    "text-sm font-medium transition-colors",
                                    isActive && "text-blue-600 font-semibold",
                                    step.isComplete &&
                                    !isActive &&
                                    "text-gray-700",
                                    !isActive &&
                                    !step.isComplete &&
                                    "text-gray-400"
                                )}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
