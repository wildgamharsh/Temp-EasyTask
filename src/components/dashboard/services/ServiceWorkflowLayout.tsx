"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkflowStep {
    id: "general" | "pricing";
    label: string;
    description: string;
}

const STEPS: WorkflowStep[] = [
    {
        id: "general",
        label: "General Info",
        description: "Service identity & visuals",
    },
    {
        id: "pricing",
        label: "Pricing Engine",
        description: "Packages & rates",
    },
];

interface ServiceWorkflowLayoutProps {
    currentStep: "general" | "pricing";
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    onNext?: () => void;
    onBack?: () => void;
    isNextDisabled?: boolean;
    isNextLoading?: boolean;
    nextLabel?: string;
    headerAction?: React.ReactNode;
}

export function ServiceWorkflowLayout({
    currentStep,
    children,
    title,
    subtitle,
    onNext,
    onBack,
    isNextDisabled = false,
    isNextLoading = false,
    nextLabel = "Continue",
    headerAction,
}: ServiceWorkflowLayoutProps) {
    const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col">
            {/* Top Bar */}
            <div className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-blue-200 shadow-md">
                            E
                        </div>
                        <span className="font-semibold text-gray-900 tracking-tight">
                            Service Editor
                        </span>
                    </div>

                    {/* Desktop Stepper */}
                    <div className="hidden md:flex items-center gap-4">
                        {STEPS.map((step, index) => {
                            const isCompleted = index < currentStepIndex;
                            const isActive = index === currentStepIndex;

                            return (
                                <div
                                    key={step.id}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-sm",
                                        isActive
                                            ? "bg-blue-50 text-blue-700 font-medium ring-1 ring-blue-200"
                                            : isCompleted
                                                ? "text-gray-500"
                                                : "text-gray-400"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold border",
                                            isActive
                                                ? "border-blue-600 bg-blue-600 text-white"
                                                : isCompleted
                                                    ? "border-green-600 bg-green-600 text-white border-none"
                                                    : "border-gray-300 text-gray-400"
                                        )}
                                    >
                                        {isCompleted ? <Check className="w-3 h-3" /> : index + 1}
                                    </div>
                                    <span>{step.label}</span>
                                    {index < STEPS.length - 1 && (
                                        <ChevronRight className="w-4 h-4 text-gray-300 ml-2" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="w-auto">{headerAction}</div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 container mx-auto px-4 py-8 max-w-[1600px]">
                {/* Header Section */}
                <div className="mb-8 space-y-1">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        {title}
                    </h1>
                    {subtitle && <p className="text-gray-500">{subtitle}</p>}
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
                    <div className="flex-1 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-gray-50 border-t border-gray-100 p-6 flex items-center justify-between">
                        {onBack ? (
                            <Button
                                variant="ghost"
                                onClick={onBack}
                                className="text-gray-500 hover:text-gray-900 hover:bg-gray-200"
                            >
                                Back
                            </Button>
                        ) : (
                            <div /> // Spacer
                        )}

                        <Button
                            onClick={onNext}
                            disabled={isNextDisabled || isNextLoading}
                            className={cn(
                                "min-w-[140px] shadow-lg shadow-blue-200 transition-all",
                                isNextLoading && "opacity-80"
                            )}
                        >
                            {isNextLoading ? "Processing..." : nextLabel}
                            {!isNextLoading && <ChevronRight className="w-4 h-4 ml-1" />}
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
