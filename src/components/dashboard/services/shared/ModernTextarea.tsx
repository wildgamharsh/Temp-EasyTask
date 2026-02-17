import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ModernTextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
    wrapperClassName?: string;
}

export const ModernTextarea = forwardRef<HTMLTextAreaElement, ModernTextareaProps>(
    ({ className, wrapperClassName, label, error, hint, id, ...props }, ref) => {
        const inputId = id || `textarea-${Math.random().toString(36).substring(7)}`;

        return (
            <div className={cn("space-y-1.5 w-full", wrapperClassName)}>
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-xs font-semibold text-gray-700 uppercase tracking-wide ml-0.5"
                    >
                        {label} <span className="text-red-500">{props.required && "*"}</span>
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={inputId}
                    className={cn(
                        "flex min-h-[80px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-all duration-200",
                        "placeholder:text-gray-400",
                        "hover:border-blue-300",
                        "focus:border-blue-500 focus:outline-none focus:ring-[3px] focus:ring-blue-500/10",
                        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
                        "resize-y",
                        error && "border-red-300 focus:border-red-500 focus:ring-red-500/10 hover:border-red-400",
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-xs text-red-600 font-medium ml-0.5 animate-in slide-in-from-top-1 fade-in-0 mt-1">
                        {error}
                    </p>
                )}
                {hint && !error && (
                    <p className="text-xs text-gray-500 ml-0.5 mt-1">{hint}</p>
                )}
            </div>
        );
    }
);

ModernTextarea.displayName = "ModernTextarea";
