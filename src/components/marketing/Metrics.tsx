"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useSpring, useMotionValue } from "framer-motion";

const metrics = [
    {
        id: 1,
        label: "Active Users",
        value: 10000,
        suffix: "+",
        icon: "fa-solid fa-users",
        color: "brand", // maps to brand/blue/indigo based on implementation
        description: "Event pros trusting Zaaro"
    },
    {
        id: 2,
        label: "Satisfaction Rate",
        value: 98,
        suffix: "%",
        icon: "fa-solid fa-face-smile",
        color: "green",
        description: "Client satisfaction score"
    },
    {
        id: 3,
        label: "Events Managed",
        value: 50000,
        suffix: "+",
        icon: "fa-solid fa-calendar-check",
        color: "blue",
        description: "Successful events powered"
    },
    {
        id: 4,
        label: "Average Rating",
        value: 4.9,
        suffix: "★",
        icon: "fa-solid fa-star",
        color: "amber",
        isDecimal: true,
        description: "Based on verified reviews"
    },
];

function Counter({ value, isDecimal = false }: { value: number; isDecimal?: boolean }) {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        stiffness: 50,
        damping: 20,
        duration: 2000,
    });
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [isInView, value, motionValue]);

    useEffect(() => {
        return springValue.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = isDecimal
                    ? latest.toFixed(1)
                    : Math.floor(latest).toLocaleString();
            }
        });
    }, [springValue, isDecimal]);

    return <span ref={ref} />;
}

export default function Metrics() {
    return (
        <section className="py-24 relative overflow-hidden bg-slate-50">
            {/* Background Effects - Refined for Light Theme */}
            <div className="absolute inset-0 opacity-40 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-100 rounded-full blur-[80px] opacity-60"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100 rounded-full blur-[80px] opacity-60"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {metrics.map((metric, index) => (
                        <motion.div
                            key={metric.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="relative group"
                        >
                            <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-brand-500/10 hover:-translate-y-1 transition-all duration-300">
                                <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-xl bg-gradient-to-br from-brand-50 to-indigo-50 border border-brand-100/50 group-hover:scale-110 transition-transform duration-300 text-brand-600`}>
                                    <i className={`${metric.icon} bg-gradient-to-br from-brand-600 to-indigo-600 bg-clip-text text-transparent`}></i>
                                </div>

                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                                        <Counter value={metric.value} isDecimal={metric.isDecimal} />
                                    </span>
                                    <span className="text-2xl font-bold text-brand-600">
                                        {metric.suffix}
                                    </span>
                                </div>

                                <h3 className="text-lg font-semibold text-slate-800 mb-1">
                                    {metric.label}
                                </h3>
                                <p className="text-sm text-slate-500 font-medium">
                                    {metric.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
