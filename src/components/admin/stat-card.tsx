"use client";

import { cn } from "@/lib/utils";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    change?: string;
    trend?: "up" | "down" | "neutral";
    description?: string;
    icon: LucideIcon;
    variant?: "default" | "highlight";
    className?: string;
}

export function StatCard({
    title,
    value,
    change,
    trend = "neutral",
    description,
    icon: Icon,
    variant = "default",
    className,
}: StatCardProps) {
    const isHighlight = variant === "highlight";

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg",
                isHighlight
                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-500"
                    : "bg-white border-slate-200 hover:border-blue-200",
                className
            )}
        >
            {/* Icon */}
            <div
                className={cn(
                    "absolute top-4 right-4 rounded-xl p-2.5",
                    isHighlight
                        ? "bg-white/20"
                        : "bg-blue-50"
                )}
            >
                <Icon
                    className={cn(
                        "h-5 w-5",
                        isHighlight ? "text-white" : "text-blue-600"
                    )}
                />
            </div>

            {/* Content */}
            <div className="space-y-2">
                <p
                    className={cn(
                        "text-sm font-medium",
                        isHighlight ? "text-blue-100" : "text-slate-500"
                    )}
                >
                    {title}
                </p>

                <div className="flex items-baseline gap-2">
                    <span
                        className={cn(
                            "text-3xl font-bold tracking-tight",
                            isHighlight ? "text-white" : "text-slate-900"
                        )}
                    >
                        {value}
                    </span>

                    {change && (
                        <span
                            className={cn(
                                "flex items-center text-xs font-semibold rounded-full px-2 py-0.5",
                                trend === "up" && !isHighlight && "bg-green-100 text-green-700",
                                trend === "down" && !isHighlight && "bg-red-100 text-red-700",
                                trend === "neutral" && !isHighlight && "bg-slate-100 text-slate-600",
                                isHighlight && "bg-white/20 text-white"
                            )}
                        >
                            {trend === "up" && <ArrowUpRight className="h-3 w-3 mr-0.5" />}
                            {trend === "down" && <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                            {change}
                        </span>
                    )}
                </div>

                {description && (
                    <p
                        className={cn(
                            "text-xs",
                            isHighlight ? "text-blue-200" : "text-slate-400"
                        )}
                    >
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}
