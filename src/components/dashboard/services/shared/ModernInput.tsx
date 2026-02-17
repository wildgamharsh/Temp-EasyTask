import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface ModernInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    icon?: LucideIcon;
    wrapperClassName?: string;
    width?: "full" | "half" | "third" | "quarter" | "fixed-sm" | "fixed-md" | "fixed-lg";
}

export const ModernInput = forwardRef<HTMLInputElement, ModernInputProps>(
    (
        {
            className,
            wrapperClassName,
            label,
            error,
            hint,
            icon: Icon,
            width = "full",
            id,
            ...props
        },
        ref
    ) => {
        // Generate flexible ID if not provided
        const inputId = id || `input-${Math.random().toString(36).substring(7)}`;

        const widthClasses = {
            full: "w-full",
            half: "w-full md:w-1/2",
            third: "w-full md:w-1/3",
            quarter: "w-full md:w-1/4",
            "fixed-sm": "w-full md:w-[120px]",
            "fixed-md": "w-full md:w-[240px]",
            "fixed-lg": "w-full md:w-[320px]",
        };

        return (
            <div className={cn("space-y-1.5", widthClasses[width], wrapperClassName)}>
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-xs font-semibold text-gray-700 uppercase tracking-wide ml-0.5"
                    >
                        {label} <span className="text-red-500">{props.required && "*"}</span>
                    </label>
                )}
                <div className="relative group">
                    {Icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                            <Icon className="h-4 w-4" />
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            "flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-all duration-200",
                            "placeholder:text-gray-400",
                            "hover:border-blue-300",
                            "focus:border-blue-500 focus:outline-none focus:ring-[3px] focus:ring-blue-500/10",
                            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
                            error && "border-red-300 focus:border-red-500 focus:ring-red-500/10 hover:border-red-400",
                            Icon && "pl-9",
                            className
                        )}
                        {...props}
                    />
                </div>
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

ModernInput.displayName = "ModernInput";
